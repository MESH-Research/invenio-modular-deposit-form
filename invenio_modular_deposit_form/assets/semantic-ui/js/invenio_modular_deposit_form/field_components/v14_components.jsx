// Part of the Knowledge Commons Repository
// Copyright (C) 2023 MESH Research
//
// Optional InvenioRDM v14 deposit form components. This file is not imported by the
// package default bundle, so it is not part of the build when building against v13.
// Instances on v14 import it from their componentsRegistry.js; only then does it load.

import _get from "lodash/get";
import { useStore } from "react-redux";
import { RecordDeletion } from "@js/invenio_app_rdm/components/RecordDeletion";
import { FileModificationUntil } from "@js/invenio_app_rdm/components/FileModificationUntil";

/**
 * Wrapper for v14 RecordDeletion (invenio-app-rdm). Renders only when
 * config.record_deletion is present with enabled flag (v13 has neither).
 */
export const RecordDeletionComponent = () => {
  const store = useStore();
  const { config, record, permissions } = store.getState().deposit;
  const recordDeletion = config.record_deletion ?? {};
  const options = _get(config, "vocabularies.metadata.deletion_request_removal_reasons", []);

  if (!record?.is_published || !recordDeletion.enabled) {
    return null;
  }
  return (
    <RecordDeletion
      record={record ?? {}}
      permissions={permissions ?? {}}
      recordDeletion={recordDeletion}
      options={options}
    />
  );
};

/**
 * Wrapper for v14 FileModificationUntil (invenio-app-rdm). Shows "Unlocked, X days to
 * publish changes" in the Files section when config.file_modification is present.
 */
export const FileModificationUntilComponent = () => {
  const store = useStore();
  const { config, record } = store.getState().deposit;
  const fileModification = config.file_modification;
  const filesLocked = config.files_locked ?? false;

  if (fileModification == null) return null;
  return (
    <FileModificationUntil
      filesLocked={filesLocked}
      fileModification={fileModification}
      record={record ?? {}}
    />
  );
};
