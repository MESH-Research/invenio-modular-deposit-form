// Part of the Knowledge Commons Repository
// Copyright (C) 2023 MESH Research
//
// based on portions of InvenioRDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021-2022 Graz University of Technology.
// Copyright (C) 2022-2023 KTH Royal Institute of Technology.
//
// The Knowledge Commons Repository and Invenio App RDM are both free software;
// you can redistribute them and/or modify them
// under the terms of the MIT License; see LICENSE file for more details.

import React, {
} from "react";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import { DepositFormApp } from "@js/invenio_rdm_records";
import PropTypes from "prop-types";
import { fieldComponents } from "./componentsMap";
import { InnerDepositForm } from "./InnerDepositForm";

const validator = require(`@js/invenio_modular_deposit_form_extras/validator.js`);
const validationSchema = validator?.validationSchema
  ? validator?.validationSchema
  : null;
const validate = validator?.validate ? validator?.validate : null;


/*
RDMDepositForm is the main component that we override to customize the deposit form. Whatever data preprocessing does not rely on form state happens at this level (e.g. generating vocabularies). But everything effected by form state and form values is handled by the child components.

Its child DepositFormApp (which further wraps DepositBootstrap) provides the Formik context and the api communication with InvenioRDM's back-end. We do not modify these higher-order components. Client-side form validators/validation schemas must be passed to DepositFormApp as props.

InnerDepositForm is a custom component that serves as the parent of all the form fields and handles the form page navigation. We pass all of the form UI configuration values directly to InnerDepositForm as props.
*/
export const RDMDepositForm = ({
  commonFields,
  config,
  currentUserprofile,
  defaultFieldValues,
  defaultResourceType,
  descriptionModifications,
  extraRequiredFields,
  files,
  fieldsByType,
  helpTextModifications,
  iconModifications,
  labelModifications,
  record,
  permissions,
  permissionsPerField,
  pidsConfigOverrides,
  placeholderModifications,
  preselectedCommunity,
  priorityFieldValues,
  previewableExtensions, // Add this new prop
}) => {


  // TODO: Make ALL vocabulary be generated by backend.
  // Currently, some vocabulary is generated by backend and some is
  // generated by frontend here. Iteration is faster and abstractions can be
  // discovered by generating vocabulary here. Once happy with vocabularies,
  // then we can generate it in the backend.
  const vocabularies = {
    metadata: {
      ...config.vocabularies,

      creators: {
        ...config.vocabularies.creators,
        type: [
          { text: "Person", value: "personal" },
          { text: "Organization", value: "organizational" },
        ],
      },

      contributors: {
        ...config.vocabularies.contributors,
        type: [
          { text: "Person", value: "personal" },
          { text: "Organization", value: "organizational" },
        ],
      },
      identifiers: {
        ...config.vocabularies.identifiers,
      },
    },
  };

  if (!!pidsConfigOverrides?.doi) {
    Object.assign(
      config.pids.filter((pid) => pid.scheme === "doi")[0],
      pidsConfigOverrides.doi
    );
  }

  return (
      <DepositFormApp
        config={config}
        record={record}
        preselectedCommunity={preselectedCommunity}
        files={files}
        permissions={permissions}
        validate={validate}
        validationSchema={validationSchema}
      >

        {/* InnerDepositForm is the main form component. It needs to be inside DepositFormApp because that (and its invisible child DepositBootstrap) provide the Formik context. InnerDepositForm is the parent of all the form fields and handles the form page navigation. */}
        <InnerDepositForm {...{
          commonFields,
          currentUserprofile,
          defaultFieldValues,
          defaultResourceType,
          descriptionModifications,
          extraRequiredFields,
          fieldsByType,
          fieldComponents,
          files,
          helpTextModifications,
          iconModifications,
          labelModifications,
          pidsConfigOverrides,
          permissions,
          permissionsPerField,
          placeholderModifications,
          preselectedCommunity,
          priorityFieldValues,
          previewableExtensions,
          record,
          vocabularies,
        }} />

      </DepositFormApp>
  );
};

RDMDepositForm.propTypes = {
  config: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  preselectedCommunity: PropTypes.object,
  files: PropTypes.object,
  permissions: PropTypes.object,
  previewableExtensions: PropTypes.array, // Add this new prop type
};

RDMDepositForm.defaultProps = {
  preselectedCommunity: undefined,
  permissions: null,
  files: null,
  previewableExtensions: [], // Add a default value if needed
};
