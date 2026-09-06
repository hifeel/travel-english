#!/usr/bin/env bash
# GitHub Pages 배포. Towns/MCP/docker 사용 안 함.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -f data/index.json ] && [ -d data/lessons ]; then
  python3 scripts/build-lessons-json.py "$ROOT" /tmp/travel-english-lessons.json
  echo "Checked lessons bundle ($(python3 -c 'import json;print(len(json.load(open("/tmp/travel-english-lessons.json"))["lessons"]))') lessons)."
fi

echo "Deploy = git push origin main"
echo "Live: https://hifeel.github.io/travel-english/"
echo "MCP Towns / docker cp / towns.co.kr 경로는 써지 마십니다."
