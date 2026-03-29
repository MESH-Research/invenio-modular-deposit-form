// Utilities for assembling display names from structured name-parts objects.
//
// A name-parts object may contain any combination of:
//   first, given, middle, parental, nickname  (given-name components)
//   family, family_prefix, family_prefix_fixed, spousal, last  (family-name components)

function getFamilyName(nameParts) {
  const prefix = nameParts?.family_prefix_fixed;
  const family = nameParts?.family;

  // Prefixes ending in apostrophe (e.g. O') attach directly to the family name
  if (prefix && family && prefix.endsWith("'")) {
    return [prefix + family, nameParts?.spousal, nameParts?.last]
      .filter(Boolean)
      .join(" ");
  }

  return [prefix, nameParts?.spousal, family, nameParts?.last]
    .filter(Boolean)
    .join(" ");
}

function getGivenName(nameParts) {
  return [
    nameParts?.first,
    nameParts?.given,
    nameParts?.middle,
    nameParts?.parental,
    nameParts?.nickname,
  ]
    .filter(Boolean)
    .join(" ");
}

export { getFamilyName, getGivenName };
