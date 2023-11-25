import React, { useEffect, useState } from "react";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { CustomFields, loadWidgetsFromConfig } from "react-invenio-forms";
// import PropTypes from "prop-types";
import Overridable from "react-overridable";

/**
 * A React component to insert UI for a single custom fields section
 *
 * @param {string} sectionName  The label for the form section containing the
 *                              custom field(s) to be injected. Taken from the
 *                              custom field ui declaration for the field.
 * @param {string} idString  The string identifier to be used in building
 *                           the id for this field's container
 * @param {object} customFieldsUI  The whole custom fields ui declaration
 *                                 taken from the form's config
 */
const CustomFieldInjector = ({
  sectionName,
  fieldName,
  idString,
  customFieldsUI,
  ...restArgs
}) => {
  const [MyWidget, setMyWidget] = useState();
  console.log("customFieldsUI", customFieldsUI);
  console.log("sectionName", sectionName);
  const chosenSetConfig = new Array(
    customFieldsUI.find((item) => item.section === sectionName)
  );
  console.log("chosenSetConfig", chosenSetConfig);
  console.log("chosenSetConfig", chosenSetConfig[0]);
  console.log("chosenSetConfig", chosenSetConfig[0].fields);
  const chosenFieldConfig = chosenSetConfig[0].fields.find(
    (item) => item.field === fieldName
  );
  chosenFieldConfig.props = { ...chosenFieldConfig.props, ...restArgs };
  const templateLoaders = [
    (widget) => import(`@templates/custom_fields/${widget}.js`),
    (widget) => import(`@templates/custom_fields/${widget}.jsx`),
    (widget) => import(`@js/invenio_rdm_records/src/deposit/customFields`),
    (widget) => import(`react-invenio-forms`),
  ];
  const fieldPathPrefix = "custom_fields";
  useEffect(() => {
    loadWidgetsFromConfig({
      templateLoaders: templateLoaders,
      fieldPathPrefix: fieldPathPrefix,
      fields: new Array(chosenFieldConfig),
    }).then((x) => setMyWidget(x[0]));
  }, []);

  return (
    <Overridable
      id={`InvenioAppRdm.Deposit.${idString}.container`}
      customFieldsUI={chosenSetConfig}
    >
      <>
        {MyWidget}
        {/* <CustomFields
        config={chosenSetConfig}
        templateLoaders={templateLoaders}
        fieldPathPrefix="custom_fields"
      /> */}
      </>
    </Overridable>
  );
};

const CustomFieldSectionInjector = ({
  sectionName,
  idString,
  customFieldsUI,
}) => {
  const chosenSetConfig = new Array(
    customFieldsUI.find((item) => item.section === sectionName)
  );
  const templateLoaders = [
    (widget) => import(`@templates/custom_fields/${widget}.js`),
    (widget) => import(`@js/invenio_rdm_records/src/deposit/customFields`),
    (widget) => import(`react-invenio-forms`),
  ];

  return (
    <Overridable
      id={`InvenioAppRdm.Deposit.${idString}.container`}
      customFieldsUI={chosenSetConfig}
    >
      <CustomFields
        config={chosenSetConfig}
        templateLoaders={templateLoaders}
        fieldPathPrefix="custom_fields"
      />
    </Overridable>
  );
};

export { CustomFieldInjector, CustomFieldSectionInjector };
