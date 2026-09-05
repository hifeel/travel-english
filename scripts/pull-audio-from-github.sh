#!/usr/bin/env bash
# Pull audio listed in lesson JSON from GitHub into Towns nginx html.
# Usage on Towns host:
#   GITHUB_TOKEN=... ./scripts/pull-audio-from-github.sh
#   GITHUB_TOKEN=... ./scripts/pull-audio-from-github.sh audio/b01.mp3 audio/b02.mp3
set -euo pipefail

OWNER="${GITHUB_OWNER:-hifeel}"
REPO="${GITHUB_REPO:-travel-english}"
REF="${GITHUB_REF:-main}"
DEST="${AUDIO_DEST:-/usr/share/nginx/html/travel-english}"
API="https://api.github.com/repos/${OWNER}/${REPO}/contents"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "GITHUB_TOKEN is required (private repo)." >&2
  exit 1
fi

auth=(-H "Authorization: Bearer ${GITHUB_TOKEN}" -H "Accept: application/vnd.github.raw" -H "X-GitHub-Api-Version: 2022-11-28" -L)

pull_one() {
  local rel="$1"
  rel="${rel#./}"
  local out="${DEST}/${rel}"
  mkdir -p "$(dirname "$out")"
  echo "GET ${rel}"
  curl -fsSL "${auth[@]}" "${API}/${rel}?ref=${REF}" -o "$out"
  ls -la "$out"
}

if [[ $# -gt 0 ]]; then
  for p in "$@"; do pull_one "$p"; done
  exit 0
fi

python3 - "$DEST" <<'PY'
import json, os, sys
root = sys.argv[1]
folder = os.path.join(root, "data/lessons")
paths = []
if os.path.isdir(folder):
    for name in sorted(os.listdir(folder)):
        if name.endswith(".json"):
            with open(os.path.join(folder, name), encoding="utf-8") as f:
                lesson = json.load(f)
            for t in lesson.get("turns", []):
                a = t.get("audio")
                if a:
                    paths.append(a)
seen = []
for p in paths:
    if p not in seen:
        seen.append(p)
for p in seen:
    print(p)
PY
 | while read -r rel; do
  if [[ -f "${DEST}/${rel}" ]]; then
    echo "skip exists ${rel}"
    continue
  fi
  pull_one "$rel"
done
