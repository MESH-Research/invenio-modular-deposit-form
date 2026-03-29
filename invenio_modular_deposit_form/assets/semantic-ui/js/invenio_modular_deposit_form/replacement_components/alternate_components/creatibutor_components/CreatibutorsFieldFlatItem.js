// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2025 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021 New York University.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Button, Label, List, Ref } from "semantic-ui-react";
import { CreatibutorsInlineForm } from "./CreatibutorsInlineForm";
import PropTypes from "prop-types";
import _get from "lodash/get";
import { i18next } from "@translations/invenio_rdm_records/i18next";

function getErrorMessages(itemErrors) {
  const errorMessages = [];
  if (Array.isArray(itemErrors)) {
    itemErrors.forEach((error) => {
      errorMessages.push(...getErrorMessages(error));
    });
  } else if (
    typeof itemErrors === "object" &&
    itemErrors !== null &&
    Object.keys(itemErrors).length > 0
  ) {
    for (const [, value] of Object.entries(itemErrors)) {
      if (typeof value === "object" || Array.isArray(value)) {
        errorMessages.push(...getErrorMessages(value));
      } else if (typeof value === "string") {
        errorMessages.push(value);
      }
    }
  }
  return errorMessages;
}

const CreatibutorsFieldFlatItem = ({
  addLabel,
  addCreatibutor,
  autocompleteNames,
  cancelLabel,
  creatibutorDown,
  creatibutorUp,
  creatibutorsLength,
  displayName,
  editLabel,
  fieldPath,
  fieldPathPrefix,
  focusAddButtonHandler,
  handleCloseForm,
  handleOpenForm,
  handleRemove,
  handleCancel,
  index,
  isNewItem,
  itemError,
  removeCreatibutor,
  moveCreatibutor,
  roleOptions,
  schema,
  serializeSuggestions,
  showEditForms,
  values,
}) => {
  const identifiersList = _get(
    values,
    `${fieldPathPrefix}.person_or_org.identifiers`,
    []
  );
  const dropRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const [_, drag, preview] = useDrag({
    item: { index, type: "creatibutor" },
  });
  const [{ hidden }, drop] = useDrop({
    accept: "creatibutor",
    hover(item, monitor) {
      if (!dropRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      if (monitor.isOver({ shallow: true })) {
        moveCreatibutor(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
    collect: (monitor) => ({
      hidden: monitor.isOver({ shallow: true }),
    }),
  });

  const renderRole = (role) => {
    if (role) {
      const friendlyRole =
        roleOptions.find(({ value }) => value === role)?.text ?? role;
      return <Label>{friendlyRole}</Label>;
    }
    return null;
  };

  const errorMessages = itemError ? getErrorMessages(itemError) : [];

  drop(dropRef);

  return (
    <Ref innerRef={dropRef}>
      <List.Item
        className={`${
          hidden ? "deposit-drag-listitem hidden" : "deposit-drag-listitem"
        } ${errorMessages.length > 0 ? "error" : ""}`}
      >
        {!isNewItem && (
          <>
            <List.Content floated="right">
              <Button
                size="mini"
                primary
                type="button"
                onClick={() => {
                  showEditForms.includes(index)
                    ? handleCancel(removeCreatibutor, index)
                    : handleOpenForm(index);
                }}
              >
                {i18next.t(
                  showEditForms.includes(index) ? cancelLabel : editLabel
                )}
              </Button>
              <Button
                size="mini"
                type="button"
                onClick={() => handleRemove(removeCreatibutor, index)}
                icon="close"
                aria-label={i18next.t("Remove contributor")}
                negative
              />
              <Button
                size="mini"
                type="button"
                disabled={index === 0}
                onClick={() => creatibutorUp(moveCreatibutor, index)}
                icon="arrow up"
                aria-label={i18next.t("Move contributor up")}
              />
              <Button
                size="mini"
                type="button"
                disabled={index >= creatibutorsLength - 1}
                onClick={() => creatibutorDown(moveCreatibutor, index)}
                icon="arrow down"
                aria-label={i18next.t("Move contributor down")}
              />
            </List.Content>
            <Ref innerRef={drag}>
              <List.Icon name="bars" className="drag-anchor" />
            </Ref>
          </>
        )}
        <Ref innerRef={preview}>
          <>
            {!isNewItem && (
              <List.Content>
                <List.Description>
                  <span className="creatibutor">
                    {displayName}{" "}
                    {identifiersList.some(
                      (id) => id.scheme === "orcid"
                    ) && (
                      <img
                        alt="ORCID logo"
                        className="inline-id-icon mr-5"
                        src="/static/images/orcid.svg"
                        width="16"
                        height="16"
                      />
                    )}
                    {identifiersList.some(
                      (id) => id.scheme === "ror"
                    ) && (
                      <img
                        alt="ROR logo"
                        className="inline-id-icon mr-5"
                        src="/static/images/ror-icon.svg"
                        width="16"
                        height="16"
                      />
                    )}
                    {identifiersList.some(
                      (id) => id.scheme === "gnd"
                    ) && (
                      <img
                        alt="GND logo"
                        className="inline-id-icon mr-5"
                        src="/static/images/gnd-icon.svg"
                        width="16"
                        height="16"
                      />
                    )}{" "}
                    {renderRole(
                      _get(values, `${fieldPathPrefix}.role`)
                    )}
                  </span>
                </List.Description>
              </List.Content>
            )}
            {showEditForms.includes(index) && (
              <CreatibutorsInlineForm
                addCreatibutor={addCreatibutor}
                addLabel={addLabel}
                autocompleteNames={autocompleteNames}
                fieldPath={fieldPath}
                fieldPathPrefix={fieldPathPrefix}
                focusAddButtonHandler={focusAddButtonHandler}
                handleCancel={handleCancel}
                handleCloseForm={handleCloseForm}
                index={index}
                isNewItem={isNewItem}
                removeCreatibutor={removeCreatibutor}
                roleOptions={roleOptions}
                schema={schema}
                serializeSuggestions={serializeSuggestions}
                values={values}
              />
            )}
            {errorMessages.length > 0 && !showEditForms.includes(index) && (
              <Label pointing prompt>
                <List>
                  {errorMessages.map((e, i) => (
                    <List.Item key={i}>{e}</List.Item>
                  ))}
                </List>
              </Label>
            )}
          </>
        </Ref>
      </List.Item>
    </Ref>
  );
};

CreatibutorsFieldFlatItem.propTypes = {
  addLabel: PropTypes.string,
  addCreatibutor: PropTypes.func.isRequired,
  autocompleteNames: PropTypes.oneOf(["search", "search_only", "off"]),
  cancelLabel: PropTypes.string,
  creatibutorDown: PropTypes.func.isRequired,
  creatibutorUp: PropTypes.func.isRequired,
  creatibutorsLength: PropTypes.number.isRequired,
  displayName: PropTypes.string,
  editLabel: PropTypes.string,
  fieldPath: PropTypes.string.isRequired,
  fieldPathPrefix: PropTypes.string.isRequired,
  focusAddButtonHandler: PropTypes.func.isRequired,
  handleCloseForm: PropTypes.func.isRequired,
  handleOpenForm: PropTypes.func.isRequired,
  handleRemove: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  isNewItem: PropTypes.bool.isRequired,
  itemError: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  removeCreatibutor: PropTypes.func.isRequired,
  moveCreatibutor: PropTypes.func.isRequired,
  roleOptions: PropTypes.array.isRequired,
  schema: PropTypes.string.isRequired,
  serializeSuggestions: PropTypes.func,
  showEditForms: PropTypes.array.isRequired,
  values: PropTypes.object.isRequired,
};

export { CreatibutorsFieldFlatItem };
