#!/bin/bash
# invenio-modular-deposit-form JS tests (pnpm). From the monorepo, prefer
# ``./run-tests.sh --js-only`` / ``scripts/run-js-suites.sh``.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
pnpm run test "$@"
