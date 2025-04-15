import React, { useEffect, useState } from "react";
import { Button, Icon, Modal } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropsTypes from "prop-types";

const RecoveryModal = ({
  confirmModalRef,
  handleStorageData,
  isDraft,
  isVersionDraft,
  setRecoveryAsked,
}) => {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    window.setTimeout(() => {
      document.getElementById("recovery-modal-no-button").focus();
    }, 20);
  }, []);

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
    >
      <Modal.Header>
        <Icon name="redo" /> {i18next.t("Recover unsaved information?")}
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>
            {i18next.t(
              "This form was closed with unsaved information. Do you want to recover it and continue with the same work?"
            )}
          </p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button
          // color="black"
          content={
            isDraft
              ? i18next.t("No, start a new work")
              : i18next.t("No, start from the saved version")
          }
          onClick={() => {
            setOpen(false);
            setRecoveryAsked(true);
            handleStorageData(false);
          }}
          id="recovery-modal-no-button"
        />
        <Button
          content={
            isDraft
              ? i18next.t("Yes, recover the unsaved draft")
              : i18next.t("Yes, recover the unsaved changes")
          }
          labelPosition="right"
          icon="checkmark"
          onClick={() => {
            setOpen(false);
            setRecoveryAsked(true);
            handleStorageData(true);
          }}
          positive
          ref={confirmModalRef}
        />
      </Modal.Actions>
    </Modal>
  );
};

RecoveryModal.propTypes = {
  confirmModalRef: PropsTypes.object.isRequired,
  handleStorageData: PropsTypes.func.isRequired,
  isDraft: PropsTypes.bool.isRequired,
  isVersionDraft: PropsTypes.bool.isRequired,
  setRecoveryAsked: PropsTypes.func.isRequired,
};

export { RecoveryModal };