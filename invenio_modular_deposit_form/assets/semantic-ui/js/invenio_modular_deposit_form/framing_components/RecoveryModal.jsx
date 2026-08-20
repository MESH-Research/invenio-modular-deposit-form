import React, { useEffect, useState } from "react";
import { Button, Icon, Modal } from "semantic-ui-react";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import PropsTypes from "prop-types";

const RecoveryModal = ({
  confirmModalRef,
  handleStorageData,
  isUnsavedDraft,
  setRecoveryAsked,
}) => {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    window.setTimeout(() => {
      document.getElementById("recovery-modal-no-button").focus();
    }, 20);
  }, []);

  return (
    <Modal onClose={() => setOpen(false)} onOpen={() => setOpen(true)} open={open}>
      <Modal.Header>
        <Icon name="redo" className="mr-15" />
        {isUnsavedDraft
          ? i18next.t("Recover unsaved draft?")
          : i18next.t("Recover unsaved changes?")}
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>
            {isUnsavedDraft
              ? i18next.t(
                  "This form was closed with draft work unsaved. Do you want to recover it and continue with the unsaved draft?"
                )
              : i18next.t(
                  "This form was closed with unsaved changes to your record. Do you want to recover the changes or start again from the last saved version?"
                )}
          </p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button
          // color="black"
          content={
            isUnsavedDraft
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
            isUnsavedDraft
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
