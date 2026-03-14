import { useEffect } from "react";
import { useStore } from "react-redux";
import { FORM_UI_ACTION } from "../helpers/formUIStateReducer";
import { flattenWrappers } from "../utils";

/**
 * Updates currentFormPageFields when currentResourceType changes (resource-type-specific form layout).
 * @param {Object} formUIState - Full form UI state object (currentResourceType, currentTypeFields)
 * @param {Function} dispatch - Form UI reducer dispatch
 * @param {object} fieldsByType
 * @param {object} componentsRegistry
 */
const useCurrentResourceTypeFields = (
  formUIState,
  dispatch,
  fieldsByType,
  componentsRegistry
) => {
  const store = useStore();
  const { currentResourceType, currentTypeFields } = formUIState;
  useEffect(() => {
    const formPages = store.getState().deposit?.config?.common_fields?.find(
      (item) => item.component === "FormPages"
    )?.subsections ?? [];
    let newTypeFields = {};
    for (const p of formPages) {
      let adjustedTypeFields = currentTypeFields;
      if (adjustedTypeFields?.[p.section]?.[0]?.same_as) {
        const newType = currentTypeFields[p.section][0].same_as;
        adjustedTypeFields = fieldsByType[newType];
        dispatch({ type: FORM_UI_ACTION.SET_CURRENT_TYPE_FIELDS, payload: adjustedTypeFields });
      }
      const pageFields = !!adjustedTypeFields?.[p.section]
        ? flattenWrappers({ subsections: adjustedTypeFields[p.section] })
        : flattenWrappers(p);
      const pageMetaFields = pageFields.reduce((accum, { component }) => {
        const entry = componentsRegistry[component];
        accum = accum.concat(entry?.[1] ?? []);
        return accum;
      }, []);
      newTypeFields[p.section] = pageMetaFields;
    }
    dispatch({ type: FORM_UI_ACTION.SET_CURRENT_FORM_PAGE_FIELDS, payload: newTypeFields });
  }, [currentResourceType]);
};

export { useCurrentResourceTypeFields };
