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
    <Overridable
      id="InvenioModularDepositForm.footerRegion.container"
      subsections={subsections}
      {...props}
    >
      <>
        {children}
        {subsections?.length > 0 && (
          <SubsectionsRenderer
            className={`form-footer-region row ${props?.classnames ? props.classnames : ""}`}
            id="rdm-deposit-form-footer"
            subsections={subsections}
          />
        )}
      </>
    </Overridable>
  );
};

FormFooterRegion.propTypes = {
  subsections: PropTypes.array,
  children: PropTypes.node,
};

export { FormFooterRegion };
