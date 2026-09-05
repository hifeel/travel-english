#!/usr/bin/env bash
# Run on the Towns host where the towns-web docker container is running.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST=/usr/share/nginx/html/travel-english

docker exec towns-web mkdir -p "$DEST/data" "$DEST/audio" "$DEST/icons"
for f in index.html lesson.html app.js sw.js manifest.webmanifest; do
  docker cp "$ROOT/$f" "towns-web:$DEST/$f"
done
docker cp "$ROOT/data/lessons.json" "towns-web:$DEST/data/lessons.json"

if [ -d "$ROOT/icons" ]; then
  docker cp "$ROOT/icons/." "towns-web:$DEST/icons/"
fi
if ls "$ROOT/audio"/*.mp3 >/dev/null 2>&1; then
  docker cp "$ROOT/audio/." "towns-web:$DEST/audio/"
fi

echo "Deployed to towns-web:$DEST"
