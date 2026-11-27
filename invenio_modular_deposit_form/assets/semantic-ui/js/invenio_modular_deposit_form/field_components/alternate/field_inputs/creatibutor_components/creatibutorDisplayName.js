/**
 * Resolve the bibliographic creatibutor `name` string from profile / Names hits.
 *
 * `display_name` is the inverted/citation form; `full_name` / top-level `name`
 * are natural-order fallbacks for rows not yet backfilled.
 */

/**
 * @param {{ display_name?: string, full_name?: string } | null | undefined} profile
 * @returns {string}
 */
export function creatibutorNameFromProfile(profile) {
  return profile?.display_name || profile?.full_name || "";
}

/**
 * @param {{ props?: { display_name?: string }, name?: string } | null | undefined} selected
 * @returns {string}
 */
export function creatibutorNameFromPersonSuggestion(selected) {
  if (!selected) {
    return "";
  }
  return selected.props?.display_name || selected.name || "";
}
