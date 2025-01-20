import { Grid } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";

const FormHeader = ({ record, selectedCommunityLabel }) => {
  return (
    <Grid.Row className="deposit-form-header">
      <h1 className="ui header">
        {i18next.t(`${record.id !== null ? (record.status === "new_version_draft" ? "New Version of " : "Updating ") : "New "}
        ${["draft", "draft_with_review"].includes(record.status)
            ? "Draft "
            : "Published "
        }Work`)}
      </h1>
      {!!selectedCommunityLabel && (
          <h2 className="ui header preselected-community-header">
          for {selectedCommunityLabel}
          </h2>
      )}
    </Grid.Row>
  );
};

FormHeader.propTypes = {
  record: PropTypes.object.isRequired,
  selectedCommunityLabel: PropTypes.string,
};

export { FormHeader };
