// This file is part of Invenio-Modular-Deposit-Form
// Copyright (C) 2024-2025 Mesh Research
//
// It is adapted from a file in React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020-2021 Northwestern University.
//
// Invenio-Modular-Deposit-Form and React-Invenio-Deposit are free software;
// you can redistribute them and/or modify them under the terms of the MIT License;
// see the LICENSE file for more details.
//
// Differences from stock react-invenio-forms RemoteSelectField:
// - Uses local replacement SelectField (touched-aware; chains `onBlur` — see SelectField.jsx).
// - Preserves className/classnames passthrough for local styling hooks.
// - Syncs selected suggestions to `formik.values.ui.<fieldPath>` on add/change so
//   `initialSuggestions` can rehydrate readable labels on remount/recovery (stock does not).
// - Re-seeds `state.suggestions` / `state.selectedSuggestions` from `initialSuggestions`
//   on `componentDidUpdate` when its content changes (stock seeds only in the
//   constructor). Required so localStorage recovery — which calls Formik `resetForm`
//   *after* this widget has mounted — surfaces restored vocabulary labels instead of
//   bare ids. Content equality (`_isEqual`) avoids churn when callers recompute
//   `initialOptions` to a new array on every render.
// - Search: keeps `latestSearchStringRef` in sync on **every** `onSearchChange` event (before
//   debounce) so blur can commit the literal typed string; debounced fetch is `runDebouncedSearch`
//   with `.cancel()` on unmount (stock debounces only, no ref / cancel).
// - `commitSearchOnBlur` (default false): when true and not `multiple`, blur commits trimmed
//   search text like a free-text value (`onValueChange` + `ui.*`). Does not require
//   `allowAdditions` on semantic-ui-react `Form.Dropdown`. Also opts the field into
//   **mid-typeahead-on-focus** UX: on focus, seed controlled `searchQuery` from the Formik
//   field value (fallback: selected suggestion text) and select that text — the same
//   state as if the user had already typed that string (browser-typical focus selection).
//   SUIR otherwise clears `searchQuery` after selection and shows a non-editable `.text`
//   overlay, so typing replaces instead of edits. Focus alone does **not** fetch; display
//   `searchQuery` updates on every keystroke; remote fetches stay on `runDebouncedSearch` /
//   `debounceTime`.
// - `hideAdditionMenuItem` (default false): passes `allowAdditions={false}` into `SelectField` /
//   `Form.Dropdown`. semantic-ui-react has no prop to hide only the synthetic “Add …” row in
//   `getMenuOptions`; turning additions off removes that row. Pair with `commitSearchOnBlur` (or
//   list-only selection) so free text is still accepted when needed.
// - `focusFieldPathAfterSelect` (optional Formik field path / DOM id): after `onChange` (pick
//   from list) or `onAddItem` (Enter on addition when additions are enabled), focuses
//   `document.getElementById(path)` on the next tick; not run after blur-only commit.
// - **`description` / `helpText`:** forwarded to local `SelectField` (above / below the
//   dropdown); see `SelectField.jsx`.
// - `mergeExtraSource` (optional `(localHitsPromise, query) => Promise<extraHits>`): fans out
//   alongside the local `suggestionAPIUrl` request. Local hits are painted into the dropdown as
//   soon as they arrive (spinner stays on while extras are pending); extras are merged in via
//   `mergeOptions` when they resolve. The helper receives a *promise* of local hits so it can
//   fire its own request in parallel and await the local promise only at de-dup time. Late
//   responses for queries the user has already typed past are dropped via a `searchQuery`
//   staleness guard. Errors thrown from `mergeExtraSource` are swallowed (logged) so the local
//   list is never lost.
// - `restrictOptionsToResults` (default false): when true, the dropdown menu is sourced solely from
//   the current remote results (`this.state.suggestions`) rather than the inner `SelectField`'s
//   accumulating `state.options`. This bypasses both semantic-ui-react's built-in client-side
//   text filtering and the inherited stock `SelectField` behavior of merging every `props.options`
//   change into an ever-growing option universe (which, with client filtering disabled, would
//   otherwise leave stale prior-query rows visible). Use for true remote autocomplete (e.g.
//   `/api/names`) where the server / `mergeExtraSource` already decide relevance and each query's
//   results should replace the previous menu. Callers pass the flag instead of a custom
//   `search={(options) => options}` and need no ref into this widget's state.
// - update `onFocus` logic to respect `searchOnFocus` prop value.
// - added check for non-zero-length  string to `handleSearchInputChange` so that options menu
//   immediately opens when user types, instead of brief delay waiting for returned options.

import axios from "axios";
import { getIn } from "formik";
import _debounce from "lodash/debounce";
import _isEqual from "lodash/isEqual";
import PropTypes from "prop-types";
import queryString from "query-string";
import React, { Component } from "react";
import { Message } from "semantic-ui-react";
import { createOption, mergeOptions } from "react-invenio-forms";
import { SelectField } from "./SelectField";

const DEFAULT_SUGGESTION_SIZE = 20;
const serializeSuggestions = (suggestions) =>
  suggestions.map((item) => ({
    text: item.title,
    value: item.id,
    key: item.id,
  }));

function withCancel(promise) {
  let canceled = false;
  return {
    promise: new Promise((resolve, reject) => {
      promise.then(
        (value) => (canceled ? reject(new Error("canceled")) : resolve(value)),
        (error) => (canceled ? reject(new Error("canceled")) : reject(error))
      );
    }),
    cancel: () => {
      canceled = true;
    },
  };
}

class RemoteSelectField extends Component {
  constructor(props) {
    super(props);
    this.latestSearchStringRef = { current: "" };
    // Last query actually passed to `executeSearch` / the API. Kept separate from display
    // `state.searchQuery`, which (when `commitSearchOnBlur`) updates on every keystroke so the
    // input stays editable without implying a fetch has started for that string.
    this.lastFetchedQueryRef = { current: undefined };

    this.onSelectValue = async (event, { options, value }, callbackFunc) => {
      this.latestSearchStringRef.current = "";
      this.lastFetchedQueryRef.current = undefined;
      const { multiple } = this.props;
      const newSelectedSuggestions = options.filter((item) =>
        multiple ? value.includes(item.value) : item.value === value
      );
      this.setState(
        {
          selectedSuggestions: newSelectedSuggestions,
          searchQuery: null,
          error: false,
          open: !!multiple,
        },
        () => callbackFunc(newSelectedSuggestions)
      );
      await this.searchIfNoSuggestions(newSelectedSuggestions);
    };

    this.handleAddition = async (e, { value }, callbackFunc) => {
      this.latestSearchStringRef.current = "";
      this.lastFetchedQueryRef.current = undefined;
      const { serializeAddedValue } = this.props;
      const { selectedSuggestions } = this.state;

      const selectedSuggestion = serializeAddedValue
        ? serializeAddedValue(value)
        : { ...createOption(value), name: value };

      const newSelectedSuggestions = [...selectedSuggestions, selectedSuggestion];
      this.setState(
        (prevState) => ({
          selectedSuggestions: newSelectedSuggestions,
          suggestions: mergeOptions(prevState.suggestions, newSelectedSuggestions),
          searchQuery: null,
        }),
        () => callbackFunc(newSelectedSuggestions)
      );
      await this.searchIfNoSuggestions(newSelectedSuggestions);
    };

    this.runDebouncedSearch = _debounce(async (e, { searchQuery }) => {
      this.cancellableAction && this.cancellableAction.cancel();
      await this.executeSearch(searchQuery);
    }, this.props.debounceTime);

    this.handleSearchInputChange = (e, data) => {
      const { commitSearchOnBlur, multiple } = this.props;
      const q = data?.searchQuery == null ? "" : String(data.searchQuery);
      this.latestSearchStringRef.current = q;
      // When free-text edit mode controls the dropdown `searchQuery`, update display state
      // immediately so each keystroke edits the string. Remote fetch stays debounced below.
      if (commitSearchOnBlur && !multiple) {
        this.setState({
          searchQuery: q,
          ...(q.length > 0 ? { open: true, isFetching: true } : {}),
        });
      } else if (q.length > 0) {
        this.setState({ open: true, isFetching: true });
      }
      this.runDebouncedSearch(e, data);
    };

    this.executeSearch = async (searchQuery) => {
      const { preSearchChange, serializeSuggestions, mergeExtraSource } = this.props;
      const query = preSearchChange(searchQuery);
      // Duplicate-query guard must not use display `state.searchQuery` (that updates on every
      // keystroke when `commitSearchOnBlur`). Track issued fetches separately.
      if (this.lastFetchedQueryRef.current === query) return;
      this.lastFetchedQueryRef.current = query;
      // Keep the literal-string ref aligned for programmatic callers (tests, searchOnFocus).
      this.latestSearchStringRef.current =
        searchQuery == null ? "" : String(searchQuery);

      this.setState({ isFetching: true, searchQuery: query });

      // Staleness: prefer the live typed string so mid-debounce keystrokes drop late responses
      // even before the next `executeSearch` runs.
      const isStale = () => preSearchChange(this.latestSearchStringRef.current) !== query;

      // Two-phase render: paint local hits into the dropdown the moment they arrive, then
      // merge in extras (e.g. ORCID) when the extra source resolves. Both round-trips overlap:
      // `mergeExtraSource` receives a *promise* of local hits so it can fire its own request
      // immediately and await `localPromise` only when it needs the data for de-duping.
      // TODO: pass an AbortSignal to mergeExtraSource for true request cancellation; today
      // late responses are just dropped via the staleness guard below.
      const localPromise = this.fetchSuggestions(query);
      const extraPromise = mergeExtraSource
        ? Promise.resolve(mergeExtraSource(localPromise, query)).catch((e) => {
            console.warn("RemoteSelectField extra source failed:", e);
            return [];
          })
        : null;

      let localHits;
      try {
        localHits = (await localPromise) ?? [];
      } catch (e) {
        if (isStale()) return;
        console.error(e);
        this.setState({ error: true, isFetching: false });
        return;
      }
      if (isStale()) return;
      this.setState((prevState) => ({
        suggestions: mergeOptions(prevState.selectedSuggestions, serializeSuggestions(localHits)),
        isFetching: !!extraPromise,
        error: false,
        open: true,
      }));

      if (extraPromise) {
        const extraHits = (await extraPromise) ?? [];
        if (isStale()) return;
        this.setState((prevState) => ({
          suggestions: mergeOptions(prevState.suggestions, serializeSuggestions(extraHits)),
          isFetching: false,
        }));
      }
    };

    this.searchIfNoSuggestions = async (newSelectedSuggestions) => {
      const { suggestions } = this.state;
      if (_isEqual(newSelectedSuggestions, suggestions)) {
        await this.executeSearch("");
      }
    };

    this.fetchSuggestions = async (searchQuery) => {
      const {
        suggestionAPIUrl,
        suggestionAPIQueryParams,
        suggestionAPIHeaders,
        searchQueryParamName,
      } = this.props;

      this.cancellableAction = withCancel(
        axios.get(suggestionAPIUrl, {
          params: {
            [searchQueryParamName]: searchQuery,
            size: DEFAULT_SUGGESTION_SIZE,
            ...suggestionAPIQueryParams,
          },
          headers: suggestionAPIHeaders,
          // There is a bug in axios that prevents brackets from being encoded,
          // remove the paramsSerializer when fixed.
          // https://github.com/axios/axios/issues/3316
          paramsSerializer: (params) => queryString.stringify(params, { arrayFormat: "repeat" }),
        })
      );
      try {
        const response = await this.cancellableAction.promise;
        return response?.data?.hits?.hits;
      } catch (e) {
        console.error(e);
      }
    };

    this.getNoResultsMessage = () => {
      const { loadingMessage, suggestionsErrorMessage, noQueryMessage, noResultsMessage } =
        this.props;
      const { isFetching, error, searchQuery } = this.state;
      if (isFetching) return loadingMessage;
      if (error) {
        return <Message negative size="mini" content={suggestionsErrorMessage} />;
      }
      if (!searchQuery) return noQueryMessage;
      return noResultsMessage;
    };

    this.onClose = () => {
      this.setState({ open: false });
    };

    this.onBlur = (e, { formikProps }) => {
      const {
        searchOnFocus,
        commitSearchOnBlur,
        multiple,
        serializeAddedValue,
        onValueChange,
        fieldPath,
      } = this.props;
      const q = (this.latestSearchStringRef.current || "").trim();
      this.latestSearchStringRef.current = "";

      if (commitSearchOnBlur && !multiple && q) {
        const selectedSuggestion = serializeAddedValue
          ? serializeAddedValue(q)
          : { ...createOption(q), name: q };
        const newSelectedSuggestions = [selectedSuggestion];
        this.lastFetchedQueryRef.current = undefined;
        this.setState(
          (prevState) => ({
            open: false,
            error: false,
            searchQuery: null,
            selectedSuggestions: newSelectedSuggestions,
            suggestions: mergeOptions(prevState.suggestions, newSelectedSuggestions),
          }),
          () => {
            if (onValueChange) {
              onValueChange({ event: e, data: { value: q }, formikProps }, newSelectedSuggestions);
            } else {
              formikProps.form.setFieldValue(fieldPath, q);
            }
            formikProps.form.setFieldValue(
              `ui.${fieldPath}`,
              newSelectedSuggestions.map((o) => ({
                id: o.value,
                title_l10n: o.text,
              }))
            );
          }
        );
        return;
      }

      this.setState((prevState) => ({
        open: false,
        error: false,
        searchQuery: searchOnFocus ? prevState.searchQuery : null,
        suggestions: searchOnFocus ? prevState.suggestions : prevState.selectedSuggestions,
      }));
    };

    this.getSelectedDisplayText = () => {
      const selected = this.state.selectedSuggestions?.[0];
      if (!selected) return "";
      return String(selected.text ?? selected.name ?? selected.value ?? "");
    };

    this.onFocus = async (e, { formikProps } = {}) => {
      const { searchOnFocus, commitSearchOnBlur, multiple, fieldPath } = this.props;

      // Reconstruct mid-typeahead state: search input holds the current field value
      // with that text selected (like a normal text input on focus). No remote fetch
      // unless `searchOnFocus` is also set.
      if (commitSearchOnBlur && !multiple) {
        const current = this.state.searchQuery;
        const formikValue = formikProps
          ? String(getIn(formikProps.form.values, fieldPath, "") || "").trim()
          : "";
        const seeded =
          current != null && String(current).length > 0
            ? String(current)
            : formikValue || this.getSelectedDisplayText();
        if (seeded) {
          this.latestSearchStringRef.current = seeded;
          this.setState({ searchQuery: seeded }, () => {
            this.selectSearchInputText();
          });
        } else {
          this.selectSearchInputText();
        }
      }

      if (!searchOnFocus) return;

      this.setState({ open: true });
      await this.executeSearch(this.latestSearchStringRef.current || this.state.searchQuery || "");
    };

    this.getProps = () => {
      const {
        fieldPath,
        suggestionAPIUrl,
        suggestionAPIQueryParams,
        serializeSuggestions,
        serializeAddedValue,
        suggestionAPIHeaders,
        debounceTime,
        searchQueryParamName,
        noResultsMessage,
        loadingMessage,
        suggestionsErrorMessage,
        noQueryMessage,
        initialSuggestions,
        preSearchChange,
        onValueChange,
        search,
        isFocused,
        commitSearchOnBlur,
        focusFieldPathAfterSelect,
        hideAdditionMenuItem,
        mergeExtraSource,
        restrictOptionsToResults,
        ...uiProps
      } = this.props;

      const compProps = {
        fieldPath,
        suggestionAPIUrl,
        suggestionAPIQueryParams,
        suggestionAPIHeaders,
        serializeSuggestions,
        serializeAddedValue,
        debounceTime,
        searchQueryParamName,
        noResultsMessage,
        loadingMessage,
        suggestionsErrorMessage,
        noQueryMessage,
        initialSuggestions,
        preSearchChange,
        onValueChange,
        search,
        isFocused,
        commitSearchOnBlur,
        focusFieldPathAfterSelect,
        hideAdditionMenuItem,
        mergeExtraSource,
        restrictOptionsToResults,
      };
      return { compProps, uiProps };
    };

    const initial = props.initialSuggestions
      ? props.serializeSuggestions(props.initialSuggestions)
      : [];
    this.state = {
      isFetching: false,
      suggestions: initial,
      selectedSuggestions: initial,
      error: false,
      searchQuery: null,
      open: false,
    };
  }

  scheduleFocusFieldPath = (path) => {
    if (!path || typeof window === "undefined") {
      return;
    }
    window.setTimeout(() => {
      const el = document.getElementById(path);
      if (el && typeof el.focus === "function") {
        el.focus();
      }
    }, 0);
  };

  selectSearchInputText = () => {
    if (typeof window === "undefined") {
      return;
    }
    const { fieldPath } = this.props;
    window.setTimeout(() => {
      const byId = document.getElementById(fieldPath);
      const input =
        byId?.tagName === "INPUT"
          ? byId
          : byId?.querySelector?.("input.search, input") ||
            document.querySelector(
              `.invenio-remote-select-field input[id="${CSS.escape(fieldPath)}"]`
            );
      if (!input) return;
      if (typeof input.select === "function") {
        input.select();
        return;
      }
      if (typeof input.setSelectionRange === "function") {
        const len = (input.value || "").length;
        try {
          input.setSelectionRange(0, len);
        } catch (_err) {
          // Some input types reject setSelectionRange; ignore.
        }
      }
    }, 0);
  };

  componentDidUpdate(prevProps) {
    // Re-seed the dropdown from `initialSuggestions` whenever its content changes
    // after mount (e.g. localStorage recovery applies `resetForm` *after* this
    // widget has already mounted with empty/server-stale suggestions, so without
    // this the restored Formik value would render as a bare code instead of the
    // human-readable label). Identity-only changes are ignored so a caller that
    // recomputes `initialOptions` on every render does not churn this state.
    const { initialSuggestions, serializeSuggestions } = this.props;
    if (!_isEqual(prevProps.initialSuggestions, initialSuggestions)) {
      const next = initialSuggestions ? serializeSuggestions(initialSuggestions) : [];
      this.setState((prevState) => ({
        selectedSuggestions: next,
        suggestions: mergeOptions(prevState.suggestions, next),
      }));
    }
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
    if (this.runDebouncedSearch && typeof this.runDebouncedSearch.cancel === "function") {
      this.runDebouncedSearch.cancel();
    }
  }

  // Menu source for `restrictOptionsToResults`: returns only the current remote
  // results (selected item(s) + latest query's hits, including merged
  // extra-source hits). Stable identity so semantic-ui-react isn't handed a new
  // `search` function on every render; it reads fresh `state.suggestions` at
  // call time.
  menuSearchFromResults = () => this.state.suggestions;

  render() {
    const { compProps, uiProps } = this.getProps();
    const { error, suggestions, open, isFetching, searchQuery } = this.state;

    const classNameParts = ["invenio-remote-select-field", uiProps.className, uiProps.classnames]
      .filter(Boolean)
      .join(" ");

    // When restricting the menu to current results, source it from this widget's
    // own suggestions and ignore the caller-supplied `search`.
    const menuSearch = compProps.restrictOptionsToResults
      ? this.menuSearchFromResults
      : compProps.search;

    // Mid-typeahead mode (`commitSearchOnBlur`): control SUIR's searchQuery so focus-seeded /
    // keystroke values actually appear in the input (otherwise SUIR keeps an empty search box
    // under the selected-label overlay).
    const controlSearchQuery = compProps.commitSearchOnBlur && !uiProps.multiple;

    return (
      <SelectField
        {...uiProps}
        allowAdditions={
          error ? false : compProps.hideAdditionMenuItem ? false : uiProps.allowAdditions
        }
        fieldPath={compProps.fieldPath}
        options={suggestions}
        noResultsMessage={this.getNoResultsMessage()}
        search={menuSearch}
        {...(controlSearchQuery ? { searchQuery: searchQuery ?? "" } : {})}
        searchInput={{
          id: compProps.fieldPath,
          autoFocus: compProps.isFocused,
        }}
        lazyLoad
        open={open}
        onClose={this.onClose}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onSearchChange={this.handleSearchInputChange}
        onAddItem={({ event, data, formikProps }) => {
          this.handleAddition(event, data, (selectedSuggestions) => {
            if (compProps.onValueChange) {
              compProps.onValueChange({ event, data, formikProps }, selectedSuggestions);
            }
            // to preserve readable labels for hydration on remount
            formikProps.form.setFieldValue(
              `ui.${compProps.fieldPath}`,
              selectedSuggestions.map((o) => ({
                id: o.value,
                title_l10n: o.text,
              }))
            );
            this.scheduleFocusFieldPath(compProps.focusFieldPathAfterSelect);
          });
        }}
        onChange={({ event, data, formikProps }) => {
          this.onSelectValue(event, data, (selectedSuggestions) => {
            if (compProps.onValueChange) {
              compProps.onValueChange({ event, data, formikProps }, selectedSuggestions);
            } else {
              formikProps.form.setFieldValue(compProps.fieldPath, data.value);
            }
            // to preserve readable labels for hydration on remount
            formikProps.form.setFieldValue(
              `ui.${compProps.fieldPath}`,
              selectedSuggestions.map((o) => ({
                id: o.value,
                title_l10n: o.text,
              }))
            );
            // Only advance focus on an actual selection; a clear (empty
            // selection) should leave focus in this field.
            if (selectedSuggestions.length > 0) {
              this.scheduleFocusFieldPath(compProps.focusFieldPathAfterSelect);
            }
          });
        }}
        loading={isFetching}
        className={classNameParts}
      />
    );
  }
}

RemoteSelectField.defaultProps = {
  debounceTime: 500,
  suggestionAPIQueryParams: {},
  suggestionAPIHeaders: {},
  serializeSuggestions: serializeSuggestions,
  searchQueryParamName: "suggest",
  suggestionsErrorMessage: "Something went wrong...",
  noQueryMessage: "Search...",
  noResultsMessage: "No results found.",
  loadingMessage: "Loading...",
  preSearchChange: (x) => x,
  search: true,
  multiple: false,
  serializeAddedValue: undefined,
  initialSuggestions: [],
  onValueChange: undefined,
  isFocused: false,
  searchOnFocus: false,
  commitSearchOnBlur: false,
  focusFieldPathAfterSelect: undefined,
  hideAdditionMenuItem: false,
  mergeExtraSource: undefined,
  restrictOptionsToResults: false,
};

RemoteSelectField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  suggestionAPIUrl: PropTypes.string.isRequired,
  suggestionAPIQueryParams: PropTypes.object,
  serializeSuggestions: PropTypes.func,
  serializeAddedValue: PropTypes.func,
  suggestionAPIHeaders: PropTypes.object,
  debounceTime: PropTypes.number,
  searchQueryParamName: PropTypes.string,
  noResultsMessage: PropTypes.string,
  loadingMessage: PropTypes.string,
  suggestionsErrorMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  noQueryMessage: PropTypes.string,
  initialSuggestions: PropTypes.arrayOf(PropTypes.object),
  preSearchChange: PropTypes.func,
  onValueChange: PropTypes.func,
  search: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  isFocused: PropTypes.bool,
  className: PropTypes.string,
  classnames: PropTypes.string,
  searchOnFocus: PropTypes.bool,
  multiple: PropTypes.bool,
  commitSearchOnBlur: PropTypes.bool,
  focusFieldPathAfterSelect: PropTypes.string,
  hideAdditionMenuItem: PropTypes.bool,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  mergeExtraSource: PropTypes.func,
  restrictOptionsToResults: PropTypes.bool,
};

export { RemoteSelectField };
