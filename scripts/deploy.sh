#!/usr/bin/env bash
# Run on the Towns host where the towns-web docker container is running.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST=/usr/share/nginx/html/travel-english

docker exec towns-web mkdir -p "$DEST/data/lessons" "$DEST/audio" "$DEST/icons"
for f in index.html lesson.html app.js sw.js manifest.webmanifest; do
  docker cp "$ROOT/$f" "towns-web:$DEST/$f"
done

if [ -f "$ROOT/data/index.json" ]; then
  docker cp "$ROOT/data/index.json" "towns-web:$DEST/data/index.json"
fi
if [ -d "$ROOT/data/lessons" ]; then
  docker cp "$ROOT/data/lessons/." "towns-web:$DEST/data/lessons/"
fi
# data/lessons.json is derived, not committed: index.html's loadLessons() reads
# it before falling back to the split files, so build it here from data/lessons
# rather than shipping a copy that can drift out of sync.
if [ -f "$ROOT/data/index.json" ] && [ -d "$ROOT/data/lessons" ]; then
  BUNDLE="$(mktemp -t lessons.json.XXXXXX)"
  trap 'rm -f "$BUNDLE"' EXIT
  python3 "$ROOT/scripts/build-lessons-json.py" "$ROOT" "$BUNDLE"
  chmod 644 "$BUNDLE"  # mktemp makes it 0600 and docker cp keeps the mode
  docker cp "$BUNDLE" "towns-web:$DEST/data/lessons.json"
fi

if [ -d "$ROOT/icons" ]; then
  docker cp "$ROOT/icons/." "towns-web:$DEST/icons/"
fi
if ls "$ROOT/audio"/*.mp3 >/dev/null 2>&1; then
  docker cp "$ROOT/audio/." "towns-web:$DEST/audio/"
fi

echo "Deployed to towns-web:$DEST"
