#!/usr/bin/env bash
set -euo pipefail
BASE="https://towns.co.kr/travel-english"
cd "$(dirname "$0")/.."
mkdir -p audio icons

echo "Downloading icons..."
for f in icon-192.png icon-512.png icon-maskable-512.png; do
  curl -fsSL "$BASE/icons/$f" -o "icons/$f"
  echo "  icons/$f"
done

echo "Downloading audio listed in data/lessons.json..."
python3 - <<'PY'
import json, os, sys, urllib.request

base = "https://towns.co.kr/travel-english/"
with open("data/lessons.json", encoding="utf-8") as f:
    data = json.load(f)

paths = []
for lesson in data.get("lessons", []):
    for t in lesson.get("turns", []):
        a = t.get("audio")
        if a:
            paths.append(a)

seen = set()
uniq = []
for p in paths:
    if p not in seen:
        seen.add(p)
        uniq.append(p)

ok = 0
for p in uniq:
    dest = p
    parent = os.path.dirname(dest)
    if parent:
        os.makedirs(parent, exist_ok=True)
    url = base + p
    try:
        urllib.request.urlretrieve(url, dest)
        ok += 1
        print("  " + p)
    except Exception as e:
        print("  FAIL %s: %s" % (p, e), file=sys.stderr)

print("Done: %d/%d audio files" % (ok, len(uniq)))
PY
