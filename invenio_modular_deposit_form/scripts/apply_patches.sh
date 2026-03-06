#!/bin/bash

# Script to apply patches from invenio-modular-deposit-form to site-packages.
# Patches invenio-rdm-records so DepositFormApp and DepositBootstrap accept
# validate and validationSchema props (for client-side form validation).
#
# Usage: ./apply_patches.sh [venv_path]
#   venv_path: Optional; path to virtual environment (default: ./.venv relative to current directory)

set -e

if [ $# -eq 1 ]; then
    VENV_DIR="$1"
    if [[ "$VENV_DIR" != /* ]]; then
        VENV_DIR="${PWD}/${VENV_DIR}"
    fi
else
    VENV_DIR="${PWD}/.venv"
fi

if [ ! -d "$VENV_DIR" ]; then
    echo "Error: Virtual environment directory not found at $VENV_DIR"
    exit 1
fi

echo "Using virtual environment: $VENV_DIR"

SITE_PACKAGES=$(find "$VENV_DIR" -name "site-packages" -type d | head -1)

if [ -z "$SITE_PACKAGES" ]; then
    echo "Error: site-packages directory not found in $VENV_DIR"
    exit 1
fi

echo "Found site-packages at: $SITE_PACKAGES"

# Patches come from the installed invenio_modular_deposit_form package
PATCHES_DIR="${SITE_PACKAGES}/invenio_modular_deposit_form/patches"

copy_patches() {
    local source_dir="$1"
    local package_name="$2"

    echo "Processing patches for $package_name..."

    local package_dir="$SITE_PACKAGES/$package_name"
    if [ ! -d "$package_dir" ]; then
        package_dir=$(find "$SITE_PACKAGES" -maxdepth 1 -name "$package_name" -type d | head -1)
    fi

    if [ -z "$package_dir" ] || [ ! -d "$package_dir" ]; then
        echo "Warning: Package directory for $package_name not found in site-packages"
        return
    fi

    echo "Found package directory: $package_dir"

    find "$source_dir" -type f | while read -r patch_file; do
        rel_path="${patch_file#$source_dir/}"
        target_file="$package_dir/$rel_path"
        target_dir=$(dirname "$target_file")
        mkdir -p "$target_dir"
        echo "Copying: $patch_file -> $target_file"
        cp "$patch_file" "$target_file"
    done
}

if [ -d "$PATCHES_DIR/invenio_rdm_records" ]; then
    copy_patches "$PATCHES_DIR/invenio_rdm_records" "invenio_rdm_records"
else
    echo "Warning: invenio_rdm_records patches directory not found"
fi

echo "Patch application completed!"
echo ""
echo "Summary of applied patches:"
echo "=========================="
if [ -d "$PATCHES_DIR/invenio_rdm_records" ]; then
    echo "invenio_rdm_records patches:"
    find "$PATCHES_DIR/invenio_rdm_records" -type f -exec echo "  - {}" \;
fi
