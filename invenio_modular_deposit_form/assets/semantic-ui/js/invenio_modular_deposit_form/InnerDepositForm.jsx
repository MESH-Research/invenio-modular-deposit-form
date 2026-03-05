import React, { createContext, useEffect, useReducer, useRef, useState } from "react";
import { useFormikContext } from "formik";
import { useStore } from "react-redux";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import {
  Button,
  Confirm,
  Container,
  Icon,
  Grid,
  Message,
  Modal,
  Step,
  Transition,
} from "semantic-ui-react";

import { FormPage } from "./framing_components/FormPage";
import { RecoveryModal } from "./framing_components/RecoveryModal";
import { focusFirstElement } from "./utils";
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
Form UI state is a single reducer state object. It is provided on context as formUIState
so any consumer can read it from context. Config, record, etc. from Redux.
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

  let selectedCommunityLabel = selectedCommunity?.metadata?.title;
  if (
    !!selectedCommunityLabel &&
    !selectedCommunityLabel?.toLowerCase().includes("collection")
  ) {
    selectedCommunityLabel = `the "${selectedCommunityLabel}" collection`;
  }

  const isNewVersionDraft = record?.status === "new_version_draft";
  const formPages = commonFields[0]?.subsections ?? [];
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
  } = useLocalStorageRecovery(currentUserprofile, state.currentFormPage);

  const navigation = useFormPageNavigation(
    formPages,
    state,
    dispatch,
    confirmModalRef,
    focusFirstElement,
    recoveryAsked,
    formik
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
    currentFormPage: state.currentFormPage,
    currentResourceType: state.currentResourceType,
    handleFormPageChange: navigation.handleFormPageChange,
  };

  return (
    <Container text id="rdm-deposit-form" className="rel-mt-1">
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
          <Grid.Column mobile={16} tablet={16} computer={16}>
            <Grid.Row className="deposit-form-header">
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
            </Grid.Row>
            <Step.Group
              widths={formPages.length}
              className="upload-form-pager"
              fluid={true}
              size={"small"}
            >
              {formPages.map(({ section, label }, index) => (
                <Step
                  key={index}
                  as={Button}
                  active={state.currentFormPage === section}
                  link
                  onClick={navigation.handleFormPageChange}
                  value={section}
                  formNoValidate
                  className={`ui button upload-form-stepper-step ${section}
                    ${!!state.pagesWithFlaggedErrors[section] ? "has-error" : ""}`}
                  type="button"
                >
                  <Step.Content>
                    <Step.Title>{i18next.t(label)}</Step.Title>
                  </Step.Content>
                </Step>
              ))}
            </Step.Group>

            <Transition.Group animation="fade" duration={{ show: 1000, hide: 20 }}>
              {formPages.map(({ section, subsections }, index) => {
                let actualSubsections = subsections;
                if (!!state.currentTypeFields && !!state.currentTypeFields[section]) {
                  actualSubsections = state.currentTypeFields[section];
                  if (!!actualSubsections[0].same_as) {
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

            <div id="sticky-footer-observation-target" ref={pageTargetRef}></div>
            <div
              className={`ui container ${
                pageTargetInViewport ? "sticky-footer-static" : "sticky-footer-fixed"
              }`}
            >
              <Grid className="deposit-form-footer">
                <Grid.Column width={3}>
                  {!!navigation.previousFormPage && (
                    <Button
                      type="button"
                      onClick={navigation.handleFormPageChange}
                      value={navigation.previousFormPage}
                      icon
                      labelPosition="left"
                      className="back-button"
                    >
                      <Icon name="left arrow" />
                      Back
                    </Button>
                  )}
                </Grid.Column>
                <Grid.Column className="footer-message" width={10}>
                  Your current form values are backed up automatically{" "}
                  <i>in this browser</i>.<br />
                  Save a persistent draft to the cloud on the "Save & Publish" tab.
                </Grid.Column>
                <Grid.Column width={3}>
                  {!!navigation.nextFormPage && (
                    <Button
                      type="button"
                      onClick={navigation.handleFormPageChange}
                      value={navigation.nextFormPage}
                      icon
                      labelPosition="right"
                      className="continue-button primary"
                    >
                      <Icon name="right arrow" />
                      Continue
                    </Button>
                  )}
                </Grid.Column>
              </Grid>
            </div>

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
          </Grid.Column>
        </Grid>
      </FormUIStateContext.Provider>
    </Container>
  );
};

export { FormLayoutContainer, FormUIStateContext };
