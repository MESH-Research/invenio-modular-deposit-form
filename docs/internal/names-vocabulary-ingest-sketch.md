# Design sketch: Names vocabulary ingest (ORCID + Knowledge Commons Profiles)

**Status:** Future work — not implemented. This file lives under **`docs/internal/`** and is **not** included in the published Sphinx build (`docs/source/`). Pick up when ORCID access and Profiles export contracts are decided. Does not replace current deposit widget work.

**Scope:** Backend population and refresh of the Invenio **names** vocabulary (`/api/names`, used by creator/contributor name search). Two sources: **ORCID** (mechanism TBD) and **Knowledge Commons Profiles** (KC Profiles) in the same service cluster.

**Related package behavior:** Invenio-Vocabularies already provides names **datastreams** (ORCID XML/tar pipeline, optional S3 sync preset), **CLI** (`invenio vocabularies import|update`), and an **Invenio Jobs** hook (`import_orcid_names` → `ORCID_PRESET_DATASTREAM_CONFIG`). This document sketches how KCWorks might operationalize ORCID and add a second ingestor without committing to a single ORCID tier yet.

---

## 1. Target outcomes

- Deposit name typeahead searches a **merged** names index that includes:
  - ORCID-sourced persons (full or subset, depending on access), and/or
  - KC Profiles–sourced persons (and optionally org-shaped entries if Profiles exposes them).
- **Initial load** and **periodic updates** run as **background work** (Celery / Invenio Jobs), not on user request.
- **Secrets and network access** stay in the RDM cluster (or adjacent job runner), not in the browser.

---

## 2. ORCID ingestor (two possible implementations)

Choose one primary path once ORCID access is known. The other remains a documented fallback.

### 2a. Member / S3-style incremental sync (upstream preset)

**When it applies:** ORCID provides **API keys** for the **summary S3 bucket** (and related sync inputs) as in upstream `VOCABULARIES_ORCID_*` configuration.

**Mechanism (upstream):**

- Job type registered as `import_orcid_names` uses `ORCID_PRESET_DATASTREAM_CONFIG`: `orcid-data-sync` reader → XML → `orcid` transformer → async `names-service` writer with `update: True`, batched.
- Celery task: `process_datastream` (`invenio_vocabularies.services.tasks`).

**Initial setup (sketch):**

1. Obtain ORCID bulk/summary **access key and secret**; confirm bucket name and sync semantics with ORCID documentation for your agreement tier.
2. Set in instance `invenio.cfg` (names only; adjust values per ORCID):
   - `VOCABULARIES_ORCID_ACCESS_KEY`, `VOCABULARIES_ORCID_SECRET_KEY`
   - `VOCABULARIES_ORCID_SUMMARIES_BUCKET` (default upstream is `v3.0-summaries`)
   - `VOCABULARIES_ORCID_SYNC_MAX_WORKERS`, `VOCABULARIES_ORCID_SYNC_SINCE` (window for deltas)
3. Ensure **`s3fs`** (and any other deps) are installed in the application environment.
4. Register **Elasticsearch mappings** for names if not already applied (standard RDM/vocabularies deploy step).
5. Run a **first full sync** via Invenio Jobs admin (or equivalent) for `import_orcid_names`, with an explicit `since` / job args policy agreed with ops.
6. Schedule **recurring** job runs (e.g. nightly) with a `since` cursor strategy: either job-managed “last successful run” storage or a fixed sliding window (see open questions).

**Ongoing:** Monitor Celery errors, partial failures (`TaskExecutionPartialError`), and index size.

### 2b. Static dump + CLI (no S3 credentials)

**When it applies:** You only have **periodic files** (e.g. public data dump, or files dropped by another team) — tar/XML matching the stock **`DATASTREAM_CONFIG`** pipeline, or a custom YAML-defined pipeline.

**Mechanism (upstream):**

- `invenio vocabularies import -v names -o <origin>` — create from dump.
- `invenio vocabularies update -v names -o <origin>` — same readers/transformers, writers forced to **update** mode in CLI.

**Initial setup (sketch):**

1. Define **where dumps land**: PVC path, object storage, or HTTP URL the `tar` / `http` reader can use.
2. Validate one dump against the expected **layout** (tar of `.xml`, `record` root element) or add a **custom YAML** config under a vocabulary key if the format differs.
3. Run **first import** in maintenance window (may be long-running).
4. Automate **refresh** with either:
   - **CronJob** (K8s) or system cron: download new dump → `invenio vocabularies update -v names -o ...` inside worker pod; or
   - Thin **wrapper Celery task** that shells CLI or calls `DataStreamFactory` with the same config (preferred for logging/metrics consistency).

**Ongoing:** Version dumps, keep rollback strategy; document dump cadence from ORCID or your mirror.

---

## 3. Knowledge Commons Profiles ingestor

**Goal:** Periodically pull a **dump** from the Profiles service (API or export URL), normalize to **name records** compatible with the names service schema, then **create/update** in the same vocabulary as ORCID (or a dedicated type — see coexistence below).

### 3.1 Proposed components

1. **Fetcher task (scheduled)**  
   - Authenticate to Profiles using a **service account** (API key, mTLS, or cluster-internal JWT — TBD).  
   - Call either:
     - **Bulk export** endpoint (single JSONL/NDJSON or tarball), or
     - **Paginated** API with a **cursor** / `since` parameter for deltas.  
   - Write artifact to **durable scratch** (PVC or temp + stream) for the next step, or stream in memory if size-bound.

2. **Transformer**  
   - Map Profiles fields → Invenio name record shape (at minimum: display name, `family_name` / `given_name` if available, **`identifiers`** with stable scheme, optional **affiliations** references).  
   - Assign a **stable record id** (e.g. Profiles user UUID, or `kc-profiles:<uuid>`) for PID/idempotency.

3. **Writer**  
   - Prefer reusing **`NamesServiceWriter`** with `update: True` via a **small custom datastream** (json/jsonl reader + transformer), registered in `VOCABULARIES_DATASTREAM_*` and/or invoked from a dedicated **Invenio Job** type (mirror `ImportORCIDJob` pattern).

4. **Scheduling**  
   - **Invenio Jobs** + Celery Beat, or K8s **CronJob** invoking `invenio` CLI — align with how ORCID path is scheduled so ops has one model.

### 3.2 Initial setup (sketch)

1. **Contract** with Profiles team: export format, auth, rate limits, pagination, and **change notification** (optional webhook vs poll-only).
2. Add instance config, e.g. (illustrative only):  
   `KC_PROFILES_NAMES_EXPORT_URL`, `KC_PROFILES_NAMES_TOKEN`, `KC_PROFILES_NAMES_SINCE_CURSOR_PATH` (or DB table for cursor).
3. Implement and register **reader/transformer** (in instance package or small `kcworks` module), merge into `VOCABULARIES_DATASTREAM_READERS` / `TRANSFORMERS` like `invenio_app_rdm` does for names.
4. Add **Job** definition `import_kc_profiles_names` (or similar) building task args for `process_datastream`.
5. **Dry run** on staging: import N samples, verify `/api/names` suggest and deposit autocomplete.
6. **Schedule** periodic job; alert on task failure and on “zero rows” anomalies.

### 3.3 Periodic API requests

- **Polling interval:** trade latency vs load (e.g. hourly/daily).  
- **Idempotency:** always upsert by stable id; avoid duplicate PIDs.  
- **Partial failure:** log and continue; optional dead-letter file for bad rows.

---

## 4. Coexistence: ORCID + KC Profiles in one index

Decide explicitly (before implementation):

| Topic | Options |
|--------|--------|
| **Namespace / PID** | Same `names` service with disjoint id prefixes vs separate vocabulary type (would require deposit UI/API changes). |
| **Deduping** | Same person in ORCID and Profiles: merge on ORCID identifier, prefer one source for display, or keep two records with different ids. |
| **Affiliations** | Map Profiles org ids to existing **affiliations** vocabulary PIDs where possible (`VOCABULARIES_ORCID_ORG_IDS_MAPPING_PATH` pattern as precedent). |
| **Removal** | Whether Profiles **deleted** users should tombstone or delete name records. |

Default sketch: **single `names` service**, **stable internal ids**, **merge on ORCID** when both supply the same ORCID iD.

---

## 5. Cross-cutting initial setup (any path)

- [ ] Names index exists and mappings are current.  
- [ ] Celery workers run `invenio_vocabularies.services.tasks`.  
- [ ] Invenio Jobs enabled if using job UI / registry.  
- [ ] Observability: structured logs, metrics for rows processed / errors.  
- [ ] Runbook: who rotates ORCID vs Profiles credentials; how to re-run full rebuild.

---

## 6. Open questions

- Which **ORCID** tier and whether **S3 sync** is available vs **file dumps** only.  
- Profiles **export shape** (JSON Schema), **auth**, and **delta** semantics.  
- Required **freshness** (SLA) for name search vs cost of full reindex.  
- Legal / **privacy**: retention, public vs restricted fields in the names index.  
- Whether KCWorks needs **separate** suggest filters (e.g. “only Profiles”) — would affect API or UI later, not only ingest.

---

## 7. Code map (reference only)

| Area | Location (vendored / upstream) |
|------|--------------------------------|
| Names record type & `/names` route | `invenio_vocabularies.contrib.names` |
| ORCID tar/XML pipeline | `contrib/names/datastreams.py` — `DATASTREAM_CONFIG` |
| ORCID S3 preset & job | `ORCID_PRESET_DATASTREAM_CONFIG`, `ImportORCIDJob`, `invenio_jobs.jobs` entry `import_orcid_names` |
| ORCID config defaults | `invenio_vocabularies.config` — `VOCABULARIES_ORCID_*` |
| CLI | `invenio_vocabularies.cli` — `vocabularies import`, `vocabularies update` |
| Async execution | `invenio_vocabularies.services.tasks.process_datastream` |

This sketch is intentionally **non-normative** for KCWorks instance code paths until product priorities return here.
