// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useMemo } from "react";
import { useStore } from "react-redux";
import { i18next } from "@translations/invenio_modular_deposit_form/i18next";
import { Confirm, Container, Icon, Grid, Modal, Transition } from "semantic-ui-react";

import { CommunityHeader } from "@js/invenio_rdm_records";
import { FormPage } from "./framing_components/FormPage";
import { FormFooterRegion } from "./framing_components/FormFooterRegion";
import { FormHeaderRegion } from "./framing_components/FormHeaderRegion";
import { FormTitleRegion } from "./framing_components/FormTitleRegion";
import { FormLeftSidebar } from "./framing_components/FormLeftSidebar";
import { FormRightSidebar } from "./framing_components/FormRightSidebar";
import { RecoveryModal } from "./framing_components/RecoveryModal";
import { focusFirstElement } from "./utils";
import { useStickyFooterOverlapFix } from "./hooks/useStickyFooterOverlapFix";
import { SIDEBAR_DEFAULTS_WIDTHS } from "./constants";
import { makeFormHeading, makeSelectedCommunityLabel } from "./helpers/depositFormTitleText";
import { FormUIStateContext, useFormUIState } from "./FormUIStateManager.jsx";

/* Observe Semantic-UI "only" props to infer zero widths.
 * @param {object} sidebarConfig
 */
function setZeroWidths(sidebarConfigRaw, sidebarVisible) {
  let sidebarConfig = { ...sidebarConfigRaw };
  let bigBreakpoints = ["computer", "largeScreen", "widescreen"];
  let smallBreakpoints = ["mobile", "tablet"];
  let zeroBreakpoints = [];

  if (!sidebarVisible) {
    zeroBreakpoints = smallBreakpoints.concat(bigBreakpoints);
  } else if (Object.keys(sidebarConfig).includes("only")) {
    let only = sidebarConfig.only.replace(/\blarge screen\b/gi, "largeScreen");
    const onlyTerms = only.split(" ");
    const bigIndex = Math.max(...onlyTerms.map((t) => bigBreakpoints.indexOf(t)));
    if (bigIndex >= 0) {
      zeroBreakpoints = smallBreakpoints.concat(bigBreakpoints.slice(0, bigIndex));
    } else {
      zeroBreakpoints = bigBreakpoints;
      const onlyTerms = only.split(" ");
      for (const term of onlyTerms) {
        if (smallBreakpoints.includes(term)) {
          zeroBreakpoints.push(term);
        }
      }
    }
  }

  for (const zeroKey of zeroBreakpoints) {
    sidebarConfig[zeroKey] = 0;
  }

  return sidebarConfig;
}

function fillWidthsFromDefaults(configRaw) {
  let config = { ...configRaw };
  if (!config) {
    return config;
  }
  for (const [key, val] of Object.entries(SIDEBAR_DEFAULTS_WIDTHS)) {
    if (config[key] === undefined) {
      config[key] = val;
    }
  }
  return config;
}

/** Drop width keys that are 0 so Grid.Column is not given invalid widths; `only` handles hide. */
function omitZeroSidebarWidthsForGrid(mergedSidebarConfig) {
  const widthKeys = new Set(Object.keys(SIDEBAR_DEFAULTS_WIDTHS));
  return Object.fromEntries(
    Object.entries(mergedSidebarConfig).filter(
      ([key, val]) => !(widthKeys.has(key) && val === 0)
    )
  );
}

/* Get sidebar configs and calculate form column visibility and widths.
 * @param {object} commonFields
 */
function getColumnsConfig(commonFields) {
  const formPagesConfig = commonFields?.find((item) => item.component === "FormPages") ?? {};
  const leftSidebarConfig =
    commonFields?.find((item) => item.component === "FormLeftSidebar") ?? {};
  const rightSidebarConfig =
    commonFields?.find((item) => item.component === "FormRightSidebar") ?? {};
  const leftSidebarVisible = leftSidebarConfig.component !== undefined;
  const rightSidebarVisible = rightSidebarConfig.component !== undefined;

  const leftZeroedConfig = setZeroWidths(leftSidebarConfig, leftSidebarVisible);
  const rightZeroedConfig = setZeroWidths(rightSidebarConfig, rightSidebarVisible);

  const left = fillWidthsFromDefaults(leftZeroedConfig);
  const right = fillWidthsFromDefaults(rightZeroedConfig);

  const mainColumnWidths = {
    mobile: formPagesConfig?.mobile ?? 16,
    tablet: formPagesConfig?.tablet ?? 16,
    computer: formPagesConfig?.computer ?? Math.max(1, 16 - left.computer - right.computer),
    largeScreen:
      formPagesConfig?.largeScreen ?? Math.max(1, 16 - left.largeScreen - right.largeScreen),
    widescreen: formPagesConfig?.widescreen ?? Math.max(1, 16 - left.widescreen - right.widescreen),
  };

  return {
    leftSidebar: {
      config: omitZeroSidebarWidthsForGrid({ ...leftSidebarConfig, ...left }),
      visible: leftSidebarVisible,
    },
    rightSidebar: {
      config: omitZeroSidebarWidthsForGrid({ ...rightSidebarConfig, ...right }),
      visible: rightSidebarVisible,
    },
    mainColumnWidths,
  };
}

/*
FormLayoutContainer component to provide layout and UI state management.
*/
const FormLayoutContainer = () => {
  const store = useStore();
  const { config, record, editorState } = store.getState().deposit ?? {};
  const ctx = useFormUIState();
  const state = ctx.formUIState;

  const commonFields = config?.common_fields ?? [];
  const formTitleConfig = commonFields.find((item) => item.component === "FormTitle");
  const formHeaderConfig = commonFields.find((item) => item.component === "FormHeader");
  const formFooterConfig = commonFields.find((item) => item.component === "FormFooter");

  // Default column widths for sidebars when not specified (match FormLeftSidebar/FormRightSidebar)
  const { leftSidebar, rightSidebar, mainColumnWidths } = useMemo(() =>
    getColumnsConfig(commonFields)
  );

  const selectedCommunity = editorState?.selectedCommunity;
  const selectedCommunityLabel = makeSelectedCommunityLabel(selectedCommunity);

  useStickyFooterOverlapFix(state.currentFormPage);

  return (
    <>
      {config?.show_community_banner_at_top && (
        <Grid>
          <Grid.Row>
            <Grid.Column mobile={16} tablet={16} computer={16}>
              <CommunityHeader
                imagePlaceholderLink="/static/images/square-placeholder.png"
                record={record ?? {}}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      )}
      <Container id="rdm-deposit-form" className="rel-mt-1">
        <Grid>
          {formTitleConfig ? (
            <FormTitleRegion
              subsections={formTitleConfig?.subsections ?? []}
              classnames={formTitleConfig?.classnames}
            />
          ) : (
            <Grid.Row className="deposit-form-title">
              <Grid.Column width={16}>
                <h1 className="ui header">{makeFormHeading(record)}</h1>
                {!!selectedCommunityLabel && !config?.show_community_banner_at_top && (
                  <h2 className="ui header preselected-community-header">
                    for {selectedCommunityLabel}
                  </h2>
                )}
              </Grid.Column>
            </Grid.Row>
          )}

          {formHeaderConfig && (
            <FormHeaderRegion subsections={formHeaderConfig?.subsections ?? []} />
          )}
          <Grid.Row>
            {leftSidebar && (
              <FormLeftSidebar
                subsections={leftSidebar.config?.subsections ?? []}
                mobile={leftSidebar.config?.mobile}
                tablet={leftSidebar.config?.tablet}
                computer={leftSidebar.config?.computer}
                largeScreen={leftSidebar.config?.largeScreen}
                widescreen={leftSidebar.config?.widescreen}
                {...(leftSidebar.config?.only ? { only: leftSidebar.config?.only } : {})}
              />
            )}
            <Grid.Column
              computer={mainColumnWidths.computer}
              mobile={mainColumnWidths.mobile}
              tablet={mainColumnWidths.tablet}
              largeScreen={mainColumnWidths.largeScreen}
              widescreen={mainColumnWidths.widescreen}
              className="mb-15"
            >
              <Transition.Group animation="fade" duration={{ show: 1000, hide: 20 }}>
                {/* Non-empty pages only; full merged list (incl. placeholders) is formUIState.resolvedFormPages */}
                {state.visibleFormPages.map((mergedPage) => {
                  const {
                    section,
                    subsections,
                    classnames,
                    label,
                    component: _formPageComponent,
                    ...rest
                  } = mergedPage;
                  return (
                    state.currentFormPage === section && (
                      <div key={section}>
                        <FormPage
                          focusFirstElement={focusFirstElement}
                          id={`InvenioAppRdm.Deposit.FormPage.${section}`}
                          recoveryAsked={ctx.recoveryAsked}
                          classnames={classnames}
                          subsections={subsections}
                          label={label}
                          {...rest}
                        />
                      </div>
                    )
                  );
                })}
              </Transition.Group>
            </Grid.Column>
            {rightSidebar && (
              <FormRightSidebar
                subsections={rightSidebar.config?.subsections ?? []}
                mobile={rightSidebar.config?.mobile}
                tablet={rightSidebar.config?.tablet}
                computer={rightSidebar.config?.computer}
                largeScreen={rightSidebar.config?.largeScreen}
                widescreen={rightSidebar.config?.widescreen}
                {...(rightSidebar.config?.only ? { only: rightSidebar.config?.only } : {})}
              />
            )}
          </Grid.Row>

          {formFooterConfig && (
            <FormFooterRegion subsections={formFooterConfig?.subsections ?? []}>
              <div id="sticky-footer-observation-target" ref={ctx.pageTargetRef} />
            </FormFooterRegion>
          )}
        </Grid>

        <Confirm
          icon="question circle outline"
          id="confirm-page-change"
          className="confirm-page-change"
          open={ctx.confirmingPageChange}
          closeIcon
          content={
            <Modal.Content image>
              <Icon name="question circle outline" size="huge" />
              <Modal.Description>
                {i18next.t(
                  "There are problems with the information you've entered. Do you want to fix them before moving on?"
                )}
              </Modal.Description>
            </Modal.Content>
          }
          confirmButton={<button className="ui button">{i18next.t("Continue anyway")}</button>}
          cancelButton={
            <button className="ui button positive" ref={ctx.confirmModalRef}>
              {i18next.t("Fix the problems")}
            </button>
          }
          onCancel={ctx.handlePageChangeCancel}
          onConfirm={ctx.handlePageChangeConfirm}
        />

        {!ctx.recoveryAsked && ctx.storageDataPresent && (
          <RecoveryModal
            isDraft={record.status === "draft"}
            isVersionDraft={record.status === "new_version_draft"}
            confirmModalRef={ctx.confirmModalRef}
            handleStorageData={ctx.handleStorageData}
            setRecoveryAsked={ctx.handleRecoveryAsked}
          />
        )}
      </Container>
    </>
  );
};

export { FormLayoutContainer, FormUIStateContext };
