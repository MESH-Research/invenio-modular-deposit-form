import React from "react";
import { Grid } from "semantic-ui-react";
import PropTypes from "prop-types";
import { SubsectionsRenderer } from "./SubsectionsRenderer";

/**
 * Full-width grid row: form header region. Renders config-defined subsections
 * via the component registry (e.g. FormStepper, or any other registered component).
 */
const FormHeaderRegion = ({ subsections = [] }) => {
  if (!subsections?.length) return null;
  return (
    <Grid.Row className="form-header-region" id="rdm-deposit-form-header">
      <Grid.Column width={16}>
        <SubsectionsRenderer subsections={subsections} />
      </Grid.Column>
    </Grid.Row>
  );
};

FormHeaderRegion.propTypes = {
  subsections: PropTypes.array,
};

export { FormHeaderRegion };
