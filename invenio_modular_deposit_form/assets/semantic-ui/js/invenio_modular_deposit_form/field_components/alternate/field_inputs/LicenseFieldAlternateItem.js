// Part of Knowledge Commons Works
// Copyright (C) 2026 MESH Research
//
// Alternate license list item: same behavior as invenio-rdm-records
// LicenseFieldItem, with creatibutor-style edit / remove / reorder buttons.

import React from "react";
import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";
import { Button, List, Ref } from "semantic-ui-react";
import _truncate from "lodash/truncate";
import { LicenseModal } from "@js/invenio_rdm_records/src/deposit/fields/License/LicenseModal";
import { i18next } from "@translations/invenio_rdm_records/i18next";

/**
 * Drag-and-drop license row with modal edit and button reorder controls.
 *
 * @param {object} props
 * @param {object} props.license
 * @param {Function} props.moveLicense
 * @param {Function} props.replaceLicense
 * @param {Function} props.removeLicense
 * @param {object} props.searchConfig
 * @param {Function} [props.serializeLicenses]
 * @param {number} props.licenseListLength
 * @param {Function} props.licenseUp
 * @param {Function} props.licenseDown
 */
export const LicenseFieldAlternateItem = ({
  license,
  moveLicense,
  replaceLicense,
  removeLicense,
  searchConfig,
  serializeLicenses,
  licenseListLength,
  licenseUp,
  licenseDown,
}) => {
  const dropRef = React.useRef(null);

  const [, drag, preview] = useDrag({
    item: { index: license.index, type: "license" },
  });
  const [{ hidden }, drop] = useDrop({
    accept: "license",
    hover(item, monitor) {
      if (!dropRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = license.index;

      if (dragIndex === hoverIndex) {
        return;
      }

      if (monitor.isOver({ shallow: true })) {
        moveLicense(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
    collect: (monitor) => ({
      hidden: monitor.isOver({ shallow: true }),
    }),
  });

  drop(dropRef);
  return (
    <Ref innerRef={dropRef}>
      <List.Item className={hidden ? "deposit-drag-listitem hidden" : "deposit-drag-listitem"}>
        <List.Content floated="right">
          <LicenseModal
            searchConfig={searchConfig}
            onLicenseChange={(selectedLicense) => {
              replaceLicense(license.index, selectedLicense);
            }}
            mode={license.type}
            initialLicense={license.initial}
            action="edit"
            trigger={
              <Button size="mini" primary type="button">
                {i18next.t("Change")}
              </Button>
            }
            serializeLicenses={serializeLicenses}
          />
          <Button
            size="mini"
            type="button"
            onClick={() => removeLicense(license.index)}
            icon="close"
            aria-label={i18next.t("Remove")}
            negative
          />
          <Button
            size="mini"
            type="button"
            disabled={license.index === 0}
            onClick={() => licenseUp(license.index)}
            icon="arrow up"
            aria-label={i18next.t("Move up")}
          />
          <Button
            size="mini"
            type="button"
            disabled={license.index >= licenseListLength - 1}
            onClick={() => licenseDown(license.index)}
            icon="arrow down"
            aria-label={i18next.t("Move down")}
          />
        </List.Content>
        <Ref innerRef={drag}>
          <List.Icon name="bars" className="drag-anchor" />
        </Ref>
        <Ref innerRef={preview}>
          <List.Content>
            <List.Header>{license.title}</List.Header>
            {license.description && (
              <List.Description>{_truncate(license.description, { length: 300 })}</List.Description>
            )}
            {license.link && (
              <span>
                <a href={license.link} target="_blank" rel="noopener noreferrer">
                  {license.description && <span>&nbsp;</span>}
                  {i18next.t("Read more")}
                </a>
              </span>
            )}
          </List.Content>
        </Ref>
      </List.Item>
    </Ref>
  );
};

LicenseFieldAlternateItem.propTypes = {
  license: PropTypes.object.isRequired,
  moveLicense: PropTypes.func.isRequired,
  replaceLicense: PropTypes.func.isRequired,
  removeLicense: PropTypes.func.isRequired,
  searchConfig: PropTypes.object.isRequired,
  serializeLicenses: PropTypes.func,
  licenseListLength: PropTypes.number.isRequired,
  licenseUp: PropTypes.func.isRequired,
  licenseDown: PropTypes.func.isRequired,
};

LicenseFieldAlternateItem.defaultProps = {
  serializeLicenses: undefined,
};
