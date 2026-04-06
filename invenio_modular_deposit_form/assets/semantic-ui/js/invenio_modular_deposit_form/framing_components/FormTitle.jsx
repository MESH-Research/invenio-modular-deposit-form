// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import PropTypes from "prop-types";
import { useStore } from "react-redux";
import { Grid } from "semantic-ui-react";
import { makeFormHeading, makeSelectedCommunityLabel } from "../helpers/depositFormTitleText";

/**
 * Record title (h1 + optional community line) in a grid column. Used as a FormTitle region subsection;
 * widths and `only` come from config (like SpacerColumn).
 */
const FormTitle = ({ classnames, section: _section, ...props }) => {
  const { record, editorState, config } = useStore().getState().deposit ?? {};
  const selectedCommunityLabel = makeSelectedCommunityLabel(editorState?.selectedCommunity);

  return (
    <Grid.Column className={classnames} {...props}>
      <h1 className="ui header">{makeFormHeading(record)}</h1>
      {!!selectedCommunityLabel && !config?.show_community_banner_at_top && (
        <h2 className="ui header preselected-community-header">
          for {selectedCommunityLabel}
        </h2>
      )}
    </Grid.Column>
  );
};

FormTitle.propTypes = {
  classnames: PropTypes.string,
  section: PropTypes.string,
};

export { FormTitle };
