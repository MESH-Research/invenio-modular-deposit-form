// Part of the Knowledge Commons Repository
// Copyright (C) 2023 MESH Research
//
// based on portions of InvenioRDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021-2022 Graz University of Technology.
// Copyright (C) 2022-2023 KTH Royal Institute of Technology.
//
// The Knowledge Commons Repository and Invenio App RDM are both free software;
// you can redistribute them and/or modify them
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useContext } from "react";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import {
  AdditionalDatesComponent,
  DateComponent,
} from "./field_components";
import { FormUIStateContext } from "../InnerDepositForm";

const CombinedDatesComponent = ({ ...extraProps }) => {
  const { vocabularies } = useContext(FormUIStateContext);
  return (
    <>
      <DateComponent {...extraProps } />
      <AdditionalDatesComponent vocabularies={vocabularies} />
    </>
  );
};

// const SubmitActionsComponent = () => {
//   const store = useStore();
//   const record = store.getState().deposit.record;
//   const permissions = store.getState().deposit.permissions;

//   return (
//     <Grid className="submit-actions">
//       <Grid.Row>
//         <Grid.Column width="16">
//           <AccessRightsComponent permissions={permissions} />
//         </Grid.Column>
//       </Grid.Row>
//       <Grid.Row className="submit-buttons-row">
//         <SubmissionComponent record={record} permissions={permissions} />
//       </Grid.Row>
//     </Grid>
//   );
// };

export {
  CombinedDatesComponent,
  // SubmitActionsComponent,
};
