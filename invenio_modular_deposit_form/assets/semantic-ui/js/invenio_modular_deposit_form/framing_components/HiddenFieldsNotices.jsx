// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { HiddenFieldsBanner } from "./HiddenFieldsBanner";
import { useFormUIState } from "../FormUIStateManager.jsx";

/**
 * Footer notices for fields hidden on the current resource type.
 *
 * Mounts both {@link HiddenFieldsBanner} variants and resets dismiss state when
 * the user navigates to another form page. Intended as a StickyFooter subsection
 * so notices share the center column with the nav bar (and thus respect spacers).
 *
 * @param {string} [classnames] - Extra class names for the notices wrapper.
 */
const HiddenFieldsNotices = ({ classnames }) => {
  const { formUIState } = useFormUIState();
  const currentFormPage = formUIState?.currentFormPage;
  const [showHiddenErrorsMessage, setShowHiddenErrorsMessage] = useState(true);
  const [showHiddenValuesMessage, setShowHiddenValuesMessage] = useState(true);

  useEffect(() => {
    setShowHiddenErrorsMessage(true);
    setShowHiddenValuesMessage(true);
  }, [currentFormPage]);

  return (
    <div
      className={["sticky-footer-notices", "mb-5", classnames].filter(Boolean).join(" ")}
    >
      <HiddenFieldsBanner
        variant="errors"
        hidden={!showHiddenErrorsMessage}
        onDismiss={() => setShowHiddenErrorsMessage(false)}
      />
      <HiddenFieldsBanner
        variant="values"
        hidden={!showHiddenValuesMessage}
        onDismiss={() => setShowHiddenValuesMessage(false)}
      />
    </div>
  );
};

HiddenFieldsNotices.propTypes = {
  classnames: PropTypes.string,
};

export { HiddenFieldsNotices };
