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
 * Multi-page deposit form: keeps `currentFormPage` / `previousFormPage` / `nextFormPage` (form UI
 * useReducer), the address bar `?page=` query, and the browser history list in sync. Uses only
 * **visible** pages (`formUIState.visibleFormPages`), i.e. the same subset the stepper/sidebar show
 * after merging common layout + resource type.
 *
 * **What this hook does**
 *
 * - **Next / previous** — Stores viewport-aware `previousFormPage` and `nextFormPage` on form UI
 *   state via `resolvePageForViewport` (same dispatch as `currentFormPage`). At computer+ widths,
 *   adjacent ids skip `pageIdsHiddenAtComputer`. Consumers read both from `formUIState`.
 * - **User-initiated page change** — `handleFormPageChange` resolves the destination through
 *   `resolvePageForViewport` first, marks origin-page fields touched (and error descendant leaves),
 *   untouches destination fields without errors, then either opens the confirm modal with the
 *   **resolved** destination or dispatches `SET_CURRENT_FORM_PAGE` and `history.pushState`.
 * - **URL on load / popstate** — `handleFormPageParam` reads `?page=`, supports `first` / `last`
 *   aliases, and dispatches `SET_CURRENT_FORM_PAGE` (current + previous + next) when the slug is
 *   valid; a `popstate` listener reapplies that when the user uses the browser back button.
 *   Missing/invalid `?page=` defaults to the first visible page through the same resolver.
 * - **First paint after visible pages exist** — When `visibleFormPages` was initially empty (e.g.
 *   before `useCurrentResourceTypeFields` runs), then becomes non-empty, one effect runs
 *   `handleFormPageParam` + `pushState` exactly once so the URL matches the visible set.
 * - **Stale current page** — If `currentFormPage` is not in `visibleFormPages` anymore (e.g. resource
 *   type hid a placeholder step), an effect moves to the first visible page (viewport-resolved) and
 *   uses `history.replaceState` so the correction does not add an extra history entry.
 * - **Computer breakpoint** — At computer+ widths (`matchMedia` on
 *   `SEMANTIC_UI_COMPUTER_BREAKPOINT_PX`), pages in `pageIdsHiddenAtComputer` are remapped via
 *   `computerVisibleFallbackByPage` for current, and previous/next skip those ids. On any
 *   cross of the computer breakpoint (widen or shrink), `syncFormPageForViewport` re-resolves
 *   current + previous + next and `replaceState`s the URL when current changes.
 * - **Modal helpers** — `handlePageChangeCancel` / `handlePageChangeConfirm` complete or abort the
 *   “leave page with errors?” flow; `confirmingPageChange` drives the `Confirm` in FormLayoutContainer.
 *
 * @param {Object} formUIState - Form UI reducer state (`currentFormPage`, `previousFormPage`, `nextFormPage`, …)
 * @param {Function} dispatch - Dispatch for form UI state only (`FORM_UI_ACTION` / `formUIStateReducer`)
 * @param {Object} confirmModalRef - Ref passed to the confirm modal’s cancel button for focus
 * @param {Function} focusFirstElement - Focus helper when cancelling a guarded page change
 * @param {boolean} recoveryAsked - Passed through to `focusFirstElement` (recovery modal gating)
 * @param {Object} formik - Formik context (`setFieldTouched` on leave-page)
 * @param {boolean} useConfirmModal - Flag to determine whether to open a confirm modal when leaving a page
 *   with errors (default is true)
 * @returns {Object} `confirmingPageChange`, `handleFormPageChange`, `handlePageChangeCancel`,
 *   `handlePageChangeConfirm`
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

  const computerVisibleFallbackByPageRef = useRef(formUIState?.computerVisibleFallbackByPage ?? {});
  computerVisibleFallbackByPageRef.current = formUIState?.computerVisibleFallbackByPage ?? {};

  const currentFormPageRef = useRef(formUIState?.currentFormPage);
  currentFormPageRef.current = formUIState?.currentFormPage;

  const pagesWithErrors = useMemo(() => getPagesWithErrors(formUIState ?? {}), [formUIState]);
  const { currentFormPage, currentFormPageFields } = formUIState ?? {};
  const [destFormPage, setDestFormPage] = useState(null);
  const [confirmingPageChange, setConfirmingPageChange] = useState(false);

  const pageNums = visibleFormPages.map(({ section }) => section);
  const pageNumsRef = useRef(pageNums);
  pageNumsRef.current = pageNums;

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
   * At computer+ widths, if `pageId` is menu-hidden, walk `pageNums` in `direction` (+1 next,
   * -1 previous) until a non-hidden id (or null). Otherwise return `pageId` unchanged.
   * Below computer width (or without `matchMedia`), returns `pageId` as-is.
   *
   * Uses `pageNumsRef` so media/`popstate` listeners registered once still see the current list.
   *
   * @param {string|null|undefined} pageId - Candidate adjacent page id
   * @param {1|-1} direction - Walk forward for next, backward for previous
   * @param {boolean|null} [atComputer=null] - When null, reads `matchMedia` for the computer breakpoint
   * @returns {string|null|undefined}
   */
  function resolveAdjacentPageForViewport(pageId, direction, atComputer = null) {
    if (atComputer === null && typeof window.matchMedia === "function") {
      atComputer = window.matchMedia(
        `(min-width: ${SEMANTIC_UI_COMPUTER_BREAKPOINT_PX}px)`
      ).matches;
    }
    if (!pageId || !atComputer) {
      return pageId;
    }
    if (!pageIdsHiddenAtComputerRef.current.includes(pageId)) {
      return pageId;
    }
    const pages = pageNumsRef.current;
    const startIndex = pages.indexOf(pageId);
    if (startIndex < 0) {
      return null;
    }
    for (let i = startIndex + direction; i >= 0 && i < pages.length; i += direction) {
      if (!pageIdsHiddenAtComputerRef.current.includes(pages[i])) {
        return pages[i];
      }
    }
    return null;
  }

  /**
   * From a resolved current page id, compute viewport-aware previous and next ids.
   *
   * @param {string} resolvedCurrent
   * @param {boolean|null} atComputer
   * @returns {{ previousFormPage: string|null, nextFormPage: string|null }}
   */
  function resolveAdjacentPagesForCurrent(resolvedCurrent, atComputer) {
    const pages = pageNumsRef.current;
    const idx = pages.indexOf(resolvedCurrent);
    const naivePrevious = idx > 0 ? pages[idx - 1] : null;
    const naiveNext = idx >= 0 && idx + 1 < pages.length ? pages[idx + 1] : null;
    return {
      previousFormPage:
        resolveAdjacentPageForViewport(naivePrevious, -1, atComputer) ?? null,
      nextFormPage: resolveAdjacentPageForViewport(naiveNext, 1, atComputer) ?? null,
    };
  }

  /**
   * Resolve the page the user should land on and the previous/next pages for the current viewport.
   *
   * At computer+ widths, remaps a menu-hidden `pageId` via `computerVisibleFallbackByPage`, then
   * derives previous/next from that resolved current via {@link resolveAdjacentPagesForCurrent}.
   * Below computer width (or without `matchMedia`), returns `pageId` and its adjacent ids.
   *
   * Return keys match `SET_CURRENT_FORM_PAGE` payload fields so callers can
   * `dispatch({ type, payload: resolvePageForViewport(...) })`.
   *
   * @param {string|null|undefined} pageId - Intended current page id
   * @returns {{
   *   currentFormPage: string|null|undefined,
   *   previousFormPage: string|null,
   *   nextFormPage: string|null
   * }}
   */
  function resolvePageForViewport(pageId) {
    if (!pageId) {
      return { currentFormPage: pageId, previousFormPage: null, nextFormPage: null };
    }
    const atComputer =
      typeof window.matchMedia === "function"
        ? window.matchMedia(`(min-width: ${SEMANTIC_UI_COMPUTER_BREAKPOINT_PX}px)`).matches
        : false;
    let currentFormPage = pageId;
    if (atComputer && pageIdsHiddenAtComputerRef.current.includes(pageId)) {
      currentFormPage = computerVisibleFallbackByPageRef.current[pageId] ?? pageId;
    }
    return {
      currentFormPage,
      ...resolveAdjacentPagesForCurrent(currentFormPage, atComputer),
    };
  }

  /**
   * Re-resolve current, previous, and next for the active viewport and update form UI state.
   *
   * Used when the computer breakpoint is crossed in either direction: remaps a computer-hidden
   * current page if needed, refreshes adjacent page ids (so shrink restores mobile-only targets),
   * and rewrites `?page=` with `replaceState` only when current changes.
   *
   * @param {string|null} [pageId] - Defaults to `currentFormPageRef.current`
   * @returns {string|null}
   */
  function syncFormPageForViewport(pageId) {
    const current = pageId ?? currentFormPageRef.current;
    const resolved = resolvePageForViewport(current);
    const payload = {
      ...resolved,
      currentFormPage: resolved.currentFormPage ?? current,
    };
    dispatch({ type: FORM_UI_ACTION.SET_CURRENT_FORM_PAGE, payload });
    if (payload.currentFormPage === current) {
      return current;
    }
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("page")) {
      urlParams.append("page", payload.currentFormPage);
    } else {
      urlParams.set("page", payload.currentFormPage);
    }
    const newURL = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState("fake-route", document.title, newURL);
    return payload.currentFormPage;
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
      const payload = resolvePageForViewport(urlFormPage);
      dispatch({ type: FORM_UI_ACTION.SET_CURRENT_FORM_PAGE, payload });
      if (payload.currentFormPage !== urlFormPage) {
        const rewriteParams = new URLSearchParams(window.location.search);
        if (!rewriteParams.has("page")) {
          rewriteParams.append("page", payload.currentFormPage);
        } else {
          rewriteParams.set("page", payload.currentFormPage);
        }
        const newURL = `${window.location.origin}${window.location.pathname}?${rewriteParams.toString()}`;
        window.history.replaceState("fake-route", document.title, newURL);
      }
      return payload.currentFormPage;
    }
    // Default to first visible page slug if available
    const payload = resolvePageForViewport(slugs[0]);
    dispatch({ type: FORM_UI_ACTION.SET_CURRENT_FORM_PAGE, payload });
    return payload.currentFormPage;
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
    const payload = resolvePageForViewport(first);
    dispatch({ type: FORM_UI_ACTION.SET_CURRENT_FORM_PAGE, payload });
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("page")) {
      urlParams.append("page", payload.currentFormPage);
    } else {
      urlParams.set("page", payload.currentFormPage);
    }
    const newURL = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState("fake-route", document.title, newURL);
  }, [visibleFormPages, currentFormPage, dispatch]);

  /**
   * When the viewport crosses the computer breakpoint in either direction, re-resolve current,
   * previous, and next (leave hidden pages on widen; restore mobile-only targets on shrink).
   */
  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return undefined;
    }
    const mediaQuery = window.matchMedia(`(min-width: ${SEMANTIC_UI_COMPUTER_BREAKPOINT_PX}px)`);

    const onChange = () => {
      syncFormPageForViewport();
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
      const payload = resolvePageForViewport(value);
      const destPage = payload.currentFormPage;

      const originPageFields = currentFormPageFields[currentFormPage] || [];
      const destPageFields = currentFormPageFields[destPage] || [];

      const errorFieldsForOriginPage = pagesWithErrors[currentFormPage] ?? [];
      const errorFieldsForDestPage = pagesWithErrors[destPage] ?? [];

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
        setDestFormPage(destPage);
        setTimeout(() => {
          confirmModalRef.current?.focus();
        }, 20);
      } else {
        setDestFormPage(null);
        dispatch({ type: FORM_UI_ACTION.SET_CURRENT_FORM_PAGE, payload });
        setFormPageInHistory(destPage);
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
      handleFormPageChange,
      handlePageChangeCancel,
      handlePageChangeConfirm,
    }),
    [
      confirmingPageChange,
      handleFormPageChange,
      handlePageChangeCancel,
      handlePageChangeConfirm,
    ]
  );
};

export { useFormPageNavigation };
