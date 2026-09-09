/**
 * Minimal stand-in for ``@js/invenio_rdm_records/.../reducers/deposit``.
 * Enough for depositReducer tests; not a full upstream reducer.
 */

class DepositStatus {
  static DRAFT = "draft";
  static NEW_VERSION_DRAFT = "new_version_draft";
  static DRAFT_WITH_REVIEW = "draft_with_review";
  static IN_REVIEW = "in_review";
  static DECLINED = "declined";
  static EXPIRED = "expired";
  static PUBLISHED = "published";
}

function defaultDepositReducer(state = {}, action) {
  switch (action?.type) {
    case "DRAFT_FETCHED":
    case "DRAFT_SAVE_SUCCEEDED":
      return {
        ...state,
        record: {
          ...(action.payload?.data ?? {}),
        },
        errors: {},
        actionState: action.type,
        actionStateExtra: {},
      };
    default:
      return state;
  }
}

module.exports = {
  __esModule: true,
  DepositStatus,
  default: defaultDepositReducer,
};
