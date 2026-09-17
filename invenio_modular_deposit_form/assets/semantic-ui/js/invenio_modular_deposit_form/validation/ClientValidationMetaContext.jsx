// Part of invenio-modular-deposit-form
// Copyright (C) 2026, MESH Research
//
// Invenio-Modular-Deposit-Form is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { createContext, useCallback, useContext, useState } from "react";
import PropTypes from "prop-types";

/**
 * Draft-blocking meta from the last Formik `validate` run.
 *
 * Lives above Formik/DepositBootstrap so validate can write it. Formik error leaves are
 * strings (no Yup `type`); Save needs whether any non-`required` failure was present.
 *
 * Setter and value are separate contexts so DepositBootstrap (write-only) does not
 * re-render when the boolean flips — only FormUIStateManager (read) does.
 * Updates are skipped when the boolean is unchanged.
 */
const ClientValidationMetaSetContext = createContext(null);
const ClientValidationMetaValueContext = createContext(false);

/**
 * @param {{ children: React.ReactNode }} props
 */
function ClientValidationMetaProvider({ children }) {
  const [hasDraftBlockingClientErrors, setState] = useState(false);

  const setHasDraftBlockingClientErrors = useCallback((next) => {
    const value = Boolean(next);
    setState((prev) => (prev === value ? prev : value));
  }, []);

  return (
    <ClientValidationMetaSetContext.Provider value={setHasDraftBlockingClientErrors}>
      <ClientValidationMetaValueContext.Provider value={hasDraftBlockingClientErrors}>
        {children}
      </ClientValidationMetaValueContext.Provider>
    </ClientValidationMetaSetContext.Provider>
  );
}

ClientValidationMetaProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Stable setter for DepositBootstrap validate. Does not subscribe to value updates.
 *
 * @returns {(next: boolean) => void}
 */
function useSetClientValidationMeta() {
  const setHasDraftBlockingClientErrors = useContext(ClientValidationMetaSetContext);
  if (setHasDraftBlockingClientErrors == null) {
    throw new Error(
      "useSetClientValidationMeta must be used within ClientValidationMetaProvider"
    );
  }
  return setHasDraftBlockingClientErrors;
}

/**
 * Current draft-blocking flag for FormUIStateManager. Re-renders only when it changes.
 *
 * @returns {boolean}
 */
function useClientValidationMetaValue() {
  const setCtx = useContext(ClientValidationMetaSetContext);
  const hasDraftBlockingClientErrors = useContext(ClientValidationMetaValueContext);
  if (setCtx == null) {
    throw new Error(
      "useClientValidationMetaValue must be used within ClientValidationMetaProvider"
    );
  }
  return hasDraftBlockingClientErrors;
}

export {
  ClientValidationMetaProvider,
  ClientValidationMetaSetContext,
  ClientValidationMetaValueContext,
  useClientValidationMetaValue,
  useSetClientValidationMeta,
};
