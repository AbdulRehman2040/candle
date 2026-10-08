#!/bin/bash
# ==================================================================
# Fondue Flame — deploy / auto-update for cPanel (Passenger)
#
#   bash deploy.sh          update only if GitHub has new commits
#   bash deploy.sh --force  rebuild and restart even if nothing changed
#
# Pulls the latest master from GitHub, installs packages, builds, and
# restarts the Node app. Safe to run from cron: it exits straight away
# when there is nothing new, and never runs twice at the same time.
# Your .env.local is not touched (git ignores it).
# ==================================================================

set -euo pipefail

BRANCH="master"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# --- One run at a time ---------------------------------------------
exec 9>"$APP_DIR/.deploy.lock"
if ! flock -n 9; then
  log "Another deploy is already running. Skipping."
  exit 0
fi

# --- Use the Node version chosen in cPanel ------------------------
# cPanel keeps it in ~/nodevenv/<app folder>/<version>/bin/activate.
REL_DIR="${APP_DIR#"$HOME"/}"
ACTIVATE="$(ls -d "$HOME/nodevenv/$REL_DIR"/*/bin/activate 2>/dev/null | sort -V | tail -n 1 || true)"
if [ -n "$ACTIVATE" ]; then
  # shellcheck disable=SC1090
  source "$ACTIVATE"
else
  log "Warning: cPanel Node environment not found; using system node."
fi
log "Node $(node -v), npm $(npm -v)"

# --- Anything new on GitHub? ---------------------------------------
git fetch --quiet origin "$BRANCH"
LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/$BRANCH")"

if [ "$LOCAL" = "$REMOTE" ] && [ "${1:-}" != "--force" ]; then
  log "Already up to date ($LOCAL). Nothing to do."
  exit 0
fi

log "Updating ${LOCAL:0:7} -> ${REMOTE:0:7}"
# The server is never edited by hand, so match GitHub exactly.
git reset --hard --quiet "origin/$BRANCH"

# --- Install + build ------------------------------------------------
log "Installing packages..."
npm install --no-audit --no-fund

log "Building (takes a few minutes)..."
if ! npm run build; then
  log "BUILD FAILED. The app was not restarted. Fix the error above and run again."
  exit 1
fi

# --- Restart Passenger ---------------------------------------------
rm -rf tmp/restart.txt
mkdir -p tmp
touch tmp/restart.txt
log "Done. Site restarted on $(git rev-parse --short HEAD)."
