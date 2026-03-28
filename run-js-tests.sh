#!/usr/bin/env bash
#
# Run Jest for this package (same role as run-js-tests.sh in the parent kcworks-next repo).
set -euo pipefail
cd "$(dirname "$0")"

# Run the tests (Jest + babel-jest; no webpack/rspack bundle step)
pnpm test
