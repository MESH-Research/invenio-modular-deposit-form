// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import PropTypes from "prop-types";
import { Field } from "formik";
import { connect, useStore } from "react-redux";
import { Grid, Icon, Popup } from "semantic-ui-react";
import {
  AccessMessage,
  EmbargoAccess,
  FilesAccess,
  MetadataAccess,
} from "@js/invenio_rdm_records/src/deposit/fields/AccessField/components";

/**
 * HorizontalAccessComponent renders the access controls (metadata/files/embargo)
 * alongside the dynamic `AccessMessage` summary in two equal columns at tablet+
 * widths. On mobile the message column collapses to an info-icon Popup anchored
 * at the top-right of the controls column.
 *
 * This intentionally re-implements the inner two-column layout of
 * `AccessRightField` (rather than wrapping it) so that we can:
 *   - drop the field label (the FormPage section already provides one), and
 *   - render only the controls on the left, exposing the live `AccessMessage`
 *     in the right column / mobile popup without the duplicated message that
 *     `AccessRightField` would otherwise embed inside its own right column.
 *
 * Sub-components are imported via deep path from `@js/invenio_rdm_records/src/...`
 * because the package's public index only exports `AccessRightField`. The
 * kcworks parent override of `AccessMessage` (assets/js/.../access_rights_components)
 * is not used here; activating it would require adding a webpack alias to
 * site/kcworks/webpack.py for that path.
 */

const ControlsAndMessageInner = ({ formik, community, showMetadataAccess }) => {
  const isGhostCommunity = community?.is_ghost === true;
  const communityAccess =
    (community && !isGhostCommunity && community.access?.visibility) || "public";
  const isMetadataOnly = !formik.form.values.files?.enabled;
  const access = formik.field.value;

  const controls = (
    <>
      {showMetadataAccess && (
        <MetadataAccess
          recordAccess={access.record}
          communityAccess={communityAccess}
        />
      )}
      <FilesAccess
        access={access}
        accessCommunity={communityAccess}
        metadataOnly={isMetadataOnly}
      />
      <EmbargoAccess
        access={access}
        accessCommunity={communityAccess}
        metadataOnly={isMetadataOnly}
      />
    </>
  );

  const message = (
    <AccessMessage
      access={access}
      accessCommunity={communityAccess}
      metadataOnly={isMetadataOnly}
    />
  );

  return (
    <Grid relaxed stackable columns={2} className="horizontal-access">
      <Grid.Column className="horizontal-access-controls">
        <div className="mobile only horizontal-help-trigger">
          <Popup
            trigger={
              <Icon
                name="info circle"
                size="large"
                link
                aria-label="Visibility status summary"
              />
            }
            content={message}
            position="bottom right"
            wide="very"
            on="click"
          />
        </div>
        {controls}
      </Grid.Column>
      <Grid.Column className="computer tablet only horizontal-access-message">
        {message}
      </Grid.Column>
    </Grid>
  );
};

ControlsAndMessageInner.propTypes = {
  formik: PropTypes.object.isRequired,
  community: PropTypes.object,
  showMetadataAccess: PropTypes.bool,
};

ControlsAndMessageInner.defaultProps = {
  community: undefined,
  showMetadataAccess: true,
};

const ConnectedControlsAndMessage = connect(
  (state) => ({ community: state.deposit.editorState?.selectedCommunity }),
  null
)(ControlsAndMessageInner);

const HorizontalAccessComponent = () => {
  const store = useStore();
  const { permissions } = store.getState().deposit;
  const showMetadataAccess = permissions?.can_manage_record_access ?? true;

  return (
    <Field name="access">
      {(formik) => (
        <ConnectedControlsAndMessage
          formik={formik}
          showMetadataAccess={showMetadataAccess}
        />
      )}
    </Field>
  );
};

export { HorizontalAccessComponent };
