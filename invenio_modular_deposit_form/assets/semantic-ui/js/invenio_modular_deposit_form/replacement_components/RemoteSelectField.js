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
// - Uses local replacement SelectField import.
// - Preserves className/classnames passthrough for local styling hooks.
// - Syncs selected suggestions to formik.values.ui.<fieldPath> on add/change so
//   initialSuggestions can rehydrate readable labels on remount/recovery.

import axios from "axios";
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

    this.onSelectValue = async (event, { options, value }, callbackFunc) => {
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

    this.onSearchChange = _debounce(async (e, { searchQuery }) => {
      this.cancellableAction && this.cancellableAction.cancel();
      await this.executeSearch(searchQuery);
    }, this.props.debounceTime);

    this.executeSearch = async (searchQuery) => {
      const { preSearchChange, serializeSuggestions } = this.props;
      const query = preSearchChange(searchQuery);
      const { searchQuery: prevSearchQuery } = this.state;
      if (prevSearchQuery === query) return;

      this.setState({ isFetching: true, searchQuery: query });
      try {
        const suggestions = await this.fetchSuggestions(query);
        const serializedSuggestions = serializeSuggestions(suggestions);
        this.setState((prevState) => ({
          suggestions: mergeOptions(prevState.selectedSuggestions, serializedSuggestions),
          isFetching: false,
          error: false,
          open: true,
        }));
      } catch (e) {
        console.error(e);
        this.setState({ error: true, isFetching: false });
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

    this.onBlur = () => {
      const { searchOnFocus } = this.props;
      this.setState((prevState) => ({
        open: false,
        error: false,
        searchQuery: searchOnFocus ? prevState.searchQuery : null,
        suggestions: searchOnFocus ? prevState.suggestions : prevState.selectedSuggestions,
      }));
    };

    this.onFocus = async () => {
      this.setState({ open: true });
      const { searchOnFocus } = this.props;
      if (searchOnFocus) {
        const { searchQuery } = this.state;
        await this.executeSearch(searchQuery || "");
      }
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

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  render() {
    const { compProps, uiProps } = this.getProps();
    const { error, suggestions, open, isFetching } = this.state;

    const classNameParts = ["invenio-remote-select-field", uiProps.className, uiProps.classnames]
      .filter(Boolean)
      .join(" ");

    return (
      <SelectField
        {...uiProps}
        allowAdditions={error ? false : uiProps.allowAdditions}
        fieldPath={compProps.fieldPath}
        options={suggestions}
        noResultsMessage={this.getNoResultsMessage()}
        search={compProps.search}
        searchInput={{
          id: compProps.fieldPath,
          autoFocus: compProps.isFocused,
        }}
        lazyLoad
        open={open}
        onClose={this.onClose}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onSearchChange={this.onSearchChange}
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
};

export { RemoteSelectField };
