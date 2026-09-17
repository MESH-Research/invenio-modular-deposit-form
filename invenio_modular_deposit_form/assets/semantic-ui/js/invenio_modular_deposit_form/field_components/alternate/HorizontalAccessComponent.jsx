// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { Grid } from "semantic-ui-react";
import { AccessRightsComponent } from "../field_components";

const HorizontalAccessComponent = () => {
  return (
    <Grid relaxed stackable columns={2} className="horizontal-access pt-0">
      <Grid.Column className="horizontal-access-controls pt-0">
        <AccessRightsComponent label={null} />
      </Grid.Column>
      <Grid.Column className="horizontal-access-message pt-0 tablet only" />
    </Grid>
  );
};

export { HorizontalAccessComponent };
