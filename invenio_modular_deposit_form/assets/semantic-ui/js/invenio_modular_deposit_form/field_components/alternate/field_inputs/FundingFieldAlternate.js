// Part of Knowledge Commons Works
// Copyright (C) 2026 MESH Research
//
// Alternate FundingField: same Formik / DnD / modal add flow as
// invenio-vocabularies FundingField, with FundingFieldAlternateItem for
// creatibutor-style edit / remove / button-reorder controls.

import React, { useRef } from "react";
import PropTypes from "prop-types";
import { FieldArray, getIn } from "formik";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { Button, Form, Icon, List } from "semantic-ui-react";
import { FeedbackLabel } from "react-invenio-forms";
import { FieldLabel } from "../../../replacement_components/input_controls/FieldLabel";
import Overridable from "react-overridable";
import FundingModal from "@js/invenio_vocabularies/src/contrib/forms/Funding/FundingModal";
import { i18next } from "@translations/invenio_vocabularies/i18next";

import { FundingFieldAlternateItem } from "./FundingFieldAlternateItem";

/**
 * Inner Formik FieldArray render for funding entries.
 *
 * @param {object} props — Formik array helpers plus FundingField props
 */
function FundingFieldAlternateForm(props) {
  const {
    label,
    labelIcon,
    fieldPath,
    form: { values, errors, initialErrors, initialValues },
    move: formikArrayMove,
    push: formikArrayPush,
    remove: formikArrayRemove,
    replace: formikArrayReplace,
    required,
    deserializeAward: deserializeAwardFunc,
    deserializeFunder: deserializeFunderFunc,
    computeFundingContents: computeFundingContentsFunc,
    searchConfig,
  } = props;

  // Maintain stable React keys for list items to avoid triggering
  // component remounts when one item's funding content changes. Formik
  // has no notion of per-item identity, so we shadow its array operations.
  const itemKeysRef = useRef([]);

  const ensureItemKeys = (length) => {
    const itemKeys = itemKeysRef.current;
    while (itemKeys.length < length) {
      itemKeys.push(crypto.randomUUID());
    }
    if (itemKeys.length > length) {
      itemKeys.length = length;
    }
  };

  const moveFunding = (from, to) => {
    const itemKeys = itemKeysRef.current;
    const [key] = itemKeys.splice(from, 1);
    itemKeys.splice(to, 0, key);
    formikArrayMove(from, to);
  };

  const pushFunding = (value) => {
    itemKeysRef.current.push(crypto.randomUUID());
    formikArrayPush(value);
  };

  const removeFunding = (index) => {
    itemKeysRef.current.splice(index, 1);
    formikArrayRemove(index);
  };

  const fundingUp = (index) => {
    if (index > 0) {
      moveFunding(index, index - 1);
    }
  };

  const fundingDown = (index) => {
    const length = getIn(values, fieldPath, []).length;
    if (index < length - 1) {
      moveFunding(index, index + 1);
    }
  };

  const deserializeAward = deserializeAwardFunc
    ? deserializeAwardFunc
    : (award) => ({
        title: award?.title_l10n,
        number: award.number,
        funder: award.funder ?? "",
        id: award.id,
        ...(award.identifiers && { identifiers: award.identifiers }),
        ...(award.acronym && { acronym: award.acronym }),
      });

  const deserializeFunder = deserializeFunderFunc
    ? deserializeFunderFunc
    : (funder) => ({
        id: funder.id,
        name: funder.name,
        ...(funder.pid && { pid: funder.pid }),
        ...(funder.country && { country: funder.country }),
        ...(funder.identifiers && { identifiers: funder.identifiers }),
      });

  const computeFundingContents = computeFundingContentsFunc
    ? computeFundingContentsFunc
    : (funding) => {
        let headerContent,
          descriptionContent = "";
        let awardOrFunder = "award";
        if (funding.award) {
          headerContent = funding.award.title;
        }

        if (funding.funder) {
          const funderName =
            funding?.funder?.name ?? funding.funder?.title ?? funding?.funder?.id ?? "";
          descriptionContent = funderName;
          if (!headerContent) {
            awardOrFunder = "funder";
            headerContent = funderName;
            descriptionContent = "";
          }
        }

        return { headerContent, descriptionContent, awardOrFunder };
      };

  const fundingList = getIn(values, fieldPath, []);
  const formikInitialValues = getIn(initialValues, fieldPath, []);

  const error = getIn(errors, fieldPath, null);
  const initialError = getIn(initialErrors, fieldPath, null);
  const fundingError = error || (fundingList === formikInitialValues && initialError);

  let className = "";
  if (fundingError) {
    className = typeof fundingError !== "string" ? fundingError.severity : "error";
  }

  ensureItemKeys(fundingList.length);

  return (
    <DndProvider backend={HTML5Backend}>
      <Form.Field required={required} className={className}>
        <FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} />
        <List className="awards-list mt-10 mb-0">
          {fundingList.map((value, index) => {
            // if award does not exist or has no id, it's a custom one
            const awardType = value?.award?.id ? "standard" : "custom";
            return (
              <FundingFieldAlternateItem
                key={itemKeysRef.current[index]}
                {...{
                  index,
                  fundingItem: value,
                  awardType,
                  moveFunding: moveFunding,
                  replaceFunding: formikArrayReplace,
                  removeFunding: removeFunding,
                  searchConfig: searchConfig,
                  computeFundingContents: computeFundingContents,
                  deserializeAward: deserializeAward,
                  deserializeFunder: deserializeFunder,
                  fundingListLength: fundingList.length,
                  fundingUp: fundingUp,
                  fundingDown: fundingDown,
                }}
              />
            );
          })}
        </List>

        <div className="mt-10">
          <Overridable id="InvenioVocabularies.FundingField.AddAwardFundingModal.Container">
            <FundingModal
              searchConfig={searchConfig}
              trigger={
                <Button
                  type="button"
                  key="standard"
                  icon
                  labelPosition="left"
                  className={`mb-5 ${className}`}
                >
                  <Icon name="add" />
                  {i18next.t("Add")}
                </Button>
              }
              onAwardChange={pushFunding}
              mode="standard"
              action="add"
              deserializeAward={deserializeAward}
              deserializeFunder={deserializeFunder}
              computeFundingContents={computeFundingContents}
            />
          </Overridable>

          <Overridable id="InvenioVocabularies.FundingField.AddCustomFundingModal.Container">
            <FundingModal
              searchConfig={searchConfig}
              trigger={
                <Button type="button" key="custom" icon labelPosition="left" className={className}>
                  <Icon name="add" />
                  {i18next.t("Add custom")}
                </Button>
              }
              onAwardChange={pushFunding}
              mode="custom"
              action="add"
              deserializeAward={deserializeAward}
              deserializeFunder={deserializeFunder}
              computeFundingContents={computeFundingContents}
            />
          </Overridable>
        </div>

        {fundingError && <FeedbackLabel fieldPath={fieldPath} />}
      </Form.Field>
    </DndProvider>
  );
}

FundingFieldAlternateForm.propTypes = {
  label: PropTypes.node,
  labelIcon: PropTypes.node,
  fieldPath: PropTypes.string.isRequired,
  form: PropTypes.object,
  move: PropTypes.func,
  push: PropTypes.func,
  remove: PropTypes.func,
  replace: PropTypes.func,
  required: PropTypes.bool,
  deserializeAward: PropTypes.func,
  deserializeFunder: PropTypes.func,
  computeFundingContents: PropTypes.func,
  searchConfig: PropTypes.object,
};

FundingFieldAlternateForm.defaultProps = {
  label: undefined,
  labelIcon: undefined,
  form: undefined,
  move: undefined,
  push: undefined,
  remove: undefined,
  replace: undefined,
  required: undefined,
  deserializeAward: undefined,
  deserializeFunder: undefined,
  computeFundingContents: undefined,
  searchConfig: undefined,
};

/**
 * Alternate funding field with button reorder controls on each list item.
 *
 * @param {object} props
 * @param {string} props.fieldPath
 */
export function FundingFieldAlternate(props) {
  const { fieldPath } = props;
  return (
    <FieldArray name={fieldPath}>
      {(formikProps) => <FundingFieldAlternateForm {...formikProps} {...props} />}
    </FieldArray>
  );
}

FundingFieldAlternate.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  labelIcon: PropTypes.string,
  searchConfig: PropTypes.object.isRequired,
  required: PropTypes.bool,
  deserializeAward: PropTypes.func,
  deserializeFunder: PropTypes.func,
  computeFundingContents: PropTypes.func,
};

FundingFieldAlternate.defaultProps = {
  label: "Awards",
  labelIcon: "money bill alternate outline",
  required: false,
  deserializeAward: undefined,
  deserializeFunder: undefined,
  computeFundingContents: undefined,
};
