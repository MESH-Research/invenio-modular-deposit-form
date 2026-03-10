import React, { createContext, useEffect, useMemo, useReducer, useRef } from "react";
import { useFormikContext } from "formik";
import { useStore } from "react-redux";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import {
  Confirm,
  Container,
  Icon,
  Grid,
  Message,
  Modal,
  Transition,
} from "semantic-ui-react";

import { CommunityHeader } from "@js/invenio_rdm_records";
import { FormPage } from "./framing_components/FormPage";
import { FormFooterRegion } from "./framing_components/FormFooterRegion";
import { FormHeaderRegion } from "./framing_components/FormHeaderRegion";
import { FormLeftSidebar } from "./framing_components/FormLeftSidebar";
import { FormRightSidebar } from "./framing_components/FormRightSidebar";
import { RecoveryModal } from "./framing_components/RecoveryModal";
import { findPageIdContainingComponent, focusFirstElement } from "./utils";
import { FormErrorManager } from "./helpers/FormErrorManager";
import {
  formUIStateReducer,
  getInitialFormUIState,
  FORM_UI_ACTION,
} from "./helpers/formUIStateReducer";
import { useCurrentResourceTypeFields } from "./hooks/useCurrentResourceTypeFields";
import { useFormPageNavigation } from "./hooks/useFormPageNavigation";
import { useLocalStorageRecovery } from "./hooks/useLocalStorageRecovery";
import { useIsInViewport } from "./hooks/useIsInViewport";
import { useStickyFooterOverlapFix } from "./hooks/useStickyFooterOverlapFix";

const FormUIStateContext = createContext();

/*
FormLayoutContainer class to provide layout and UI state management.

UI state that may be updated is managed by a single reducer state object,
made available on the formUIState property of the FormUIStateContext.

Static values that aren't updated between page loads (static config,
record, permissions, language, etc.) live in the Redux store.

(The separation of concerns isn't quite so neat since state related to
API operations--files, selected community--are also managed by Redux
and may be updated.)
*/
const FormLayoutContainer = () => {
  const store = useStore();
  const { config, record, editorState } = store.getState().deposit ?? {};

  const componentsRegistry = config?.componentsRegistry ?? {};
  const commonFields = config?.common_fields ?? [];
  const currentUserprofile = config?.current_user_profile ?? {};
  const defaultResourceType = config?.default_resource_type;
  const fieldsByType = config?.fields_by_type ?? {};
  const selectedCommunity = editorState?.selectedCommunity;
  const formik = useFormikContext();

  const formHeaderConfig = commonFields.find((item) => item.component === "FormHeader");
  const formLeftSidebarConfig = commonFields.find((item) => item.component === "FormLeftSidebar");
  const formRightSidebarConfig = commonFields.find((item) => item.component === "FormRightSidebar");
  const formFooterConfig = commonFields.find((item) => item.component === "FormFooter");

  // Main form pages (stepper content) come from the FormPages region
  const formPagesConfig = commonFields.find((item) => item.component === "FormPages");

  let selectedCommunityLabel = selectedCommunity?.metadata?.title;
  if (
    !!selectedCommunityLabel &&
    !selectedCommunityLabel?.toLowerCase().includes("collection")
  ) {
    selectedCommunityLabel = `the "${selectedCommunityLabel}" collection`;
  }

  const isNewVersionDraft = record?.status === "new_version_draft";
  const formPages = formPagesConfig?.subsections ?? [];
  const fileUploadPageId = useMemo(
    () => findPageIdContainingComponent(formPages, "FileUploadComponent"),
    [formPages]
  );
  const leftSidebarVisible =
    (formLeftSidebarConfig?.subsections?.length ?? 0) > 0;
  const rightSidebarVisible =
    (formRightSidebarConfig?.subsections?.length ?? 0) > 0;

  // Default column widths for sidebars when not specified (match FormLeftSidebar/FormRightSidebar)
  const SIDEBAR_DEFAULTS = {
    mobile: 16,
    tablet: 3,
    computer: 3,
    largeScreen: 3,
    widescreen: 3,
  };
  const mainColumnWidths = useMemo(() => {
    const left = (key) =>
      leftSidebarVisible
        ? (formLeftSidebarConfig?.[key] ?? SIDEBAR_DEFAULTS[key])
        : 0;
    const right = (key) =>
      rightSidebarVisible
        ? (formRightSidebarConfig?.[key] ?? SIDEBAR_DEFAULTS[key])
        : 0;
    return {
      mobile:
        formPagesConfig?.mobile ??
        16,
      tablet:
        formPagesConfig?.tablet ??
        Math.max(1, 16 - left("tablet") - right("tablet")),
      computer:
        formPagesConfig?.computer ??
        Math.max(1, 16 - left("computer") - right("computer")),
      largeScreen:
        formPagesConfig?.largeScreen ??
        Math.max(1, 16 - left("largeScreen") - right("largeScreen")),
      widescreen:
        formPagesConfig?.widescreen ??
        Math.max(1, 16 - left("widescreen") - right("widescreen")),
    };
  }, [
    leftSidebarVisible,
    rightSidebarVisible,
    formLeftSidebarConfig,
    formRightSidebarConfig,
    formPagesConfig?.mobile,
    formPagesConfig?.tablet,
    formPagesConfig?.computer,
    formPagesConfig?.largeScreen,
    formPagesConfig?.widescreen,
  ]);

  const [state, dispatch] = useReducer(
    formUIStateReducer,
    getInitialFormUIState(formPages, defaultResourceType, fieldsByType)
  );
  const isUpdatingRef = useRef(false);
  const pageTargetRef = useRef(null);

  useStickyFooterOverlapFix(state.currentFormPage);
  const pageTargetInViewport = useIsInViewport(pageTargetRef);

  useEffect(() => {
    if (!isUpdatingRef.current) {
      isUpdatingRef.current = true;
      new FormErrorManager(formPages, state.formPageFields, formik).updateFormErrorState(dispatch);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [formik.errors, formik.touched, formik.initialErrors, formik.initialValues, formik.values, state.formPageFields]);

  const {
    handleStorageData,
    storageDataPresent,
    recoveryAsked,
    confirmModalRef,
    handleRecoveryAsked,
  } = useLocalStorageRecovery(currentUserprofile, state.currentFormPage, fileUploadPageId);

  const navigation = useFormPageNavigation(
    formPages,
    state,
    dispatch,
    confirmModalRef,
    focusFirstElement,
    recoveryAsked,
    formik,
    fileUploadPageId
  );

  useCurrentResourceTypeFields(
    state,
    dispatch,
    formPages,
    fieldsByType,
    componentsRegistry
  );

  useEffect(() => {
    dispatch({
      type: FORM_UI_ACTION.SET_CURRENT_RESOURCE_TYPE,
      payload: formik.values.metadata.resource_type,
    });
    dispatch({
      type: FORM_UI_ACTION.SET_CURRENT_TYPE_FIELDS,
      payload: fieldsByType[formik.values.metadata.resource_type] ?? {},
    });
  }, [formik.values.metadata.resource_type, fieldsByType]);

  const contextValue = {
    formUIState: state,
    fileUploadPageId,
    handleFormPageChange: navigation.handleFormPageChange,
    formPages,
    previousFormPage: navigation.previousFormPage,
    nextFormPage: navigation.nextFormPage,
    pageTargetInViewport,
  };

  return (
    <>
      {config?.show_community_banner_at_top && (
        <Grid>
          <Grid.Row>
            <Grid.Column mobile={16} tablet={16} computer={16}>
              <CommunityHeader
                imagePlaceholderLink="/static/images/square-placeholder.png"
                record={record ?? {}}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      )}
    <Container
      text={!leftSidebarVisible && !rightSidebarVisible}
      id="rdm-deposit-form"
      className="rel-mt-1"
    >
      <Message warning className="mobile-deposit-warning mobile only">
        <Message.Header>
          <Icon name="info circle" />
          Mobile device support is coming!
        </Message.Header>
        <p>
          We are working to optimize this deposit form for mobile devices. In the
          meantime, please use a device with a larger screen to deposit your work.
        </p>
      </Message>
      <FormUIStateContext.Provider value={contextValue}>
        <Grid>
          <Grid.Row className="deposit-form-title">
            <Grid.Column width={16}>
              <h1 className="ui header">
                {i18next.t(`${
                  record?.id != null
                    ? isNewVersionDraft
                      ? "New Version of "
                      : "Updating "
                    : "New "
                }
            ${
              ["draft", "draft_with_review"].includes(record?.status)
                ? "Draft "
                : "Published "
            }Work`)}
              </h1>
              {!!selectedCommunityLabel && (
                <h2 className="ui header preselected-community-header">
                  for {selectedCommunityLabel}
                </h2>
              )}
            </Grid.Column>
          </Grid.Row>

          <FormHeaderRegion
            subsections={formHeaderConfig?.subsections ?? []}
          />

          <Grid.Row>
            <FormLeftSidebar
              subsections={formLeftSidebarConfig?.subsections ?? []}
              mobile={formLeftSidebarConfig?.mobile}
              tablet={formLeftSidebarConfig?.tablet}
              computer={formLeftSidebarConfig?.computer}
              largeScreen={formLeftSidebarConfig?.largeScreen}
              widescreen={formLeftSidebarConfig?.widescreen}
            />
            <Grid.Column
              computer={mainColumnWidths.computer}
              mobile={mainColumnWidths.mobile}
              tablet={mainColumnWidths.tablet}
              largeScreen={mainColumnWidths.largeScreen}
              widescreen={mainColumnWidths.widescreen}
            >
              <Transition.Group animation="fade" duration={{ show: 1000, hide: 20 }}>
                {formPages.map(({ section, subsections }, index) => {
                  let actualSubsections = subsections;
                  if (!!state.currentTypeFields && !!state.currentTypeFields[section]) {
                    actualSubsections = state.currentTypeFields[section];
                    if (!!actualSubsections[0]?.same_as) {
                      actualSubsections =
                        fieldsByType[actualSubsections[0].same_as][section];
                    }
                  }
                  return (
                    state.currentFormPage === section && (
                      <div key={index}>
                        <FormPage
                          focusFirstElement={focusFirstElement}
                          id={`InvenioAppRdm.Deposit.FormPage.${section}`}
                          recoveryAsked={recoveryAsked}
                          subsections={actualSubsections}
                        />
                      </div>
                    )
                  );
                })}
              </Transition.Group>
            </Grid.Column>
            <FormRightSidebar
              subsections={formRightSidebarConfig?.subsections ?? []}
              mobile={formRightSidebarConfig?.mobile}
              tablet={formRightSidebarConfig?.tablet}
              computer={formRightSidebarConfig?.computer}
              largeScreen={formRightSidebarConfig?.largeScreen}
              widescreen={formRightSidebarConfig?.widescreen}
            />
          </Grid.Row>

          <FormFooterRegion
            subsections={formFooterConfig?.subsections ?? []}
          >
            <div id="sticky-footer-observation-target" ref={pageTargetRef} />
          </FormFooterRegion>
        </Grid>

        <Confirm
          icon="question circle outline"
          id="confirm-page-change"
          className="confirm-page-change"
          open={navigation.confirmingPageChange}
          header={i18next.t("Hmmm...")}
          content={
            <Modal.Content image>
              <Icon name="question circle outline" size="huge" />
              <Modal.Description>
                {i18next.t(
                  "There are problems with the information you've entered. Do you want to fix them before moving on?"
                )}
              </Modal.Description>
            </Modal.Content>
          }
          confirmButton={
            <button className="ui button">{i18next.t("Continue anyway")}</button>
          }
          cancelButton={
            <button className="ui button positive" ref={confirmModalRef}>
              {i18next.t("Fix the problems")}
            </button>
          }
          onCancel={navigation.handlePageChangeCancel}
          onConfirm={navigation.handlePageChangeConfirm}
        />

        {!recoveryAsked && storageDataPresent && (
          <RecoveryModal
            isDraft={formik.values.status === "draft"}
            isVersionDraft={formik.values.status === "new_version_draft"}
            confirmModalRef={confirmModalRef}
            handleStorageData={handleStorageData}
            setRecoveryAsked={handleRecoveryAsked}
          />
        )}
      </FormUIStateContext.Provider>
    </Container>
    </>
  );
};

export { FormLayoutContainer, FormUIStateContext };
