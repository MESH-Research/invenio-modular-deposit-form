// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research
//
// Invenio Modular Deposit Form is free software;
// you can redistribute them and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getIn } from "formik";
import { FORM_UI_ACTION, getPagesWithErrors } from "../helpers/formUIStateReducer";
import { SEMANTIC_UI_COMPUTER_BREAKPOINT_PX } from "../constants";
import { collectLeafFieldPathsUnderRoot } from "../utils";

/**
 * Multi-page deposit form: keeps `currentFormPage` (form UI useReducer), the address bar `?page=`
 * query, and the browser history list in sync. Uses only **visible** pages (`formUIState.visibleFormPages`),
 * i.e. the same subset the stepper/sidebar show after merging common layout + resource type.
 *
 * **What this hook does**
 *
 * - **Next / previous** — Exposes `nextFormPage` and `previousFormPage` as adjacent visible page ids
 *   (or null) for footer nav; ordering follows `visibleFormPages`.
 * - **User-initiated page change** — `handleFormPageChange` marks all fields on the current page
 *   touched. If `sectionErrorsAll` lists any path for this page (same set as the nav guard via
 *   `getPagesWithErrors`) under a page registry field, descendant leaf paths are touched too — including
 *   client validation on untouched fields (Flagged-only lists would miss those until something else
 *   touched a parent). Then either opens the confirm modal (if the current page still has errors
 *   per `sectionErrorsAll`) or dispatches `SET_CURRENT_FORM_PAGE`
 *   and updates the URL via `history.pushState` so Back/Forward can move between steps.
 * - **URL on load / popstate** — `handleFormPageParam` reads `?page=`, supports `first` / `last`
 *   aliases, and dispatches `SET_CURRENT_FORM_PAGE` when the slug is valid; a `popstate` listener
 *   reapplies that when the user uses the browser back button.
 * - **First paint after visible pages exist** — When `visibleFormPages` was initially empty (e.g.
 *   before `useCurrentResourceTypeFields` runs), then becomes non-empty, one effect runs
 *   `handleFormPageParam` + `pushState` exactly once so the URL matches the visible set.
 * - **Stale current page** — If `currentFormPage` is not in `visibleFormPages` anymore (e.g. resource
 *   type hid a placeholder step), an effect moves to the first visible page and uses
 *   `history.replaceState` so the correction does not add an extra history entry.
 * - **Computer breakpoint** — At computer+ widths (`matchMedia` on
 *   `SEMANTIC_UI_COMPUTER_BREAKPOINT_PX`), pages listed in `pageIdsHiddenAtComputer` (precomputed
 *   from `menuItemClasses` when layout resolves) are remapped via `computerVisibleFallbackByPage`:
 *   on `?page=` / popstate, and when the viewport crosses into computer+. Uses `replaceState` when
 *   correcting an existing URL.
 * - **Modal helpers** — `handlePageChangeCancel` / `handlePageChangeConfirm` complete or abort the
 *   “leave page with errors?” flow; `confirmingPageChange` drives the `Confirm` in FormLayoutContainer.
 *
 * @param {Object} formUIState - Form UI reducer state (`currentFormPage`, `visibleFormPages`, `sectionErrorsAll`, `currentFormPageFields`, …)
 * @param {Function} dispatch - Dispatch for form UI state only (`FORM_UI_ACTION` / `formUIStateReducer`)
 * @param {Object} confirmModalRef - Ref passed to the confirm modal’s cancel button for focus
 * @param {Function} focusFirstElement - Focus helper when cancelling a guarded page change
 * @param {boolean} recoveryAsked - Passed through to `focusFirstElement` (recovery modal gating)
 * @param {Object} formik - Formik context (`setFieldTouched` on leave-page)
 * @param {boolean} useConfirmModal - Flag to determine whether to open a confirm modal when leaving a page
     with errors (default is true)
 * @returns {Object} `confirmingPageChange`, `nextFormPage`, `previousFormPage`, `handleFormPageChange`,
 *   `handlePageChangeCancel`, `handlePageChangeConfirm`
 */
const useFormPageNavigation = (
  formUIState,
  dispatch,
  confirmModalRef,
  focusFirstElement,
  recoveryAsked,
  formik,
  useConfirmModal = true
) => {
  const visibleFormPages = formUIState?.visibleFormPages ?? [];
  const visibleFormPagesRef = useRef(visibleFormPages);
  visibleFormPagesRef.current = visibleFormPages;

  const pageIdsHiddenAtComputerRef = useRef(formUIState?.pageIdsHiddenAtComputer ?? []);
  pageIdsHiddenAtComputerRef.current = formUIState?.pageIdsHiddenAtComputer ?? [];

  const computerVisibleFallbackByPageRef = useRef(
    formUIState?.computerVisibleFallbackByPage ?? {}
  );
  computerVisibleFallbackByPageRef.current = formUIState?.computerVisibleFallbackByPage ?? {};

  const currentFormPageRef = useRef(formUIState?.currentFormPage);
  currentFormPageRef.current = formUIState?.currentFormPage;

  const pagesWithErrors = useMemo(() => getPagesWithErrors(formUIState ?? {}), [formUIState]);
  const { currentFormPage, currentFormPageFields } = formUIState ?? {};
  const [destFormPage, setDestFormPage] = useState(null);
  const [confirmingPageChange, setConfirmingPageChange] = useState(false);

  const pageNums = visibleFormPages.map(({ section }) => section);
  const currentPageIndex = pageNums.indexOf(currentFormPage);
  const nextPageIndex = currentPageIndex + 1;
  const previousPageIndex = currentPageIndex - 1;
  const nextFormPage = nextPageIndex < pageNums.length ? pageNums[nextPageIndex] : null;
  const previousFormPage = previousPageIndex >= 0 ? pageNums[previousPageIndex] : null;

  const setFormPageInHistory = useCallback(
    (value) => {
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
    },
    [currentFormPage]
  );

  /**
   * At computer+ widths, map a page id precomputed as menu-hidden to its fallback page.
   * No-op below the computer breakpoint.
   *
   * @param {string|null} pageId
   * @returns {string|null}
   */
  function resolvePageForViewport(pageId) {
    if (!pageId) {
      return pageId;
    }
    if (typeof window.matchMedia !== "function") {
      return pageId;
    }
    const atComputer = window.matchMedia(
      `(min-width: ${SEMANTIC_UI_COMPUTER_BREAKPOINT_PX}px)`
    ).matches;
    if (!atComputer) {
      return pageId;
    }
    if (!pageIdsHiddenAtComputerRef.current.includes(pageId)) {
      return pageId;
    }
    return computerVisibleFallbackByPageRef.current[pageId] ?? pageId;
  }

  /**
   * If the current page is menu-hidden at computer+, switch to the fallback and
   * rewrite `?page=` with replaceState. Returns the page id after correction.
   *
   * @param {string|null} [pageId] - Defaults to `currentFormPageRef.current`
   * @returns {string|null}
   */
  function leaveComputerHiddenPage(pageId) {
    const current = pageId ?? currentFormPageRef.current;
    const resolved = resolvePageForViewport(current);
    if (!resolved || resolved === current) {
      return current;
    }
    dispatch({ type: FORM_UI_ACTION.SET_CURRENT_FORM_PAGE, payload: resolved });
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("page")) {
      urlParams.append("page", resolved);
    } else {
      urlParams.set("page", resolved);
    }
    const newURL = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState("fake-route", document.title, newURL);
    return resolved;
  }

  function handleFormPageParam() {
    const slugs = visibleFormPagesRef.current.map(({ section }) => section);
    const urlParams = new URLSearchParams(window.location.search);
    let urlFormPage = urlParams.get("page");

    // Support aliases for first/last page to avoid hard-coding page ids
    if (urlFormPage === "first") {
      urlFormPage = slugs[0] ?? null;
    } else if (urlFormPage === "last") {
      urlFormPage = slugs[slugs.length - 1] ?? null;
    }

    if (!!urlFormPage && slugs.includes(urlFormPage)) {
      const resolved = resolvePageForViewport(urlFormPage);
      dispatch({ type: FORM_UI_ACTION.SET_CURRENT_FORM_PAGE, payload: resolved });
      if (resolved !== urlFormPage) {
        const rewriteParams = new URLSearchParams(window.location.search);
        if (!rewriteParams.has("page")) {
          rewriteParams.append("page", resolved);
        } else {
          rewriteParams.set("page", resolved);
        }
        const newURL = `${window.location.origin}${window.location.pathname}?${rewriteParams.toString()}`;
        window.history.replaceState("fake-route", document.title, newURL);
      }
      return resolved;
    }
    // Default to first visible page slug if available
    urlFormPage = slugs[0] ?? null;
    return urlFormPage;
  }

  useEffect(() => {
    window.addEventListener("popstate", handleFormPageParam);
    return () => {
      window.removeEventListener("popstate", handleFormPageParam);
      if (window.history.state === "fake-route") {
        window.history.back();
      }
    };
  }, []);

  const urlSyncedWithVisiblePages = useRef(false);
  useEffect(() => {
    if (!visibleFormPages.length) {
      urlSyncedWithVisiblePages.current = false;
      return;
    }
    if (!urlSyncedWithVisiblePages.current) {
      urlSyncedWithVisiblePages.current = true;
      const startingParam = handleFormPageParam();
      setFormPageInHistory(startingParam);
    }
  }, [visibleFormPages]);

  /**
   * If `currentFormPage` is not in `visibleFormPages` (e.g. resource type hid that placeholder page),
   * switch to the first visible page and rewrite `?page=` with replaceState (no extra history entry).
   */
  useEffect(() => {
    if (!visibleFormPages.length) return;
    if (visibleFormPages.some((p) => p.section === currentFormPage)) return;
    const first = visibleFormPages[0].section;
    dispatch({ type: FORM_UI_ACTION.SET_CURRENT_FORM_PAGE, payload: first });
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("page")) {
      urlParams.append("page", first);
    } else {
      urlParams.set("page", first);
    }
    const newURL = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState("fake-route", document.title, newURL);
  }, [visibleFormPages, currentFormPage, dispatch]);

  /**
   * When the viewport widens to computer+, leave pages listed in `pageIdsHiddenAtComputer`.
   * URL/`?page=` entry is handled in `handleFormPageParam` via `resolvePageForViewport`.
   */
  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return undefined;
    }
    const mediaQuery = window.matchMedia(
      `(min-width: ${SEMANTIC_UI_COMPUTER_BREAKPOINT_PX}px)`
    );

    const onChange = (event) => {
      if (event.matches) {
        leaveComputerHiddenPage();
      }
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    }
    // Safari < 14
    mediaQuery.addListener(onChange);
    return () => mediaQuery.removeListener(onChange);
  }, [dispatch]);

  const handlePageChangeCancel = useCallback(() => {
    setConfirmingPageChange(false);
    setDestFormPage(null);
    focusFirstElement(currentFormPage, recoveryAsked);
  }, [currentFormPage, recoveryAsked]);

  const handleFormPageChange = useCallback(
    (_, { value }) => {
      const originPageFields = currentFormPageFields[currentFormPage] || [];
      const destPageFields = currentFormPageFields[value] || [];

      const errorFieldsForOriginPage = pagesWithErrors[currentFormPage] ?? [];
      const errorFieldsForDestPage = pagesWithErrors[value] ?? [];

      // Ensure origin page fields are touched before we leave.
      // Include any subfields if the field has an error.
      for (const field of originPageFields) {
        formik.setFieldTouched(field);
        const hasPageErrorUnderField = errorFieldsForOriginPage.some(
          (p) => p === field || p.startsWith(`${field}.`)
        );
        if (hasPageErrorUnderField) {
          const subValue = getIn(formik.values, field);
          const leaves = collectLeafFieldPathsUnderRoot(field, subValue);
          for (const leaf of leaves) {
            formik.setFieldTouched(leaf, true, false);
          }
        }
      }

      // Ensure target page fields are *untouched* unless they have errors.
      // (To avoid problem of new empty array field items in touched field
      // being flagged immediately as errors.)
      for (const field of destPageFields) {
        const hasPageErrorUnderField = errorFieldsForDestPage.some(
          (p) => p === field || p.startsWith(`${field}.`)
        );
        if (!hasPageErrorUnderField) {
          formik.setFieldTouched(field, false, false);
        }
      }

      // Open confirm modal if origin page has errors, otherwise navigate.
      if (
        pagesWithErrors[currentFormPage]?.length > 0 &&
        useConfirmModal &&
        !confirmingPageChange
      ) {
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
    },
    [
      confirmingPageChange,
      confirmModalRef,
      currentFormPage,
      currentFormPageFields,
      dispatch,
      formik.values,
      pagesWithErrors,
      setFormPageInHistory,
    ]
  );

  const handlePageChangeConfirm = useCallback(() => {
    setConfirmingPageChange(false);
    setDestFormPage(null);
    handleFormPageChange(null, {
      value: destFormPage,
    });
  }, [destFormPage, handleFormPageChange]);

  return useMemo(
    () => ({
      confirmingPageChange,
      nextFormPage,
      previousFormPage,
      handleFormPageChange,
      handlePageChangeCancel,
      handlePageChangeConfirm,
    }),
    [
      confirmingPageChange,
      nextFormPage,
      previousFormPage,
      handleFormPageChange,
      handlePageChangeCancel,
      handlePageChangeConfirm,
    ]
  );
};

export { useFormPageNavigation };
