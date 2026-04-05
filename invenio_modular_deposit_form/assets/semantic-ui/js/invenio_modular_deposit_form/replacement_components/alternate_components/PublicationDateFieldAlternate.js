// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
//
// Modular fork: `getIn(values, fieldPath)` instead of hard-coded metadata path;
// i18n via invenio_modular_deposit_form; Formik value sync avoids clobbering loaded
// records and skips redundant `setFieldValue` when the composed string already matches.
// Named *Alternate alongside DatesFieldAlternate (dropdown-based UX).

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Field, getIn, useFormikContext } from "formik";
import { FieldLabel } from "react-invenio-forms";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { Checkbox, Dropdown, Form, Label } from "semantic-ui-react";

function parsePublicationDateString(publicationDate) {
  if (publicationDate == null || publicationDate === "") {
    return null;
  }
  const str = String(publicationDate);
  if (str.includes("/")) {
    const [start, end] = str.split("/");
    const sp = start.split("-");
    const ep = (end || "").split("-");
    return {
      useRange: true,
      start: { y: sp[0] || null, m: sp[1] ?? null, d: sp[2] ?? null },
      end: { y: ep[0] || null, m: ep[1] ?? null, d: ep[2] ?? null },
    };
  }
  const parts = str.split("-");
  return {
    useRange: false,
    start: { y: parts[0] || null, m: parts[1] ?? null, d: parts[2] ?? null },
    end: null,
  };
}

function composePublicationDate(
  yearValue,
  monthValue,
  dayValue,
  endYearValue,
  endMonthValue,
  endDayValue
) {
  let newDateValue = [yearValue, monthValue, dayValue].filter((v) => !!v).join("-");
  if (endYearValue) {
    newDateValue += "/" + [endYearValue, endMonthValue, endDayValue].filter((v) => !!v).join("-");
  }
  return newDateValue;
}

const DateDropdown = ({
  name,
  unit,
  value,
  options,
  position,
  useRange,
  fieldPath,
  handleDropdownChange,
  error,
}) => {
  return (
    <Form.Field>
      <FieldLabel
        htmlFor={`${fieldPath}.inputs.${name}`}
        label={`${useRange ? i18next.t(position) + " " : ""}${i18next.t(unit)}`}
        id={`${fieldPath}.${name}.label`}
      />
      <Dropdown
        search
        selection
        id={`${fieldPath}.inputs.${name}`}
        name={name}
        options={options}
        value={value}
        onChange={handleDropdownChange}
        error={error}
        upward={false}
        fluid
      />
    </Form.Field>
  );
};

const PublicationDateFieldAlternate = ({
  description = "If this work is already published elsewhere, please use the date of the first publication.",
  fieldPath,
  helpText = undefined,
  label = i18next.t("Publication Date"),
  icon = "calendar",
  required = true,
  // ...extraProps
}) => {
  const { setFieldValue, values, setFieldTouched, validateForm } = useFormikContext();
  const publicationDateValue = getIn(values, fieldPath) ?? "";

  const currentDate = new Date();
  const currentYear = String(currentDate.getFullYear());
  const currentDay = String(currentDate.getDate()).padStart(2, "0");
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");

  const parsedInitial = parsePublicationDateString(publicationDateValue);

  const [yearValue, setYearValue] = useState(() => parsedInitial?.start.y ?? currentYear);
  const [monthValue, setMonthValue] = useState(() => parsedInitial?.start.m ?? currentMonth);
  const [dayValue, setDayValue] = useState(() => parsedInitial?.start.d ?? currentDay);
  const [endYearValue, setEndYearValue] = useState(() =>
    parsedInitial?.useRange ? (parsedInitial.end?.y ?? null) : null
  );
  const [endMonthValue, setEndMonthValue] = useState(() =>
    parsedInitial?.useRange ? (parsedInitial.end?.m ?? null) : null
  );
  const [endDayValue, setEndDayValue] = useState(() =>
    parsedInitial?.useRange ? (parsedInitial.end?.d ?? null) : null
  );
  const [useRange, setUseRange] = useState(() => !!parsedInitial?.useRange);

  useEffect(() => {
    if (!publicationDateValue) {
      return;
    }
    const parsed = parsePublicationDateString(publicationDateValue);
    if (!parsed) {
      return;
    }
    setYearValue(parsed.start.y ?? currentYear);
    setMonthValue(parsed.start.m);
    setDayValue(parsed.start.d);
    setUseRange(parsed.useRange);
    if (parsed.useRange && parsed.end) {
      setEndYearValue(parsed.end.y);
      setEndMonthValue(parsed.end.m);
      setEndDayValue(parsed.end.d);
    } else {
      setEndYearValue(null);
      setEndMonthValue(null);
      setEndDayValue(null);
    }
  }, [publicationDateValue, fieldPath, currentYear]);

  // Push Y/M/D state into Formik. Do not list publicationDateValue in deps: when it
  // changes from outside, the hydrate effect above updates segments first; running this
  // on the same publicationDateValue tick with old segments would overwrite the load.
  useEffect(() => {
    const newDateValue = composePublicationDate(
      yearValue,
      monthValue,
      dayValue,
      endYearValue,
      endMonthValue,
      endDayValue
    );
    if (newDateValue === publicationDateValue) {
      return;
    }
    setFieldValue(fieldPath, newDateValue);
    setFieldTouched(fieldPath, true).then(() => {
      validateForm();
    });
  }, [
    yearValue,
    monthValue,
    dayValue,
    endYearValue,
    endMonthValue,
    endDayValue,
    fieldPath,
    setFieldValue,
    setFieldTouched,
    validateForm,
  ]);

  useEffect(() => {
    if (!useRange) {
      setEndYearValue(null);
      setEndMonthValue(null);
      setEndDayValue(null);
    }
  }, [useRange]);

  const years = Array.from({ length: Number(currentYear) - 1600 + 1 }, (_, i) =>
    (1600 + i).toString()
  );
  let yearOptions = years
    .map((year) => {
      return { key: year, value: year, text: year };
    })
    .reverse();
  yearOptions.unshift({ key: "None", value: null, text: i18next.t("None") });
  const monthOptions = [
    { key: "None", value: null, text: i18next.t("None"), days: 31 },
    { key: "January", value: "01", text: i18next.t("January"), days: 31 },
    { key: "February", value: "02", text: i18next.t("February"), days: 29 },
    { key: "March", value: "03", text: i18next.t("March"), days: 31 },
    { key: "April", value: "04", text: i18next.t("April"), days: 30 },
    { key: "May", value: "05", text: i18next.t("May"), days: 31 },
    { key: "June", value: "06", text: i18next.t("June"), days: 30 },
    { key: "July", value: "07", text: i18next.t("July"), days: 31 },
    { key: "August", value: "08", text: i18next.t("August"), days: 31 },
    { key: "September", value: "09", text: i18next.t("September"), days: 30 },
    { key: "October", value: "10", text: i18next.t("October"), days: 31 },
    { key: "November", value: "11", text: i18next.t("November"), days: 30 },
    { key: "December", value: "12", text: i18next.t("December"), days: 31 },
  ];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  let dayOptions = days.map((day) => {
    return {
      key: day.padStart(2, "0"),
      value: day.padStart(2, "0"),
      text: day,
    };
  });
  dayOptions.unshift({ key: "None", value: null, text: i18next.t("None") });
  const selectedMonth = monthOptions.find((month) => month.value === monthValue);
  const daysInSelectedMonth = selectedMonth ? selectedMonth.days : 31;
  const slicedDayOptions = dayOptions.slice(0, daysInSelectedMonth + 1);

  const handleDropdownChange = (_e, { name, value }) => {
    const setters = {
      startYear: setYearValue,
      startMonth: setMonthValue,
      startDay: setDayValue,
      endYear: setEndYearValue,
      endMonth: setEndMonthValue,
      endDay: setEndDayValue,
    };
    setters[name](value);
    if (name === "startDay" && !monthValue) {
      setMonthValue("01");
    }
    if (name === "endDay" && !endMonthValue) {
      setEndMonthValue("01");
    }
    if (name === "startMonth" && value === null) {
      setDayValue(null);
    }
    if (name === "endMonth" && value === null) {
      setEndDayValue(null);
    }
    if (name === "startYear" && value === null) {
      setMonthValue(null);
      setDayValue(null);
    }
    if (name === "endYear" && value === null) {
      setEndMonthValue(null);
      setEndDayValue(null);
    }
  };

  const startDropdowns = [
    {
      name: "startYear",
      unit: "Year",
      value: yearValue,
      options: yearOptions,
    },
    {
      name: "startMonth",
      unit: "Month",
      value: monthValue,
      options: monthOptions,
    },
    {
      name: "startDay",
      unit: "Day",
      value: dayValue,
      options: slicedDayOptions,
    },
  ];
  const endDropdowns = [
    {
      name: "endYear",
      unit: "Year",
      value: endYearValue,
      options: yearOptions,
    },
    {
      name: "endMonth",
      unit: "Month",
      value: endMonthValue,
      options: monthOptions,
    },
    {
      name: "endDay",
      unit: "Day",
      value: endDayValue,
      options: slicedDayOptions,
    },
  ];

  return (
    <>
      <Field name={fieldPath} id={fieldPath}>
        {({ meta }) => {
          return (
            <Form.Field required={!!required} error={!!meta.error}>
              {label ? (
                <FieldLabel
                  htmlFor={fieldPath}
                  icon={icon}
                  label={label}
                  id={`${fieldPath}.label`}
                />
              ) : null}
              {description && (
                <div id={`${fieldPath}.description`} className="description rel-mb-1">
                  {i18next.t(description)}
                </div>
              )}
              <Form.Group className="invenio-group-field invenio-form-row mb-0 equal width">
                {startDropdowns.map((dropdown, idx) => (
                  <DateDropdown
                    key={idx}
                    {...dropdown}
                    position={"Start"}
                    useRange={useRange}
                    fieldPath={fieldPath}
                    handleDropdownChange={handleDropdownChange}
                    error={!!meta.error}
                    aria-describedby={`${fieldPath}.helptext`}
                  />
                ))}
                <Form.Field>
                  <Checkbox
                    label={i18next.t(`${!useRange ? "add" : "include"} end date`)}
                    id={`${fieldPath}.controls.useRange`}
                    onChange={(_e, data) => {
                      setUseRange(data.checked);
                      setFieldTouched(fieldPath, true);
                    }}
                    checked={useRange}
                  />
                </Form.Field>
              </Form.Group>
              {!!useRange && (
                <Form.Group className="invenio-group-field invenio-form-row mb-0 equal width">
                  {endDropdowns.map((dropdown, idx) => (
                    <DateDropdown
                      key={idx}
                      {...dropdown}
                      position={"End"}
                      useRange={useRange}
                      fieldPath={fieldPath}
                      handleDropdownChange={handleDropdownChange}
                      error={!!meta.error}
                      aria-describedby={`${fieldPath}.helptext`}
                    />
                  ))}
                  <Form.Field></Form.Field>
                </Form.Group>
              )}
              {meta.error && (
                <Label className="prompt error" pointing>
                  {meta.error}
                </Label>
              )}
              {helpText && (
                <div id={`${fieldPath}.helptext`} className="helptext">
                  {i18next.t(helpText)}
                </div>
              )}
            </Form.Field>
          );
        }}
      </Field>
    </>
  );
};

PublicationDateFieldAlternate.propTypes = {
  description: PropTypes.string,
  fieldPath: PropTypes.string.isRequired,
  helpText: PropTypes.string,
  label: PropTypes.string,
  icon: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
};

export { PublicationDateFieldAlternate };
