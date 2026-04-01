// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research
//
// Invenio Modular Deposit Form is free software;
// you can redistribute them and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { useEffect } from "react";
import { useStore } from "react-redux";
import { FORM_UI_ACTION } from "../helpers/formUIStateReducer";
import {
  filterVisibleFormPages,
  flattenWrappers,
  getResolvedFormPages,
} from "../utils";

/**
 * Fills `formUIState.currentFormPageFields`: for each configured FormPage, the list of Formik
 * field paths (from the component registry) that appear on that page for the active layout.
 *
 * Uses `resolvedFormPages[i]` (merged common + type layout) when that row has subsections;
 * otherwise falls back to the common `formPages[i]` tree. Same ordering as `formPages`.
 *
 * Dispatches `SET_CURRENT_FORM_PAGE_FIELDS` with `{ [pageId]: string[] }` (keys are each page’s `section` today).
 *
 * @returns {void}
 */
function dispatchPerPageFormikFieldPaths({
  formPages,
  resolvedFormPages,
  componentsRegistry,
  dispatch,
}) {
  const perPageFormikPaths = {};

  for (let i = 0; i < formPages.length; i++) {
    const page = formPages[i];
    const merged = resolvedFormPages[i];
    const subs = merged?.subsections ?? [];
    const nodes =
      Array.isArray(subs) && subs.length > 0
        ? flattenWrappers({ subsections: subs })
        : flattenWrappers(page);

    perPageFormikPaths[page.section] = nodes.reduce((paths, { component }) => {
      const regEntry = componentsRegistry[component];
      return paths.concat(regEntry?.[1] ?? []);
    }, []);
  }

  dispatch({
    type: FORM_UI_ACTION.SET_CURRENT_FORM_PAGE_FIELDS,
    payload: perPageFormikPaths,
  });
}

/**
 * Single place for resource-type layout sync: Formik → form UI useReducer, using deposit config
 * from the Redux store. Copies `metadata.resource_type` and the matching `fields_by_type` slice
 * into `formUIState` (useReducer in FormLayoutContainer), then updates resolved/visible pages and
 * per-page field paths for FormErrorManager / nav.
 *
 * Resolves merged layout **once** per effect (`getResolvedFormPages`), stores full list as
 * `resolvedFormPages` and the non-empty subset as `visibleFormPages` in one dispatch.
 *
 * @param {Object} formik - Formik instance (`values.metadata.resource_type` is the source of truth)
 * @param {Function} dispatch - Dispatch for form UI state only (FORM_UI_ACTION / formUIStateReducer), not Redux
 * @param {Object} fieldsByType - From deposit Redux state (`config.fields_by_type` / MODULAR_DEPOSIT_FORM_FIELDS_BY_TYPE)
 * @param {Object} componentsRegistry - component registry for field path metadata
 */
const useCurrentResourceTypeFields = (formik, dispatch, fieldsByType, componentsRegistry) => {
  const store = useStore();

  useEffect(() => {
    const resourceTypeId = formik.values.metadata.resource_type;
    const currentTypePageConfigs = fieldsByType[resourceTypeId] ?? {};

    dispatch({
      type: FORM_UI_ACTION.SET_CURRENT_RESOURCE_TYPE,
      payload: resourceTypeId,
    });
    dispatch({
      type: FORM_UI_ACTION.SET_CURRENT_TYPE_PAGE_CONFIGS,
      payload: currentTypePageConfigs,
    });

    const formPages =
      store
        .getState()
        .deposit?.config?.common_fields?.find((item) => item.component === "FormPages")
        ?.subsections ?? [];

    for (const page of formPages) {
      const pageRaw = currentTypePageConfigs?.[page.section];
      if (
        pageRaw &&
        typeof pageRaw === "object" &&
        !Array.isArray(pageRaw) &&
        typeof pageRaw.same_as === "string" &&
        pageRaw.same_as.trim() !== ""
      ) {
        const templateTypeId = pageRaw.same_as;
        dispatch({
          type: FORM_UI_ACTION.SET_CURRENT_TYPE_PAGE_CONFIGS,
          payload: fieldsByType[templateTypeId],
        });
      }
    }

    const resolvedFormPages = getResolvedFormPages(
      formPages,
      currentTypePageConfigs,
      fieldsByType,
      resourceTypeId
    );
    const visibleFormPages = filterVisibleFormPages(resolvedFormPages);

    dispatch({
      type: FORM_UI_ACTION.SET_FORM_PAGES_LAYOUT,
      payload: { resolvedFormPages, visibleFormPages },
    });

    dispatchPerPageFormikFieldPaths({
      formPages,
      resolvedFormPages,
      componentsRegistry,
      dispatch,
    });
  }, [formik.values.metadata.resource_type, fieldsByType, componentsRegistry, dispatch, store]);
};

export { useCurrentResourceTypeFields };
