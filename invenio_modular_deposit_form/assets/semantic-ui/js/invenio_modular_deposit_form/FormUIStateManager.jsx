// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2025, MESH Research
//
// invenio-modular-deposit-form is free software; you can redistribute and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useFormikContext } from "formik";
import { useStore } from "react-redux";

import { findPageIdContainingComponent, focusFirstElement } from "./utils";
import { FormErrorManager } from "./helpers/FormErrorManager";
import { formUIStateReducer, getInitialFormUIState } from "./helpers/formUIStateReducer";
import { useFormSubmissionTransformer } from "./hooks/useFormSubmissionTransformer";
import { useCurrentResourceTypeFields } from "./hooks/useCurrentResourceTypeFields";
import { useFormPageNavigation } from "./hooks/useFormPageNavigation";
import { useLocalStorageRecovery } from "./hooks/useLocalStorageRecovery";
import { useIsInViewport } from "./hooks/useIsInViewport";

const FormUIStateContext = createContext();

/*
 * FormUIStateManager class to provide UI state management.
 *
 * UI state that may be updated is managed by a single reducer state object,
 * made available on the formUIState property of the FormUIStateContext. Other
 * shared handlers and refs related to global UI state are also created here
 * and shared via the same context.
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
  const useConfirmModal = config?.use_confirm_modal ?? true;

  // Dynamic form state
  const formik = useFormikContext();

  // Initial UI state: first page id + empty type/layout (useCurrentResourceTypeFields fills type
  // and layout after mount). Lazy init runs once on mount — avoids calling getInitialFormUIState
  // on every re-render (React ignores the second arg after mount, but the expression would still run).
  const [state, dispatch] = useReducer(formUIStateReducer, formPagesCommon, getInitialFormUIState);

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
  const recovery = useLocalStorageRecovery(
    currentUserprofile,
    state.currentFormPage,
    fileUploadPageId
  );

  // Perform any desired record data transformations before submission
  useFormSubmissionTransformer();

  // Set up form page navigation and url parameter handling
  const navigation = useFormPageNavigation(
    state,
    dispatch,
    recovery.confirmModalRef,
    focusFirstElement,
    recovery.recoveryAsked,
    formik,
    fileUploadPageId,
    useConfirmModal
  );

  // Manage updating of resource type
  useCurrentResourceTypeFields(formik, dispatch, fieldsByType, componentsRegistry);

  const pageTargetRef = useRef(null);
  const [pageTargetElement, setPageTargetElement] = useState(null);
  const pageTargetRefCallback = useCallback((node) => {
    pageTargetRef.current = node;
    setPageTargetElement(node);
  }, []);
  const pageTargetInViewport = useIsInViewport(pageTargetElement);

  // Set up form UI context for provider
  const contextValue = useMemo(
    () => ({
      confirmModalRef: recovery.confirmModalRef,
      confirmingPageChange: navigation.confirmingPageChange,
      formUIState: state,
      formUIDispatch: dispatch,
      fileUploadPageId,
      handleFormPageChange: navigation.handleFormPageChange,
      handlePageChangeCancel: navigation.handlePageChangeCancel,
      handlePageChangeConfirm: navigation.handlePageChangeConfirm,
      handleRecoveryAsked: recovery.handleRecoveryAsked,
      handleStorageData: recovery.handleStorageData,
      previousFormPage: navigation.previousFormPage,
      nextFormPage: navigation.nextFormPage,
      pageTargetRef,
      pageTargetRefCallback,
      pageTargetInViewport,
      recoveryAsked: recovery.recoveryAsked,
      storageDataPresent: recovery.storageDataPresent,
    }),
    [
      navigation,
      state,
      dispatch,
      fileUploadPageId,
      pageTargetRef,
      pageTargetRefCallback,
      pageTargetInViewport,
      recovery,
    ]
  );

  return <FormUIStateContext.Provider value={contextValue}>{children}</FormUIStateContext.Provider>;
};

/**
 * @returns Form UI state, dispatch, refs, and handlers from {@link FormUIStateManager}.
 */
function useFormUIState() {
  const ctx = useContext(FormUIStateContext);
  if (ctx == null) {
    throw new Error("useFormUIState must be used within FormUIStateManager");
  }
  return ctx;
}

export { FormUIStateManager, FormUIStateContext, useFormUIState };
