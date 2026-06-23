#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="TokenPulse Island"
APP_DIR="${APP_DIR:-/Applications/${APP_NAME}.app}"
BUILD_DIR="${ROOT_DIR}/build/macos"
BUILD_APP="${BUILD_DIR}/${APP_NAME}.app"
EXECUTABLE="${BUILD_APP}/Contents/MacOS/TokenPulseIsland"

need() {
  command -v "$1" >/dev/null 2>&1 || {
    printf 'missing required command: %s\n' "$1" >&2
    exit 1
  }
}

need xcrun
need ditto

npm --prefix "${ROOT_DIR}" run build

rm -rf "${BUILD_APP}"
mkdir -p "${BUILD_APP}/Contents/MacOS" "${BUILD_APP}/Contents/Resources"

xcrun swiftc \
  "${ROOT_DIR}/macos/TokenPulseIslandApp.swift" \
  -o "${EXECUTABLE}" \
  -framework Cocoa \
  -framework WebKit

cp "${ROOT_DIR}/macos/Info.plist" "${BUILD_APP}/Contents/Info.plist"
chmod +x "${EXECUTABLE}"

rm -rf "${APP_DIR}"
ditto "${BUILD_APP}" "${APP_DIR}"

launchctl enable "gui/$(id -u)/com.huxy.tokenpulse-island" 2>/dev/null || true
launchctl kickstart -k "gui/$(id -u)/com.huxy.tokenpulse-island" 2>/dev/null || true
open -a "${APP_DIR}"

printf 'Installed %s\n' "${APP_DIR}"
printf 'Local dashboard: http://127.0.0.1:4188\n'

