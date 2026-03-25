// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2023-2026 MESH Research
//
// Invenio Modular Deposit Form is free software;
// you can redistribute them and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { useEffect } from "react";
import { useStore } from "react-redux";
import { FORM_UI_ACTION } from "../helpers/formUIStateReducer";
import { flattenWrappers, getVisibleFormPages } from "../utils";

/**
 * Fills `formUIState.currentFormPageFields`: for each configured FormPage, the list of Formik
 * field paths (from the component registry) that appear on that page for the active layout.
 *
 * For each page in `formPages`, widgets are taken from the type layout slice `initialLayout[section]`
 * when set; otherwise from the common page config. If that slice is a `same_as` placeholder,
 * dispatches `SET_CURRENT_TYPE_FIELDS` with the referenced template and flattens widgets from that
 * template for this page. Each iteration still reads `same_as` from `initialLayout` only (not from
 * a previous page’s template), matching existing behavior.
 *
 * Dispatches `SET_CURRENT_FORM_PAGE_FIELDS` with `{ [pageSection]: string[] }`.
 *
 * @returns {Object} Layout slice to pass to `getVisibleFormPages`: same as the reducer’s
 *   `currentTypeFields` after this loop (last `SET_CURRENT_TYPE_FIELDS` wins).
 */
function dispatchPerPageFormikFieldPaths({
  formPages,
  initialLayout,
  fieldsByType,
  componentsRegistry,
  dispatch,
}) {
  let layoutSliceForVisibility = initialLayout;
  const perPageFormikPaths = {};

  for (const page of formPages) {
    let layoutForPage = initialLayout;
    if (layoutForPage?.[page.section]?.[0]?.same_as) {
      const templateTypeId = initialLayout[page.section][0].same_as;
      layoutForPage = fieldsByType[templateTypeId];
      dispatch({ type: FORM_UI_ACTION.SET_CURRENT_TYPE_FIELDS, payload: layoutForPage });
      layoutSliceForVisibility = layoutForPage;
    }

    const nodes = !!layoutForPage?.[page.section]
      ? flattenWrappers({ subsections: layoutForPage[page.section] })
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

  return layoutSliceForVisibility;
}

function dispatchVisiblePages(dispatch, formPages, layoutSlice, fieldsByType) {
  dispatch({
    type: FORM_UI_ACTION.SET_VISIBLE_FORM_PAGES,
    payload: getVisibleFormPages(formPages, layoutSlice, fieldsByType),
  });
}

/**
 * Single place for resource-type layout sync: Formik → form UI useReducer, using deposit config
 * from the Redux store. Copies `metadata.resource_type` and the matching `fields_by_type` slice
 * into `formUIState` (useReducer in FormLayoutContainer), then updates visible pages and per-page
 * field paths for FormErrorManager / nav.
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
    const layoutForType = fieldsByType[resourceTypeId] ?? {};

    dispatch({
      type: FORM_UI_ACTION.SET_CURRENT_RESOURCE_TYPE,
      payload: resourceTypeId,
    });
    dispatch({
      type: FORM_UI_ACTION.SET_CURRENT_TYPE_FIELDS,
      payload: layoutForType,
    });

    const formPages =
      store
        .getState()
        .deposit?.config?.common_fields?.find((item) => item.component === "FormPages")
        ?.subsections ?? [];

    const layoutForVisibility = dispatchPerPageFormikFieldPaths({
      formPages,
      initialLayout: layoutForType,
      fieldsByType,
      componentsRegistry,
      dispatch,
    });

    dispatchVisiblePages(dispatch, formPages, layoutForVisibility, fieldsByType);
  }, [formik.values.metadata.resource_type, fieldsByType, componentsRegistry, dispatch, store]);
};

export { useCurrentResourceTypeFields };
