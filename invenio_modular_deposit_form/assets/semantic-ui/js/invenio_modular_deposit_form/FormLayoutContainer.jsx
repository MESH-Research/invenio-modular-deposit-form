import React, { createContext, useEffect, useMemo, useReducer, useRef } from "react";
import { useFormikContext } from "formik";
import { useStore } from "react-redux";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { Confirm, Container, Icon, Grid, Message, Modal, Transition } from "semantic-ui-react";

import { CommunityHeader } from "@js/invenio_rdm_records";
import { FormPage } from "./framing_components/FormPage";
import { FormFooterRegion } from "./framing_components/FormFooterRegion";
import { FormHeaderRegion } from "./framing_components/FormHeaderRegion";
import { FormLeftSidebar } from "./framing_components/FormLeftSidebar";
import { FormRightSidebar } from "./framing_components/FormRightSidebar";
import { RecoveryModal } from "./framing_components/RecoveryModal";
import { findPageIdContainingComponent, focusFirstElement } from "./utils";
import { FormErrorManager } from "./helpers/FormErrorManager";
import { formUIStateReducer, getInitialFormUIState } from "./helpers/formUIStateReducer";
import { useCurrentResourceTypeFields } from "./hooks/useCurrentResourceTypeFields";
import { useFormPageNavigation } from "./hooks/useFormPageNavigation";
import { useLocalStorageRecovery } from "./hooks/useLocalStorageRecovery";
import { useIsInViewport } from "./hooks/useIsInViewport";
import { useStickyFooterOverlapFix } from "./hooks/useStickyFooterOverlapFix";

const FormUIStateContext = createContext();

const SIDEBAR_DEFAULTS_WIDTHS = {
  mobile: 16,
  tablet: 16,
  computer: 3,
  largeScreen: 3,
  widescreen: 3,
};

/* Get sidebar configs and calculate form column visibility and widths.
 * @param {object} commonFields
 */
function getColumnsConfig(commonFields) {
  const formPagesConfig = commonFields?.find((item) => item.component === "FormPages");
  const leftSidebarConfig = commonFields.find((item) => item.component === "FormLeftSidebar");
  const rightSidebarConfig = commonFields.find((item) => item.component === "FormRightSidebar");
  const leftSidebarVisible = (leftSidebarConfig?.subsections?.length ?? 0) > 0;
  const rightSidebarVisible = (rightSidebarConfig?.subsections?.length ?? 0) > 0;

  const left = (key) =>
    leftSidebarVisible ? (leftSidebarConfig?.[key] ?? SIDEBAR_DEFAULTS_WIDTHS[key]) : 0;
  const right = (key) =>
    rightSidebarVisible ? (rightSidebarConfig?.[key] ?? SIDEBAR_DEFAULTS_WIDTHS[key]) : 0;

  const mainColumnWidths = {
    mobile: formPagesConfig?.mobile ?? 16,
    tablet: formPagesConfig?.tablet ?? 16,
    computer: formPagesConfig?.computer ?? Math.max(1, 16 - left("computer") - right("computer")),
    largeScreen:
      formPagesConfig?.largeScreen ?? Math.max(1, 16 - left("largeScreen") - right("largeScreen")),
    widescreen:
      formPagesConfig?.widescreen ?? Math.max(1, 16 - left("widescreen") - right("widescreen")),
  };

  return {
    leftSidebar: {
      config: leftSidebarConfig,
      visible: leftSidebarVisible,
    },
    rightSidebar: {
      config: rightSidebarConfig,
      visible: rightSidebarVisible,
    },
    mainColumnWidths,
  };
}

/* Adapt community header label based on title content
 */
function makeSelectedCommunityLabel(selectedCommunity) {
  let selectedCommunityLabel = selectedCommunity?.metadata?.title;
  if (!!selectedCommunityLabel && !selectedCommunityLabel?.toLowerCase().includes("community")) {
    selectedCommunityLabel = `the "${selectedCommunityLabel}" community`;
  }
  return selectedCommunityLabel;
}

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

  // Static layout and ui configuration
  const componentsRegistry = config?.componentsRegistry ?? {};
  const commonFields = config?.common_fields ?? [];
  const currentUserprofile = config?.current_user_profile ?? {};
  const defaultResourceType = config?.default_resource_type;
  const formSectionFields = config?.formSectionFields;
  const fieldsByType = config?.fields_by_type ?? {};
  const formHeaderConfig = commonFields.find((item) => item.component === "FormHeader");
  const formFooterConfig = commonFields.find((item) => item.component === "FormFooter");
  const formPagesConfig = store
    .getState()
    .deposit?.config?.common_fields?.find((item) => item.component === "FormPages");
  const formPagesCommon = formPagesConfig?.subsections ?? [];
  const isNewVersionDraft = record?.status === "new_version_draft";
  const fileUploadPageId = useMemo(
    () => findPageIdContainingComponent(formPagesCommon, "FileUploadComponent"),
    [formPagesCommon]
  );

  // Dynamic form state
  const formik = useFormikContext();
  const selectedCommunity = editorState?.selectedCommunity;
  const selectedCommunityLabel = makeSelectedCommunityLabel(selectedCommunity);

  // Set up form UI state reducer
  const [state, dispatch] = useReducer(
    formUIStateReducer,
    getInitialFormUIState(formPagesCommon, defaultResourceType, fieldsByType)
  );

  // Default column widths for sidebars when not specified (match FormLeftSidebar/FormRightSidebar)
  const { leftSidebar, rightSidebar, mainColumnWidths } = useMemo(() =>
    getColumnsConfig(commonFields)
  );

  const pageTargetRef = useRef(null);
  useStickyFooterOverlapFix(state.currentFormPage);
  const pageTargetInViewport = useIsInViewport(pageTargetRef);

  // Keep client and server errors in sync and track which errors to display
  useEffect(() => {
    new FormErrorManager(formik, store).updateFormErrorState(dispatch);
  }, [
    formik.errors,
    formik.touched,
    formik.initialErrors,
    formik.initialValues,
    formik.values,
    formSectionFields,
  ]);

  // Autosave form data in browser local storage
  const {
    handleStorageData,
    storageDataPresent,
    recoveryAsked,
    confirmModalRef,
    handleRecoveryAsked,
  } = useLocalStorageRecovery(currentUserprofile, state.currentFormPage, fileUploadPageId);

  // Set up form page navigation and url parameter handling
  const navigation = useFormPageNavigation(
    state,
    dispatch,
    confirmModalRef,
    focusFirstElement,
    recoveryAsked,
    formik,
    fileUploadPageId
  );

  useCurrentResourceTypeFields(formik, dispatch, fieldsByType, componentsRegistry);

  // Set up form UI context for provider
  const contextValue = {
    formUIState: state,
    fileUploadPageId,
    handleFormPageChange: navigation.handleFormPageChange,
    previousFormPage: navigation.previousFormPage,
    nextFormPage: navigation.nextFormPage,
    pageTargetInViewport,
    storageDataPresent,
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
        text={!leftSidebar.visible && !rightSidebar.visible}
        id="rdm-deposit-form"
        className="rel-mt-1"
      >
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
              ["draft", "draft_with_review"].includes(record?.status) ? "Draft " : "Published "
            }Work`)}
                </h1>
                {!!selectedCommunityLabel && !config?.show_community_banner_at_top && (
                  <h2 className="ui header preselected-community-header">
                    for {selectedCommunityLabel}
                  </h2>
                )}
              </Grid.Column>
            </Grid.Row>

            <FormHeaderRegion subsections={formHeaderConfig?.subsections ?? []} />

            <Grid.Row>
              <FormLeftSidebar
                subsections={leftSidebar.config?.subsections ?? []}
                mobile={leftSidebar.config?.mobile}
                tablet={leftSidebar.config?.tablet}
                computer={leftSidebar.config?.computer}
                largeScreen={leftSidebar.config?.largeScreen}
                widescreen={leftSidebar.config?.widescreen}
              />
              <Grid.Column
                computer={mainColumnWidths.computer}
                mobile={mainColumnWidths.mobile}
                tablet={mainColumnWidths.tablet}
                largeScreen={mainColumnWidths.largeScreen}
                widescreen={mainColumnWidths.widescreen}
                className="mb-15"
              >
                <Transition.Group animation="fade" duration={{ show: 1000, hide: 20 }}>
                  {state.visibleFormPages.map(
                    ({ section, subsections, classnames, ...pageProps }) => {
                      let actualSubsections = subsections;
                      if (!!state.currentTypeFields && !!state.currentTypeFields[section]) {
                        actualSubsections = state.currentTypeFields[section];
                        if (!!actualSubsections[0]?.same_as) {
                          actualSubsections = fieldsByType[actualSubsections[0].same_as][section];
                        }
                      }
                      return (
                        state.currentFormPage === section && (
                          <div key={section}>
                            <FormPage
                              focusFirstElement={focusFirstElement}
                              id={`InvenioAppRdm.Deposit.FormPage.${section}`}
                              recoveryAsked={recoveryAsked}
                              classnames={classnames}
                              subsections={actualSubsections}
                              {...pageProps}
                            />
                          </div>
                        )
                      );
                    }
                  )}
                </Transition.Group>
              </Grid.Column>
              <FormRightSidebar
                subsections={rightSidebar.config?.subsections ?? []}
                mobile={rightSidebar.config?.mobile}
                tablet={rightSidebar.config?.tablet}
                computer={rightSidebar.config?.computer}
                largeScreen={rightSidebar.config?.largeScreen}
                widescreen={rightSidebar.config?.widescreen}
              />
            </Grid.Row>

            <FormFooterRegion subsections={formFooterConfig?.subsections ?? []}>
              <div id="sticky-footer-observation-target" ref={pageTargetRef} />
            </FormFooterRegion>
          </Grid>

          <Confirm
            icon="question circle outline"
            id="confirm-page-change"
            className="confirm-page-change"
            open={navigation.confirmingPageChange}
            closeIcon
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
            confirmButton={<button className="ui button">{i18next.t("Continue anyway")}</button>}
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
