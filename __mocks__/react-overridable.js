/** Passthrough: registry overrides are irrelevant in unit tests. */
function Overridable({ children }) {
  return children ?? null;
}

/** Used by some react-invenio-forms widgets (e.g. DiscoverFieldsSection). */
Overridable.component = function OverridableComponent() {
  return null;
};

module.exports = Overridable;
module.exports.default = Overridable;
