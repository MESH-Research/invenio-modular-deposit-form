import React from "react";
import { Grid } from "semantic-ui-react";
import PropTypes from "prop-types";
import { SubsectionsRenderer } from "./SubsectionsRenderer";

/**
 * Full-width grid row: form footer region. Renders children (e.g. observation target)
 * then config-defined subsections via the component registry.
 */
const FormFooterRegion = ({ subsections = [], children }) => {
  if (!subsections?.length && !children) return null;
  return (
    <Grid.Row className="form-footer-region" id="rdm-deposit-form-footer">
      <Grid.Column width={16}>
        {children}
        {subsections?.length > 0 && (
          <SubsectionsRenderer subsections={subsections} />
        )}
      </Grid.Column>
    </Grid.Row>
  );
};

FormFooterRegion.propTypes = {
  subsections: PropTypes.array,
  children: PropTypes.node,
};

export { FormFooterRegion };
