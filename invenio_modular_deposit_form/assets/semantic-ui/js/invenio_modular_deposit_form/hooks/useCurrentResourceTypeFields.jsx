import { useEffect } from "react";
import { flattenWrappers } from "../utils";
/**
 * Custom React hook to update formPageFields when currentResourceType changes
 *
 * Helps the upload form adapt it's displayed fields based on the selected
 * resource type.
 *
 * @param {string} currentResourceType
 * @param {object} currentTypeFields
 * @param {function} setCurrentTypeFields
 * @param {object} fieldsByType
 * @param {array} formPages
 * @param {function} setFormPageFields
 */
const useCurrentResourceTypeFields = (
  currentResourceType,
  currentTypeFields,
  setCurrentTypeFields,
  setFormPageFields,
  formPages,
  fieldsByType,
  fieldComponents
) => {
  useEffect(() => {

    let newTypeFields = {};
    for (const p of formPages) {
      // collect form widget slugs
      let adjustedTypeFields = currentTypeFields;
      if ( adjustedTypeFields?.[p.section]?.[0]?.same_as) {
        const newType = currentTypeFields[p.section][0].same_as;
        adjustedTypeFields = fieldsByType[newType];
        setCurrentTypeFields(adjustedTypeFields);
      }
      const pageFields = !!adjustedTypeFields?.[p.section]
          ? flattenWrappers({ subsections: adjustedTypeFields[p.section] })
          : flattenWrappers(p);
      // get form field label for each slug
      const pageMetaFields = pageFields.reduce((accum, { component }) => {
        accum = accum.concat(fieldComponents[component][1]);
        return accum;
      }, []);
      newTypeFields[p.section] = pageMetaFields;
    }
    setFormPageFields(newTypeFields);
  }, [currentResourceType]);
};

export { useCurrentResourceTypeFields };