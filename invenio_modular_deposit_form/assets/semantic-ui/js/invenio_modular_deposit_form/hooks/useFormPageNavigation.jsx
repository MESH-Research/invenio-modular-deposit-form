import { useEffect, useState } from "react";

/**
 * Custom hook for managing form page navigation state and history
 * @param {Array} formPages - Array of form page objects
 * @param {string} currentFormPage - Current form page section
 * @param {Function} setCurrentFormPage - Function to set current form page
 * @param {Object} pagesWithErrors - Object containing error states for each page
 * @param {Object} confirmModalRef - Ref for the confirmation modal
 * @param {Function} focusFirstElement - Function to focus the first element on a page
 * @param {boolean} recoveryAsked - Whether recovery has been asked
 * @param {Function} setFieldTouched - Function to set a field as touched
 * @param {Object} formPageFields - Object containing fields for each page
 * @returns {Object} Navigation state and handlers
 */
const useFormPageNavigation = (
  formPages,
  currentFormPage,
  setCurrentFormPage,
  pagesWithErrors,
  confirmModalRef,
  focusFirstElement,
  recoveryAsked,
  setFieldTouched,
  formPageFields
) => {
  const [destFormPage, setDestFormPage] = useState(null);
  const [confirmingPageChange, setConfirmingPageChange] = useState(false);

  // Get form page slugs
  const formPageSlugs = formPages.map(({ section }) => section);
  const pageNums = formPages.map(({ section }) => section);
  const currentPageIndex = pageNums.indexOf(currentFormPage);
  const nextPageIndex = currentPageIndex + 1;
  const previousPageIndex = currentPageIndex - 1;
  const nextFormPage = nextPageIndex < pageNums.length ? pageNums[nextPageIndex] : null;
  const previousFormPage = previousPageIndex >= 0 ? pageNums[previousPageIndex] : null;

  // Handle form page navigation by URL param and history
  function setFormPageInHistory(value) {
    if (value === undefined) {
      value = currentFormPage;
    }
    let urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("depositFormPage")) {
      urlParams.append("depositFormPage", value);
    } else if (!urlParams.depositFormPage !== value) {
      urlParams.set("depositFormPage", value);
    }
    const currentBaseURL = window.location.origin;
    const currentPath = window.location.pathname;
    const currentParams = urlParams.toString();
    const newCurrentURL = `${currentBaseURL}${currentPath}?${currentParams}`;
    window.history.pushState("fake-route", document.title, newCurrentURL);
  };

  function handleFormPageParam() {
    const urlParams = new URLSearchParams(window.location.search);
    let urlFormPage = urlParams.get("depositFormPage");
    if (!!urlFormPage && formPageSlugs.includes(urlFormPage)) {
      setCurrentFormPage(urlFormPage);
    } else {
      urlFormPage = "1";
    }
    return urlFormPage;
  };

  // Set up URL param handling on mount
  useEffect(() => {
    const startingParam = handleFormPageParam();
    // Add a fake history event so that the back button does nothing if pressed once
    setFormPageInHistory(startingParam);
    window.addEventListener("popstate", handleFormPageParam);

    return () => {
      window.removeEventListener("popstate", handleFormPageParam);
      // If we left without using the back button, aka by using a button on the page, we need to clear out that fake history event
      if (window.history.state === "fake-route") {
        window.history.back();
      }
    };
  }, []);

  function handlePageChangeCancel() {
    setConfirmingPageChange(false);
    setDestFormPage(null);
    focusFirstElement(currentFormPage, recoveryAsked);
  };

  function handlePageChangeConfirm() {
    setConfirmingPageChange(false);
    setDestFormPage(null);
    handleFormPageChange(null, {
      value: destFormPage,
    });
  };

  function handleFormPageChange(event, { value }) {
    // Mark all fields on the current page as touched
    for (const field of formPageFields[currentFormPage]) {
      setFieldTouched(field);
    }

    if (pagesWithErrors[currentFormPage]?.length > 0 && !confirmingPageChange) {
      setConfirmingPageChange(true);
      setDestFormPage(value);
      setTimeout(() => {
        confirmModalRef.current.focus();
      }, 20);
    } else {
      setDestFormPage(null);
      setCurrentFormPage(value);
      setFormPageInHistory(value);
    }
  };

  return {
    confirmingPageChange,
    nextFormPage,
    previousFormPage,
    handleFormPageChange,
    handlePageChangeCancel,
    handlePageChangeConfirm
  };
};

export { useFormPageNavigation };
