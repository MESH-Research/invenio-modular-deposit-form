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

/**
 * Best-effort split of a space-separated display string into creatibutor fields:
 * last token → family name, preceding tokens → given names (Western-style guess).
 */
function guessPersonNamesFromFullName(fullName) {
  const trimmed = (fullName || "").trim();
  if (!trimmed) {
    return { family_name: "", given_name: "" };
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { family_name: parts[0], given_name: "" };
  }
  return {
    family_name: parts[parts.length - 1],
    given_name: parts.slice(0, -1).join(" "),
  };
}

export { getFamilyName, getGivenName, guessPersonNamesFromFullName };
