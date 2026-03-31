// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2025 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import PropTypes from "prop-types";
import { Button } from "semantic-ui-react";
import { i18next } from "@translations/invenio_rdm_records/i18next";
import { NamesAutocompleteOptions } from "./CreatibutorsInlineForm";

const CreatibutorsFormActionButtons = ({
  autocompleteNames,
  handleCancel,
  handleSave,
  index,
  isNewItem,
  removeCreatibutor,
  saveAndContinueLabel,
  setPersonDetailsExpanded,
}) => {
  const personDetailsExpandedAfterSave = () =>
    autocompleteNames !== NamesAutocompleteOptions.SEARCH_ONLY;
  return (
    <>
      <Button
        name="cancel"
        onClick={() => {
          handleCancel(removeCreatibutor, index);
        }}
        icon="remove"
        content={i18next.t("Cancel")}
        floated="left"
      />
      <div className="right-buttons right floated">
        {isNewItem && (
          <Button
            name="saveAndContinue"
            onClick={() => {
              setPersonDetailsExpanded(personDetailsExpandedAfterSave());
              handleSave("saveAndContinue");
            }}
            primary
            icon="checkmark"
            content={saveAndContinueLabel}
          />
        )}
        <Button
          name="save"
          onClick={() => {
            setPersonDetailsExpanded(personDetailsExpandedAfterSave());
            handleSave("saveAndClose");
          }}
          primary
          icon="checkmark"
          content={i18next.t("Save")}
        />
      </div>
    </>
  );
};

CreatibutorsFormActionButtons.propTypes = {
  autocompleteNames: PropTypes.string.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  isNewItem: PropTypes.bool,
  removeCreatibutor: PropTypes.func.isRequired,
  saveAndContinueLabel: PropTypes.string.isRequired,
  setPersonDetailsExpanded: PropTypes.func.isRequired,
};

export { CreatibutorsFormActionButtons };
