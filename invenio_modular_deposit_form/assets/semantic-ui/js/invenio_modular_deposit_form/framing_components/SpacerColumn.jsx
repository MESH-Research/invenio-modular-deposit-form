// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// invenio-modular-deposit-form is free software; you can redistribute and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { Grid } from "semantic-ui-react";

const SpacerColumn = ({ classnames, ...props }) => {
  return <Grid.Column className={classnames} {...props}></Grid.Column>;
};

export { SpacerColumn };
