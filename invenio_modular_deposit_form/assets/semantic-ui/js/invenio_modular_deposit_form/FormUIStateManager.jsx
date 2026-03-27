// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2025, MESH Research
//
// invenio-modular-deposit-form is free software; you can redistribute and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { createContext, useEffect, useMemo, useReducer, useRef } from "react";
import { useFormikContext } from "formik";
import { useStore } from "react-redux";

import { findPageIdContainingComponent, focusFirstElement } from "./utils";
import { FormErrorManager } from "./helpers/FormErrorManager";
import { formUIStateReducer, getInitialFormUIState } from "./helpers/formUIStateReducer";
import { useCurrentResourceTypeFields } from "./hooks/useCurrentResourceTypeFields";
import { useFormPageNavigation } from "./hooks/useFormPageNavigation";
import { useLocalStorageRecovery } from "./hooks/useLocalStorageRecovery";
import { useIsInViewport } from "./hooks/useIsInViewport";

const FormUIStateContext = createContext();

/*
 * FormUIStateManager class to provide UI state management.
 *
 * UI state that may be updated is managed by a single reducer state object,
 * made available on the formUIState property of the FormUIStateContext.
 *
 * Static values that aren't updated between page loads (static config,
 * record, permissions, language, etc.) live in the Redux store.
 *
 * (The separation of concerns isn't quite so neat since state related to
 * API operations--files, selected community--are also managed by Redux
 * and may be updated.)
 */
const FormUIStateManager = ({ children }) => {
  const store = useStore();
  const { config } = store.getState().deposit ?? {};

  // Static layout and ui configuration
  const componentsRegistry = config?.componentsRegistry ?? {};
  const currentUserprofile = config?.current_user_profile ?? {};
  const defaultResourceType = config?.default_resource_type;
  const formSectionFields = config?.formSectionFields;
  const fieldsByType = config?.fields_by_type ?? {};
  const formPagesConfig = store
    .getState()
    .deposit?.config?.common_fields?.find((item) => item.component === "FormPages");
  const formPagesCommon = formPagesConfig?.subsections ?? [];
  const fileUploadPageId = useMemo(
    () => findPageIdContainingComponent(formPagesCommon, "FileUploadComponent"),
    [formPagesCommon]
  );

  // Dynamic form state
  const formik = useFormikContext();

  // Set up form UI state reducer
  const [state, dispatch] = useReducer(
    formUIStateReducer,
    getInitialFormUIState(formPagesCommon, defaultResourceType, fieldsByType)
  );

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

  // Manage updating of resource type
  useCurrentResourceTypeFields(formik, dispatch, fieldsByType, componentsRegistry);

  const pageTargetRef = useRef(null);
  const pageTargetInViewport = useIsInViewport(pageTargetRef);

  // Set up form UI context for provider
  const contextValue = {
    confirmModalRef,
    confirmingPageChange: navigation.confirmingPageChange,
    formUIState: state,
    formUIDispatch: dispatch,
    fileUploadPageId,
    handleFormPageChange: navigation.handleFormPageChange,
    handlePageChangeCancel: navigation.handlePageChangeCancel,
    handlePageChangeConfirm: navigation.handlePageChangeConfirm,
    handleRecoveryAsked,
    handleStorageData,
    previousFormPage: navigation.previousFormPage,
    nextFormPage: navigation.nextFormPage,
    pageTargetRef,
    pageTargetInViewport,
    storageDataPresent,
  };

  return <FormUIStateContext.Provider value={contextValue}>{children}</FormUIStateContext.Provider>;
};

export { FormUIStateManager, FormUIStateContext };
