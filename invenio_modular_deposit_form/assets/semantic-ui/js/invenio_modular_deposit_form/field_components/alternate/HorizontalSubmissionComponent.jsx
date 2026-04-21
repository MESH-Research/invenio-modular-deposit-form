// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { useStore } from "react-redux";
import { Grid, Icon, Popup } from "semantic-ui-react";
import { SubmissionComponent } from "../field_components";

/**
 * HorizontalSubmissionComponent renders the publish/save submission card alongside
 * the explanatory help text in two equal columns at tablet+ widths. On mobile the
 * help text column collapses to an info-icon Popup anchored at the top-right of
 * the submission column.
 *
 * Form feedback is intentionally omitted here. The alternate_paged layout renders
 * `FormFeedbackComponent` full-width under the stepper (header section) at
 * mobile/tablet, since at computer+ widths the feedback lives in the right
 * sidebar.
 *
 * The left column reuses the `SubmissionComponent` from `field_components` so the
 * button stack stays in sync with the sidebar version (no duplication of
 * SaveButton/PreviewButton/PublishButton/ShareDraftButton/DeleteButton wiring).
 */
const HelpTextContent = ({ canDeleteDraft }) => (
  <>
    <p>
      <b>Draft deposits</b> can be edited
      {canDeleteDraft && ", deleted,"} and the files can be added or changed.
    </p>
    <p>
      <b>Published deposits</b> can still be edited, but you will no longer be able to{" "}
      {canDeleteDraft && "delete the deposit or "}change the attached files. To add or
      change files for a published deposit you must create a new version of the record.
    </p>
    <p>
      Deposits can only be <b>deleted while they are drafts</b>. Once you publish your
      deposit, you can only restrict access and/or create a new version.
    </p>
  </>
);

const HorizontalSubmissionComponent = () => {
  const store = useStore();
  const { permissions } = store.getState().deposit;
  const canDeleteDraft = !!permissions?.can_delete_draft;

  return (
    <Grid relaxed stackable columns={2} className="horizontal-submission">
      <Grid.Column className="horizontal-submission-controls">
        <div className="mobile only horizontal-help-trigger">
          <Popup
            trigger={
              <Icon
                name="info circle"
                size="large"
                link
                aria-label="Help: drafts and publishing"
              />
            }
            content={<HelpTextContent canDeleteDraft={canDeleteDraft} />}
            position="bottom right"
            wide="very"
            on="click"
          />
        </div>
        <SubmissionComponent />
      </Grid.Column>
      <Grid.Column
        id="save-button-description"
        className="computer tablet only helptext horizontal-submission-helptext"
      >
        <HelpTextContent canDeleteDraft={canDeleteDraft} />
      </Grid.Column>
    </Grid>
  );
};

export { HorizontalSubmissionComponent };
