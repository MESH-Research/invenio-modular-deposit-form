// Part of Knowledge Commons Works
// Copyright (C) 2026 MESH Research
//
// Alternate funding list item: same behavior as invenio-vocabularies
// FundingFieldItem, with creatibutor-style edit / remove / reorder buttons.

import React from "react";
import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";
import { Button, Icon, Label, List, Ref } from "semantic-ui-react";
import FundingModal from "@js/invenio_vocabularies/src/contrib/forms/Funding/FundingModal";
import { i18next } from "@translations/invenio_vocabularies/i18next";

/**
 * Drag-and-drop funding row with modal edit and button reorder controls.
 *
 * @param {object} props
 * @param {number} props.index
 * @param {object} props.fundingItem
 * @param {string} props.awardType
 * @param {Function} props.moveFunding
 * @param {Function} props.replaceFunding
 * @param {Function} props.removeFunding
 * @param {object} props.searchConfig
 * @param {Function} props.deserializeAward
 * @param {Function} props.deserializeFunder
 * @param {Function} props.computeFundingContents
 * @param {number} props.fundingListLength
 * @param {Function} props.fundingUp
 * @param {Function} props.fundingDown
 */
export const FundingFieldAlternateItem = ({
  index,
  fundingItem,
  awardType,
  moveFunding,
  replaceFunding,
  removeFunding,
  searchConfig,
  deserializeAward,
  deserializeFunder,
  computeFundingContents,
  fundingListLength,
  fundingUp,
  fundingDown,
}) => {
  const dropRef = React.useRef(null);
  // eslint-disable-next-line no-unused-vars
  const [_, drag, preview] = useDrag({
    item: { index, type: "award" },
  });
  const [{ hidden }, drop] = useDrop({
    accept: "award",
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
        moveFunding(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
    collect: (monitor) => ({
      hidden: monitor.isOver({ shallow: true }),
    }),
  });

  const { headerContent, descriptionContent, awardOrFunder } = computeFundingContents(fundingItem);

  drop(dropRef);
  return (
    <Ref innerRef={dropRef}>
      <List.Item className={hidden ? "deposit-drag-listitem hidden" : "deposit-drag-listitem"}>
        <List.Content floated="right">
          <FundingModal
            searchConfig={searchConfig}
            onAwardChange={(selectedFunding) => {
              replaceFunding(index, selectedFunding);
            }}
            mode={awardType}
            action="edit"
            trigger={
              <Button size="mini" primary type="button">
                {i18next.t("Change award")}
              </Button>
            }
            deserializeAward={deserializeAward}
            deserializeFunder={deserializeFunder}
            computeFundingContents={computeFundingContents}
            initialFunding={fundingItem}
          />
          <Button
            size="mini"
            type="button"
            onClick={() => removeFunding(index)}
            icon="close"
            aria-label={i18next.t("Remove")}
            negative
          />
          <Button
            size="mini"
            type="button"
            disabled={index === 0}
            onClick={() => fundingUp(index)}
            icon="arrow up"
            aria-label={i18next.t("Move up")}
          />
          <Button
            size="mini"
            type="button"
            disabled={index >= fundingListLength - 1}
            onClick={() => fundingDown(index)}
            icon="arrow down"
            aria-label={i18next.t("Move down")}
          />
        </List.Content>

        <Ref innerRef={drag}>
          <List.Icon name="bars" className="drag-anchor" />
        </Ref>
        <Ref innerRef={preview}>
          <List.Content>
            <List.Header>
              <>
                <span className="mr-5">{headerContent}</span>

                <List.Description className="mr-10 ml-10">
                  {descriptionContent ? descriptionContent : <br />}
                </List.Description>

                {awardOrFunder === "award"
                  ? fundingItem?.award?.number && (
                      <Label basic size="mini" className="horizontal inline mr-5 ml-5">
                        {fundingItem.award.number}
                      </Label>
                    )
                  : ""}
                {awardOrFunder === "award"
                  ? fundingItem?.award?.url && (
                      <a
                        href={`${fundingItem.award.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={i18next.t("Open external link")}
                        className="mr-5 ml-5"
                      >
                        <Icon link name="external alternate" />
                      </a>
                    )
                  : ""}
              </>
            </List.Header>
          </List.Content>
        </Ref>
      </List.Item>
    </Ref>
  );
};

FundingFieldAlternateItem.propTypes = {
  index: PropTypes.number,
  fundingItem: PropTypes.object,
  awardType: PropTypes.string,
  moveFunding: PropTypes.func.isRequired,
  replaceFunding: PropTypes.func.isRequired,
  removeFunding: PropTypes.func.isRequired,
  searchConfig: PropTypes.object.isRequired,
  deserializeAward: PropTypes.func.isRequired,
  deserializeFunder: PropTypes.func.isRequired,
  computeFundingContents: PropTypes.func.isRequired,
  fundingListLength: PropTypes.number.isRequired,
  fundingUp: PropTypes.func.isRequired,
  fundingDown: PropTypes.func.isRequired,
};

FundingFieldAlternateItem.defaultProps = {
  index: undefined,
  fundingItem: undefined,
  awardType: undefined,
};
