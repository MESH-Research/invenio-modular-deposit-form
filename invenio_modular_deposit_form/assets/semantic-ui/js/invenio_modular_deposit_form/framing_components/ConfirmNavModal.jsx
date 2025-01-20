import { Confirm, Modal, Icon } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";

const ConfirmNavModal = ({
  confirmModalRef,
  handlePageChangeCancel,
  handlePageChangeConfirm,
  confirmingPageChange,
}) => {
  return (
    <Confirm
      icon="question circle outline"
      id="confirm-page-change"
      className="confirm-page-change"
      open={confirmingPageChange}
      header={i18next.t("Hmmm...")}
      content={
      <Modal.Content image>
          <Icon name="question circle outline" size="huge" />
          <Modal.Description>
          {i18next.t(
              "There are problems with the information you've entered. Do you want to fix them before moving on?"
          )}
          </Modal.Description>
      </Modal.Content>
      }
      confirmButton={
      <button className="ui button">
          {i18next.t("Continue anyway")}
      </button>
      }
      cancelButton={
      <button className="ui button positive" ref={confirmModalRef}>
          {i18next.t("Fix the problems")}
      </button>
      }
      onCancel={handlePageChangeCancel}
      onConfirm={handlePageChangeConfirm}
    />
  );
};

ConfirmNavModal.propTypes = {
  confirmModalRef: PropTypes.object.isRequired,
  handlePageChangeCancel: PropTypes.func.isRequired,
  handlePageChangeConfirm: PropTypes.func.isRequired,
  confirmingPageChange: PropTypes.bool.isRequired,
};

export { ConfirmNavModal };
