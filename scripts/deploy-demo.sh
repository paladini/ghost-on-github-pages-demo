#!/usr/bin/env bash
# Publish the demo repository while preserving legacy/, content-seed/, and CI assets.
set -euo pipefail

DEMO_REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GHOST_HOME="${HOME}/.ghost"
LEGACY_BACKUP="${TMPDIR:-/tmp}/ghost-demo-legacy-backup"

if [ ! -d "${GHOST_HOME}" ]; then
	echo "[ERROR] Ghost is not installed at ${GHOST_HOME}. Run install.sh from ghost-on-github-pages v3 first." >&2
	exit 1
fi

if [ ! -d "${DEMO_REPO_ROOT}/legacy/v2/static" ]; then
	echo "[ERROR] legacy/v2/static not found in ${DEMO_REPO_ROOT}" >&2
	exit 1
fi

echo "[INFO] Backing up legacy/ and repo assets..."
rm -rf "${LEGACY_BACKUP}"
mkdir -p "${LEGACY_BACKUP}"
cp -a "${DEMO_REPO_ROOT}/legacy" "${LEGACY_BACKUP}/"
cp "${DEMO_REPO_ROOT}/README.md" "${LEGACY_BACKUP}/"
cp -a "${DEMO_REPO_ROOT}/content-seed" "${LEGACY_BACKUP}/"
cp -a "${DEMO_REPO_ROOT}/scripts" "${LEGACY_BACKUP}/"
if [ -d "${DEMO_REPO_ROOT}/.github" ]; then
	cp -a "${DEMO_REPO_ROOT}/.github" "${LEGACY_BACKUP}/"
fi

echo "[INFO] Running standard v3 deploy..."
(cd "${GHOST_HOME}" && ./deploy.sh)

PUBLISH_PATH="${GHOST_HOME}/publish"
echo "[INFO] Merging preserved demo assets into publish output..."
cp -a "${LEGACY_BACKUP}/legacy" "${PUBLISH_PATH}/"
cp "${LEGACY_BACKUP}/README.md" "${PUBLISH_PATH}/"
cp -a "${LEGACY_BACKUP}/content-seed" "${PUBLISH_PATH}/"
cp -a "${LEGACY_BACKUP}/scripts" "${PUBLISH_PATH}/"
if [ -d "${LEGACY_BACKUP}/.github" ]; then
	cp -a "${LEGACY_BACKUP}/.github" "${PUBLISH_PATH}/"
fi

# gssg may crawl the Classic v2 nav link into static/legacy — remove duplicate
rm -rf "${PUBLISH_PATH}/static/legacy"

cd "${PUBLISH_PATH}"
git add -A
if git diff --cached --quiet; then
	echo "[WARN] No changes to publish."
	exit 0
fi

git commit -m "Demo update: v3 content + legacy archive"
git push origin master:master master:gh-pages -f
echo "[INFO] Done! Live site: https://paladini.github.io/ghost-on-github-pages-demo/"
