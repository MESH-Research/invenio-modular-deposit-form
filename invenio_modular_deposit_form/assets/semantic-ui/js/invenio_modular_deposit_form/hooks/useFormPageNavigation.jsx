import { useEffect, useState } from "react";
import { FORM_UI_ACTION } from "../helpers/formUIStateReducer";

/**
 * Custom hook for managing form page navigation state and history
 * @param {Array} formPages - Array of form page objects
 * @param {Object} formUIState - Full form UI state object (currentFormPage, pagesWithErrors, formPageFields)
 * @param {Function} dispatch - Form UI reducer dispatch
 * @param {Object} confirmModalRef - Ref for the confirmation modal
 * @param {Function} focusFirstElement - Function to focus the first element on a page
 * @param {boolean} recoveryAsked - Whether recovery has been asked
 * @param {Object} formik - Formik context (uses setFieldTouched)
 * @param {string|null} fileUploadPageId - Page id containing FileUploadComponent (for focus workaround)
 * @returns {Object} Navigation state and handlers
 */
const useFormPageNavigation = (
  formPages,
  formUIState,
  dispatch,
  confirmModalRef,
  focusFirstElement,
  recoveryAsked,
  formik,
  fileUploadPageId
) => {
  const { currentFormPage, pagesWithErrors, formPageFields } = formUIState;
  const [destFormPage, setDestFormPage] = useState(null);
  const [confirmingPageChange, setConfirmingPageChange] = useState(false);

  const formPageSlugs = formPages.map(({ section }) => section);
  const pageNums = formPages.map(({ section }) => section);
  const currentPageIndex = pageNums.indexOf(currentFormPage);
  const nextPageIndex = currentPageIndex + 1;
  const previousPageIndex = currentPageIndex - 1;
  const nextFormPage = nextPageIndex < pageNums.length ? pageNums[nextPageIndex] : null;
  const previousFormPage = previousPageIndex >= 0 ? pageNums[previousPageIndex] : null;

  function setFormPageInHistory(value) {
    if (value === undefined) {
      value = currentFormPage;
    }
    let urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("page")) {
      urlParams.append("page", value);
    } else if (urlParams.get("page") !== value) {
      urlParams.set("page", value);
    }
    const currentBaseURL = window.location.origin;
    const currentPath = window.location.pathname;
    const currentParams = urlParams.toString();
    const newCurrentURL = `${currentBaseURL}${currentPath}?${currentParams}`;
    window.history.pushState("fake-route", document.title, newCurrentURL);
  }

  function handleFormPageParam() {
    const urlParams = new URLSearchParams(window.location.search);
    let urlFormPage = urlParams.get("page");

    // Support aliases for first/last page to avoid hard-coding page ids
    if (urlFormPage === "first") {
      urlFormPage = formPageSlugs[0] ?? null;
    } else if (urlFormPage === "last") {
      urlFormPage = formPageSlugs[formPageSlugs.length - 1] ?? null;
    }

    if (!!urlFormPage && formPageSlugs.includes(urlFormPage)) {
      dispatch({ type: FORM_UI_ACTION.SET_CURRENT_FORM_PAGE, payload: urlFormPage });
    } else {
      // Default to first page slug if available
      urlFormPage = formPageSlugs[0] ?? null;
    }
    return urlFormPage;
  }

  useEffect(() => {
    const startingParam = handleFormPageParam();
    setFormPageInHistory(startingParam);
    window.addEventListener("popstate", handleFormPageParam);
    return () => {
      window.removeEventListener("popstate", handleFormPageParam);
      if (window.history.state === "fake-route") {
        window.history.back();
      }
    };
  }, []);

  function handlePageChangeCancel() {
    setConfirmingPageChange(false);
    setDestFormPage(null);
    focusFirstElement(currentFormPage, recoveryAsked, fileUploadPageId);
  }

  function handlePageChangeConfirm() {
    setConfirmingPageChange(false);
    setDestFormPage(null);
    handleFormPageChange(null, {
      value: destFormPage,
    });
  }

  function handleFormPageChange(event, { value }) {
    for (const field of formPageFields[currentFormPage] || []) {
      formik.setFieldTouched(field);
    }
    if (pagesWithErrors[currentFormPage]?.length > 0 && !confirmingPageChange) {
      setConfirmingPageChange(true);
      setDestFormPage(value);
      setTimeout(() => {
        confirmModalRef.current?.focus();
      }, 20);
    } else {
      setDestFormPage(null);
      dispatch({ type: FORM_UI_ACTION.SET_CURRENT_FORM_PAGE, payload: value });
      setFormPageInHistory(value);
    }
  }

  return {
    confirmingPageChange,
    nextFormPage,
    previousFormPage,
    handleFormPageChange,
    handlePageChangeCancel,
    handlePageChangeConfirm,
  };
};

export { useFormPageNavigation };
