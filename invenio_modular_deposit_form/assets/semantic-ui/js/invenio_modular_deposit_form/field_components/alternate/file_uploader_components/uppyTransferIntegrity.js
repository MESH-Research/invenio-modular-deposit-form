// This file is part of Invenio Modular Deposit Form
// Copyright (C) 2026 MESH Research
//
// Invenio Modular Deposit Form is free software;
// you can redistribute them and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { useEffect } from "react";

import { createMD5 } from "hash-wasm";

/** Default chunk size for streaming MD5 of local File/Blob data. */
const DEFAULT_HASH_CHUNK_SIZE = 8 * 1024 * 1024;

/** Default poll interval while waiting for a whole-object `md5:` checksum. */
const DEFAULT_CHECKSUM_POLL_INTERVAL_MS = 2000;

/** Default max wait for a whole-object `md5:` checksum after upload. */
const DEFAULT_CHECKSUM_POLL_TIMEOUT_MS = 120000;

const RDM_UPPY_PLUGIN_ID = "RDMUppyUploaderPlugin";

/**
 * Turn off per-part `Content-MD5` headers (incompatible with AWS SigV4 host-only
 * pre-signed part URLs minted at init).
 *
 * @param {import("@uppy/core").Uppy | null | undefined} uppy
 */
function disableCheckPartIntegrity(uppy) {
  const plugin = uppy?.getPlugin?.(RDM_UPPY_PLUGIN_ID);
  if (plugin && typeof plugin.setOptions === "function") {
    plugin.setOptions({ checkPartIntegrity: false });
  }
}

/**
 * Read a Blob into a Uint8Array (supports environments where `Blob.arrayBuffer` is missing).
 *
 * @param {Blob} blob
 * @returns {Promise<Uint8Array>}
 */
async function readBlobBytes(blob) {
  if (typeof blob.arrayBuffer === "function") {
    return new Uint8Array(await blob.arrayBuffer());
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = () => reject(reader.error || new Error("FileReader failed"));
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Stream-hash a Blob/File with MD5; returns lowercase hex digest.
 *
 * @param {Blob} blob
 * @param {number} [chunkSize=DEFAULT_HASH_CHUNK_SIZE]
 * @returns {Promise<string>}
 */
async function hashFileMd5Hex(blob, chunkSize = DEFAULT_HASH_CHUNK_SIZE) {
  if (!blob || typeof blob.size !== "number") {
    throw new Error("hashFileMd5Hex requires a Blob or File");
  }
  const hasher = await createMD5();
  let offset = 0;
  while (offset < blob.size) {
    const end = Math.min(offset + chunkSize, blob.size);
    const bytes = await readBlobBytes(blob.slice(offset, end));
    hasher.update(bytes);
    offset = end;
  }
  return hasher.digest("hex");
}

/**
 * Whether a remote Invenio checksum string matches a local MD5 hex digest.
 *
 * @param {string} localHex
 * @param {string|null|undefined} remoteChecksum e.g. `md5:abc…`
 * @returns {boolean}
 */
function checksumsMatch(localHex, remoteChecksum) {
  if (!localHex || typeof remoteChecksum !== "string") {
    return false;
  }
  const normalizedRemote = remoteChecksum.trim().toLowerCase();
  const normalizedLocal = String(localHex).trim().toLowerCase();
  if (!normalizedRemote.startsWith("md5:")) {
    return false;
  }
  return normalizedRemote.slice(4) === normalizedLocal;
}

/**
 * Fetch file metadata JSON from an Invenio file `self` link.
 *
 * @param {string} selfUrl
 * @param {typeof fetch} [fetchImpl=fetch]
 * @returns {Promise<{checksum?: string|null}>}
 */
async function fetchFileMetadata(selfUrl, fetchImpl = fetch) {
  const response = await fetchImpl(selfUrl, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch file metadata (${response.status})`);
  }
  return response.json();
}

/**
 * Poll file metadata until `checksum` is a whole-object `md5:…` value.
 *
 * Multipart commits often return a `multipart:…` placeholder until an async
 * recompute finishes.
 *
 * @param {string} selfUrl
 * @param {Object} [options]
 * @param {number} [options.intervalMs]
 * @param {number} [options.timeoutMs]
 * @param {typeof fetch} [options.fetchImpl]
 * @param {(ms: number) => Promise<void>} [options.sleep]
 * @returns {Promise<string>} the `md5:…` checksum string
 */
async function waitForMd5Checksum(selfUrl, options = {}) {
  const {
    intervalMs = DEFAULT_CHECKSUM_POLL_INTERVAL_MS,
    timeoutMs = DEFAULT_CHECKSUM_POLL_TIMEOUT_MS,
    fetchImpl = fetch,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  } = options;

  const deadline = Date.now() + timeoutMs;
  let lastChecksum = null;

  while (Date.now() <= deadline) {
    const metadata = await fetchFileMetadata(selfUrl, fetchImpl);
    lastChecksum = metadata?.checksum ?? null;
    if (typeof lastChecksum === "string" && lastChecksum.toLowerCase().startsWith("md5:")) {
      return lastChecksum;
    }
    if (Date.now() + intervalMs > deadline) {
      break;
    }
    await sleep(intervalMs);
  }

  throw new Error(
    lastChecksum
      ? `Timed out waiting for md5 checksum (last: ${lastChecksum})`
      : "Timed out waiting for md5 checksum"
  );
}

/**
 * Attach local whole-file MD5 hashing + post-upload comparison to an Uppy instance.
 *
 * On mismatch, shows an Uppy error and deletes the uploaded file via `deleteFile`.
 * If the server never exposes an `md5:` checksum in time, warns but leaves the file.
 *
 * @param {import("@uppy/core").Uppy} uppy
 * @param {Object} options
 * @param {(file: object) => Promise<unknown>|unknown} options.deleteFile
 * @param {typeof fetch} [options.fetchImpl]
 * @param {number} [options.intervalMs]
 * @param {number} [options.timeoutMs]
 * @param {(blob: Blob) => Promise<string>} [options.hashFile]
 * @returns {() => void} cleanup
 */
export function attachUppyTransferIntegrity(uppy, options) {
  const {
    deleteFile,
    fetchImpl = fetch,
    intervalMs = DEFAULT_CHECKSUM_POLL_INTERVAL_MS,
    timeoutMs = DEFAULT_CHECKSUM_POLL_TIMEOUT_MS,
    hashFile = hashFileMd5Hex,
  } = options;

  /** @type {Record<string, Promise<string>>} */
  const localHashByFileId = {};

  const onFileAdded = (file) => {
    if (!file?.id || !file.data) {
      return;
    }
    const hashPromise = hashFile(file.data).catch((error) => {
      delete localHashByFileId[file.id];
      uppy.info(
        `Could not hash ${file.name || "file"} for transfer integrity: ${error.message}`,
        "error",
        8000
      );
      throw error;
    });
    localHashByFileId[file.id] = hashPromise;
  };

  const onFileRemoved = (file) => {
    if (file?.id) {
      delete localHashByFileId[file.id];
    }
  };

  const onUploadSuccess = async (file) => {
    if (!file?.id) {
      return;
    }

    try {
      const hashPromise = localHashByFileId[file.id];
      if (!hashPromise) {
        uppy.info(
          `Transfer integrity check skipped for ${file.name || "file"}: local hash `,
          "missing warning",
          6000
        );
        return;
      }

      let localHex;
      try {
        localHex = await hashPromise;
      } catch {
        return;
      }

      const selfUrl = file.meta?.links?.self;
      if (!selfUrl) {
        uppy.info(
          `Transfer integrity skipped for ${file.name || "file"}: missing file link.`,
          "warning",
          6000
        );
        return;
      }

      let remoteChecksum;
      try {
        remoteChecksum = await waitForMd5Checksum(selfUrl, {
          fetchImpl,
          intervalMs,
          timeoutMs,
        });
      } catch (error) {
        uppy.info(
          `Could not confirm transfer integrity for ${file.name || "file"} yet: ${error.message}`,
          "warning",
          8000
        );
        return;
      }

      if (checksumsMatch(localHex, remoteChecksum)) {
        return;
      }

      uppy.info(
        `Transfer integrity check failed for ${file.name || "file"}. Please try the upload again or contact user support.`,
        "error",
        10000
      );
      if (typeof deleteFile === "function") {
        await deleteFile(file);
      }
    } finally {
      delete localHashByFileId[file.id];
    }
  };

  uppy.on("file-added", onFileAdded);
  uppy.on("file-removed", onFileRemoved);
  uppy.on("upload-success", onUploadSuccess);

  return () => {
    uppy.off("file-added", onFileAdded);
    uppy.off("file-removed", onFileRemoved);
    uppy.off("upload-success", onUploadSuccess);
    Object.keys(localHashByFileId).forEach((id) => delete localHashByFileId[id]);
  };
}

const useUppyFileIntegrityCheck = (uppy, deleteFile) => {
  useEffect(() => {
    if (!uppy) {
      return;
    }
    disableCheckPartIntegrity(uppy);
    const detachIntegrity = attachUppyTransferIntegrity(uppy, { deleteFile });

    return () => {
      detachIntegrity();
    };
  }, [uppy, deleteFile]);
};

export {
  DEFAULT_HASH_CHUNK_SIZE,
  DEFAULT_CHECKSUM_POLL_INTERVAL_MS,
  DEFAULT_CHECKSUM_POLL_TIMEOUT_MS,
  checksumsMatch,
  disableCheckPartIntegrity,
  fetchFileMetadata,
  hashFileMd5Hex,
  readBlobBytes,
  waitForMd5Checksum,
  useUppyFileIntegrityCheck,
};
