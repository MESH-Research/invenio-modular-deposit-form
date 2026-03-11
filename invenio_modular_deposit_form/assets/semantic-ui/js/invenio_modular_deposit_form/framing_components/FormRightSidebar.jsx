import React from "react";
import { Grid } from "semantic-ui-react";
import PropTypes from "prop-types";
import { SubsectionsRenderer } from "./SubsectionsRenderer";

/**
 * Right sidebar column. Optional responsive column widths from config
 * override the defaults (computer=3, mobile=16).
 */
const DEFAULTS = { computer: 3, mobile: 16 };

const FormRightSidebar = ({
  subsections = [],
  mobile,
  tablet,
  computer,
  largeScreen,
  widescreen,
}) => {
  if (!subsections?.length) return null;
  const columnProps = {
    ...DEFAULTS,
    ...(mobile != null && { mobile }),
    ...(tablet != null && { tablet }),
    ...(computer != null && { computer }),
    ...(largeScreen != null && { largeScreen }),
    ...(widescreen != null && { widescreen }),
  };
  return (
    <Grid.Column {...columnProps} className="deposit-right-sidebar deposit-sidebar">
      <SubsectionsRenderer subsections={subsections} />
    </Grid.Column>
  );
};

FormRightSidebar.propTypes = {
  subsections: PropTypes.array,
  mobile: PropTypes.number,
  tablet: PropTypes.number,
  computer: PropTypes.number,
  largeScreen: PropTypes.number,
  widescreen: PropTypes.number,
};

export { FormRightSidebar };
