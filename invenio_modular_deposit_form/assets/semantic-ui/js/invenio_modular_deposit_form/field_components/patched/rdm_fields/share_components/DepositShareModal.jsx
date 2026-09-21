// Part of Invenio Modular Deposit Form
// Copyright (C) 2026 Mesh Research
//
// Thin ShareModal subclass: wrap upstream record-update handlers so the
// deposit form can commit the working record back into Formik. Does not
// reimplement ShareModal behaviour.

import PropTypes from "prop-types";
import { ShareModal } from "@js/invenio_app_rdm/landing_page/ShareOptions/ShareModal";

/**
 * Upstream ShareModal keeps a mutable `state.record` and has no callback when
 * it changes. Wrap its update handlers and notify `onRecordChange`.
 */
export class DepositShareModal extends ShareModal {
  constructor(props) {
    super(props);
    this._wrapRecordCommitHooks();
  }

  _commitRecord = (record) => {
    this.props.onRecordChange?.(record);
  };

  /**
   * Wrap upstream handlers without copying their logic. Must run in the
   * constructor (not `componentDidMount`) so the first `panes()` render
   * already passes the wrapped functions to child tabs.
   */
  _wrapRecordCommitHooks() {
    const upstreamHandleRecordUpdate = this.handleRecordUpdate;
    this.handleRecordUpdate = (updatedRecord) => {
      upstreamHandleRecordUpdate(updatedRecord);
      // `setState` is async; the new record is the argument, not yet state.
      this._commitRecord(updatedRecord);
    };

    const wrapAccessUpdate = (original) => (results, isDataChanged) => {
      original(results, isDataChanged);
      if (isDataChanged) {
        // Upstream mutates `state.record` in place before setState.
        this._commitRecord(this.state.record);
      }
    };

    this.updateUsersState = wrapAccessUpdate(this.updateUsersState);
    this.updateGroupsState = wrapAccessUpdate(this.updateGroupsState);
    this.updateLinksState = wrapAccessUpdate(this.updateLinksState);
  }
}

DepositShareModal.propTypes = {
  ...ShareModal.propTypes,
  onRecordChange: PropTypes.func,
};
