// Part of Invenio Modular Deposit Form
// Copyright (C) 2026 Mesh Research
//
// Replacement for stock ShareDraftButton / ShareButton: those hardcode
// labelPosition="left" and do not accept className. Reuses upstream ShareModal.

import React, { useState } from "react";
import PropTypes from "prop-types";
import { useFormikContext } from "formik";
import { useSelector } from "react-redux";
import _get from "lodash/get";
import { Button, Icon, Popup } from "semantic-ui-react";
import { ShareModal } from "@js/invenio_app_rdm/landing_page/ShareOptions/ShareModal";
import { i18next } from "@translations/invenio_app_rdm/i18next";

/**
 * Deposit-form Share button with configurable icon label position.
 *
 * @param {object} props
 * @param {boolean} [props.disabled]
 * @param {object} props.record
 * @param {object} props.permissions
 * @param {boolean} props.groupsEnabled
 * @param {"left"|"right"} [props.labelPosition]
 * @param {string} [props.className]
 */
export const ShareDraftButton = ({
  disabled: disabledProp = false,
  record,
  permissions,
  groupsEnabled,
  labelPosition = "right",
  className,
}) => {
  const { values, isSubmitting } = useFormikContext();
  const numberOfFiles = useSelector(
    (state) => Object.values(state.files.entries).length
  );
  const [modalOpen, setModalOpen] = useState(false);

  // Same sync as stock ShareDraftButton so ShareModal sees form values.
  record.expanded = values.expanded;
  record.links = values.links;
  if (record.parent?.access) {
    record.parent.access.settings = values.parent?.access?.settings;
  }

  const filesEnabled = _get(values, "files.enabled", false);
  const filesMissing = filesEnabled && !numberOfFiles;
  const dataEmpty = Object.keys(values.expanded ?? {}).length === 0;
  const disabled =
    disabledProp || isSubmitting || filesMissing || dataEmpty;

  return (
    <>
      <Popup
        content={i18next.t("You don't have permissions to share this record.")}
        disabled={!disabled}
        trigger={
          <Button
            fluid
            onClick={() => setModalOpen(true)}
            disabled={disabled}
            primary
            size="medium"
            aria-haspopup="dialog"
            icon
            labelPosition={labelPosition}
            className={className}
          >
            <Icon name="share square" />
            {i18next.t("Share")}
          </Button>
        }
      />
      <ShareModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        record={record}
        permissions={permissions}
        groupsEnabled={groupsEnabled}
      />
    </>
  );
};

ShareDraftButton.propTypes = {
  disabled: PropTypes.bool,
  record: PropTypes.object.isRequired,
  permissions: PropTypes.object.isRequired,
  groupsEnabled: PropTypes.bool.isRequired,
  labelPosition: PropTypes.oneOf(["left", "right"]),
  className: PropTypes.string,
};
