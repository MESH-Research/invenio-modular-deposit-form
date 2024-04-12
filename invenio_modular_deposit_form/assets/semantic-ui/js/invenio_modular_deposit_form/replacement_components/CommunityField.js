// This file is part of Invenio-RDM-Records
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021-2022 Graz University of Technology.
//
// Invenio-RDM-Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_rdm_records/i18next";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { Image } from "react-invenio-forms";
import { connect } from "react-redux";
import { Button, Icon, Form, Grid, Header } from "semantic-ui-react";
// import { changeSelectedCommunity } from "../../state/actions";
// import { CommunitySelectionModal } from "@js/invenio_rdm_records";
import { CommunitySelectionModal } from "./CommunitySelectionModal/CommunitySelectionModal";
import GeoPattern from "geopattern";

export const changeSelectedCommunity = (community) => {
  return async (dispatch) => {
    dispatch({
      type: "SET_COMMUNITY",
      payload: { community },
    });
    window.setTimeout(() => {
      document.querySelectorAll(`.community-field-button`)[0].focus();
    }, 50);
  };
};

const CommunityFieldComponent = ({
  community = undefined,
  changeSelectedCommunity,
  imagePlaceholderLink,
  showCommunitySelectionButton,
  disableCommunitySelectionButton,
  label="Community submission",
}) => {
  const [modalOpen, setModalOpen] = useState();

  const focusAddButtonHandler = () => {
    document.querySelectorAll(`.community-field-button`)[0].focus();
  };

  const pattern = community?.slug ? GeoPattern.generate(community.slug) : GeoPattern.generate("default");

  // // use rgba version of svg pattern color for header background
  // const opacity = 0.1;
  // const values = pattern.color.match(/\w\w/g);
  // const [r, g, b] = values.map((k) => parseInt(k, 16));

  // document.getElementsByClassName(
  //   "page-subheader-outer"
  // )[0].style.backgroundColor = `rgba( ${r}, ${g}, ${b}, ${opacity} )`;

  return (
    <>
      <Form.Field>
        <label
          htmlFor="community-selector"
          className="field-label-class invenio-field-label"
        >
          <Icon name="users" />
          {label}
        </label>
      </Form.Field>
      <Form.Group>
        {community && (
          <Form.Field width={12}>
            <Grid fluid>
              <Grid.Column width={3}>
                <Image
                  size="tiny"
                  className="community-header-logo"
                  src={community.links?.logo || pattern.toDataUri()}
                  fallbackSrc={pattern.toDataUri()}
                />
              </Grid.Column>
              <Grid.Column width={13}>
                <Header size="small">{community.metadata.title}</Header>
              </Grid.Column>
            </Grid>
          </Form.Field>
        )}
        <Form.Field width={community ? 4 : 6} className="right-btn-column">
          {showCommunitySelectionButton && (
            <CommunitySelectionModal
              modalHeader={i18next.t("Select a collection")}
              onCommunityChange={(community) => {
                changeSelectedCommunity(community);
                focusAddButtonHandler();
                setModalOpen(false);
              }}
              onModalChange={(value) => {
                value === false && focusAddButtonHandler();
                setModalOpen(value);
              }}
              modalOpen={modalOpen}
              chosenCommunity={community}
              displaySelected
              trigger={
                <Button
                  className="community-field-button add-button"
                  disabled={disableCommunitySelectionButton}
                  onClick={() => setModalOpen(true)}
                  name="setting"
                  // icon
                  id="community-selector"
                  type="button"
                  floated={!community ? "left" : ""}
                >
                  {/* <Icon name={!community ? "add" : "undo"} /> */}
                  {community
                    ? i18next.t("Change")
                    : i18next.t("Select a community")}
                </Button>
              }
              focusAddButtonHandler={focusAddButtonHandler}
            />
          )}
          {community && (
            // <Button
            //   mini
            //   className="community-field-button"
            //   onClick={() => changeSelectedCommunity(null)}
            //   content={i18next.t("Remove")}
            //   icon="close"
            //   disabled={disableCommunitySelectionButton}
            // />
            <Button
              aria-label={i18next.t("Remove item")}
              className="close-btn"
              icon
              onClick={() => changeSelectedCommunity(null)}
              disabled={!showCommunitySelectionButton}
            >
              <Icon name="close" />
            </Button>
          )}
        </Form.Field>
        {!community && (
          <Form.Field width={11} className="communities-helptext-wrapper">
            <label htmlFor="community-selector" className="helptext">
              {i18next.t(
                "Select a community where you want this deposit to be published."
              )}
            </label>
          </Form.Field>
        )}
      </Form.Group>
    </>
  );
};

CommunityFieldComponent.propTypes = {
  imagePlaceholderLink: PropTypes.string.isRequired,
  community: PropTypes.object,
  disableCommunitySelectionButton: PropTypes.bool.isRequired,
  showCommunitySelectionButton: PropTypes.bool.isRequired,
  showCommunityHeader: PropTypes.bool.isRequired,
  changeSelectedCommunity: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  community: state.deposit.editorState.selectedCommunity,
  disableCommunitySelectionButton:
    state.deposit.editorState.ui.disableCommunitySelectionButton,
  showCommunitySelectionButton:
    state.deposit.editorState.ui.showCommunitySelectionButton,
  showCommunityHeader: state.deposit.editorState.ui.showCommunityHeader,
});

const mapDispatchToProps = (dispatch) => ({
  changeSelectedCommunity: (community) =>
    dispatch(changeSelectedCommunity(community)),
});

export const CommunityField = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommunityFieldComponent);
