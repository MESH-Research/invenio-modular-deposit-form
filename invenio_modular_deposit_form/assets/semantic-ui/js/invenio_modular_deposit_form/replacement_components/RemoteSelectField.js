// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020-2021 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import axios from "axios";
import _debounce from "lodash/debounce";
import _uniqBy from "lodash/uniqBy";
import PropTypes from "prop-types";
import queryString from "query-string";
import React, { useEffect, useState } from "react";
import { Message } from "semantic-ui-react";
import { SelectField } from "./SelectField";
import { getIn, useFormikContext } from "formik";

const DEFAULT_SUGGESTION_SIZE = 20;

const serializeSuggestions = (suggestions) =>
  suggestions.map((item) => ({
    text: item.title,
    value: item.id,
    key: item.id,
  }));

const RemoteSelectField = ({
  debounceTime = 500,
  fieldPath,
  initialSuggestions = [],
  isFocused = false,
  loadingMessage = "Loading...",
  multiple = true,
  noQueryMessage = "Search...",
  noResultsMessage = "No results found.",
  onValueChange = undefined,
  preSearchChange = (x) => x,
  search = true,
  serializeAddedValue = undefined,
  serializeSuggestions = serializeSuggestions,
  suggestionAPIUrl,
  suggestionAPIQueryParams = {},
  suggestionAPIHeaders = {},
  suggestionsErrorMessage = "Something went wrong...",
  ...uiProps
}) => {
  const _initialSuggestions = initialSuggestions
      ? serializeSuggestions(initialSuggestions)
      : [];
  const [isFetching, setIsFetching] = useState(false);
  const [suggestions, setSuggestions] = useState(_initialSuggestions);
  const [selectedSuggestions, setSelectedSuggestions] = useState(_initialSuggestions);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState(null);
  const [open, setOpen] = useState(false);
  const { values } = useFormikContext();

  useEffect(() => {
    const startingValues = getIn(values, fieldPath);
    console.log("startingValues", values);
    if ( !!startingValues && startingValues.length > 0 && !!startingValues[0]) {
      setTimeout(() => {
        console.log("startingValues", serializeSuggestions(values));
        setSuggestions([...initialSuggestions, ...serializeSuggestions(startingValues)]);
        setSelectedSuggestions([...initialSuggestions, ...serializeSuggestions(startingValues)]);
      }, 100);
    }
  }, []);


  const onSelectValue = (event, { options, value }, callbackFunc) => {
    const newSelectedSuggestions = options.filter((item) => value.includes(item.value));
    setSelectedSuggestions(newSelectedSuggestions);
    setSearchQuery(null);
    setError(false);
    setOpen(!!multiple);
    callbackFunc(newSelectedSuggestions);  // TODO: check if this fires too soon
  };

  const handleAddition = (e, { value }, callbackFunc) => {
    const selectedSuggestion = serializeAddedValue
      ? serializeAddedValue(value)
      : { text: value, value, key: value, name: value };

    const newSelectedSuggestions = [...selectedSuggestions, selectedSuggestion];
    const prevSuggestions = suggestions;
    setSelectedSuggestions(newSelectedSuggestions);
    setSuggestions(_uniqBy([...prevSuggestions, ...newSelectedSuggestions], "value"));
    callbackFunc(newSelectedSuggestions)  // TODO: check if this fires too soon
  };

  const onSearchChange = _debounce(async (e, { searchQuery }) => {
    const query = preSearchChange(searchQuery);
    setIsFetching(true);
    setSearchQuery(query);
    try {
      const suggestions = await fetchSuggestions(query);

      const serializedSuggestions = serializeSuggestions(suggestions);
      const prevSuggestions = selectedSuggestions;
      setSuggestions(_uniqBy([...prevSuggestions, ...serializedSuggestions], "value"));
      setIsFetching(false);
      setError(false);
      setOpen(true);
    } catch (e) {
      console.error(e);
      setError(true);
      setIsFetching(false);
    }
    // eslint-disable-next-line react/destructuring-assignment
  }, debounceTime);

  const fetchSuggestions = async (searchQuery) => {
    try {
      const response = await axios.get(suggestionAPIUrl, {
        params: {
          suggest: searchQuery,
          size: DEFAULT_SUGGESTION_SIZE,
          ...suggestionAPIQueryParams,
        },
        headers: suggestionAPIHeaders,
        // There is a bug in axios that prevents brackets from being encoded,
        // remove the paramsSerializer when fixed.
        // https://github.com/axios/axios/issues/3316
        paramsSerializer: (params) =>
          queryString.stringify(params, { arrayFormat: "repeat" }),
      });
      return response?.data?.hits?.hits;
    } catch (e) {
      console.error(e);
    }
  };

  const getNoResultsMessage = () => {
    if (isFetching) {
      return loadingMessage;
    }
    if (error) {
      return <Message negative size="mini" content={suggestionsErrorMessage} />;
    }
    if (!searchQuery) {
      return noQueryMessage;
    }
    return noResultsMessage;
  };

  const onClose = () => {
    setOpen(false);
  };

  const onBlur = () => {
    const prevSuggestions = selectedSuggestions;
    setOpen(false);
    setError(false);
    setSearchQuery(null);
    setSuggestions(prevSuggestions);
  };

  const onFocus = () => {
    setOpen(true);
  };

  const compProps = {
    fieldPath,
    suggestionAPIUrl,
    suggestionAPIQueryParams,
    suggestionAPIHeaders,
    serializeSuggestions,
    serializeAddedValue,
    debounceTime,
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

  console.log("RemoteSelectField");
  console.log(compProps);
  console.log(uiProps);
  console.log("suggestions", suggestions);
  console.log("initialSuggestions", initialSuggestions);
  console.log("selectedSuggestions", selectedSuggestions);
  return (
    <SelectField
      {...uiProps}
      // additionLabel
      allowAdditions={error ? false : uiProps.allowAdditions}
      className="invenio-remote-select-field"
      clearable
      defaultValue={[]}
      description={uiProps.description}
      fieldPath={fieldPath}
      helpText={uiProps.helpText}
      label={uiProps.label}
      lazyLoad
      loading={isFetching}
      multiple={multiple}
      noResultsMessage={getNoResultsMessage()}
      noQueryMessage={noQueryMessage}
      onClose={onClose}
      onFocus={onFocus}
      onBlur={onBlur}
      onSearchChange={onSearchChange}
      onAddItem={({ event, data, formikProps }) => {
        handleAddition(event, data, (selectedSuggestions) => {
          if (onValueChange) {
            onValueChange({ event, data, formikProps }, selectedSuggestions);
          }
        });
      }}
      onChange={({ event, data, formikProps }) => {
        onSelectValue(event, data, (selectedSuggestions) => {
          if (onValueChange) {
            onValueChange({event, data, formikProps}, selectedSuggestions);
          } else {
            formikProps.form.setFieldValue(fieldPath, data.value);
          }
        });
      }}
      open={open}
      options={suggestions}
      placeholder={uiProps.placeholder}
      required={uiProps.required}
      search={search}
      searchInput={{
        id: fieldPath,
        autoFocus: isFocused,
      }}
      value={selectedSuggestions.map((item) => item.value)}
    />
  );
}

RemoteSelectField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  suggestionAPIUrl: PropTypes.string.isRequired,
  suggestionAPIQueryParams: PropTypes.object,
  suggestionAPIHeaders: PropTypes.object,
  serializeSuggestions: PropTypes.func,
  serializeAddedValue: PropTypes.func,
  initialSuggestions: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.object,
  ]),
  debounceTime: PropTypes.number,
  noResultsMessage: PropTypes.string,
  loadingMessage: PropTypes.string,
  suggestionsErrorMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  noQueryMessage: PropTypes.string,
  preSearchChange: PropTypes.func, // Takes a string and returns a string
  onValueChange: PropTypes.func, // Takes the SUI hanf and updated selectedSuggestions
  search: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  multiple: PropTypes.bool,
  isFocused: PropTypes.bool,
};

export { RemoteSelectField };