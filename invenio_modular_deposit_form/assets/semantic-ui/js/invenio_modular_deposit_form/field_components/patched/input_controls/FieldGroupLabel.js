// Part of invenio-modular-deposit-form
// Copyright (C) 2026 Mesh Research.
//
// Visual group title for composite deposit fields (arrays, uploaders, multi-control
// widgets). Not a control `<label>`: the wrapping FormSection fieldset + sr-only
// `<legend>` names the group for assistive tech. Sighted users see this span;
// `aria-hidden` avoids a duplicate announcement next to that legend.

import React from "react";
import PropTypes from "prop-types";
import { Icon } from "semantic-ui-react";

/**
 * Sighted-only group heading for composite fields.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.label]
 * @param {string} [props.icon] Semantic UI icon name
 * @param {string} [props.className]
 */
export function FieldGroupLabel({ label, icon, className, ...rest }) {
  if (label == null || label === false) {
    return null;
  }
  if (typeof label === "string" && label.trim() === "") {
    return null;
  }
  return (
    <span className={className} aria-hidden="true" {...rest}>
      {label}
      {icon ? <Icon name={icon} className="small ml-10" /> : null}
    </span>
  );
}

FieldGroupLabel.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  icon: PropTypes.string,
  className: PropTypes.string,
};

FieldGroupLabel.defaultProps = {
  className: "field-label-class invenio-field-label",
  icon: undefined,
  label: undefined,
};
