// Part of Invenio Modular Deposit Form
// Copyright (C) 2026 Mesh Research
//
// Replacement for stock ShareDraftButton / ShareButton: those hardcode
// labelPosition="left" and do not accept className. Reuses upstream ShareModal
// via DepositShareModal, keeping Formik as the live record (never mutating Redux).

import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useFormikContext } from "formik";
import _get from "lodash/get";
import { Button, Icon, Popup } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";

import { DepositShareModal } from "./DepositShareModal";
import {
  buildRecordForModal,
  fillMissingFromRedux,
  mergeShareRecordIntoFormik,
} from "./depositShareRecord";

/**
 * Deposit-form Share button with configurable icon label position.
 *
 * @param {object} props
 * @param {boolean} [props.disabled]
 * @param {object} props.record - Redux deposit record (read-only source for gaps)
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
  const { values, isSubmitting, setValues } = useFormikContext();
  const [modalOpen, setModalOpen] = useState(false);

  // After draft save, Redux may have server-owned fields Formik lacks until
  // reinitialize catches up — fill gaps into Formik (never Formik → Redux).
  useEffect(() => {
    const filled = fillMissingFromRedux(values, record);
    if (filled !== values) {
      setValues(filled);
    }
  }, [
    record,
    setValues,
    values,
    values.expanded,
    values.links,
    values.parent?.access?.grants,
    values.parent?.access?.links,
    values.parent?.access?.owned_by,
    values.parent?.access?.settings,
  ]);

  const handleRecordChangeFromModal = useCallback(
    (modalRecord) => {
      setValues(mergeShareRecordIntoFormik(values, modalRecord));
    },
    [setValues, values]
  );

  const handleOpen = () => {
    const filled = fillMissingFromRedux(values, record);
    if (filled !== values) {
      setValues(filled);
    }
    setModalOpen(true);
  };

  const filesEnabled = _get(values, "files.enabled", false);
  const numberOfFiles = _get(values, "files.count", 0);
  const filesMissing = filesEnabled && !numberOfFiles;
  const dataEmpty = Object.keys(values.expanded ?? {}).length === 0;
  const disabled = disabledProp || isSubmitting || filesMissing || dataEmpty;

  const recordForModal = buildRecordForModal(
    fillMissingFromRedux(values, record)
  );

  return (
    <>
      <Popup
        content={i18next.t("You don't have permissions to share this record.")}
        disabled={!disabled}
        trigger={
          <Button
            fluid
            onClick={handleOpen}
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
      {modalOpen && (
        <DepositShareModal
          open
          handleClose={() => setModalOpen(false)}
          record={recordForModal}
          permissions={permissions}
          groupsEnabled={groupsEnabled}
          onRecordChange={handleRecordChangeFromModal}
        />
      )}
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
