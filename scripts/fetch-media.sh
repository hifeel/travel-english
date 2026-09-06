#!/usr/bin/env bash
# 로컬에 음성/아이콘이 없을 때 GitHub Pages에서 받는다.
set -euo pipefail
BASE="https://hifeel.github.io/travel-english"
cd "$(dirname "$0")/.."
mkdir -p audio icons

echo "Downloading icons..."
for f in icon-192-v2.png icon-512-v2.png icon-maskable-512-v2.png; do
  curl -fsSL "$BASE/icons/$f" -o "icons/$f" && echo "  icons/$f" || echo "  skip $f"
done

echo "Downloading audio listed in lesson JSON..."
python3 - <<'PY'
import json, os, sys, urllib.request

base = "https://hifeel.github.io/travel-english/"

def load_lessons():
    folder = "data/lessons"
    lessons = []
    if os.path.isdir(folder):
        for name in sorted(os.listdir(folder)):
            if name.endswith(".json"):
                with open(os.path.join(folder, name), encoding="utf-8") as f:
                    lessons.append(json.load(f))
    return lessons

paths = []
for lesson in load_lessons():
    for t in lesson.get("turns", []):
        a = t.get("audio")
        if a:
            paths.append(a)

seen = set()
ok = 0
for p in paths:
    if p in seen:
        continue
    seen.add(p)
    parent = os.path.dirname(p)
    if parent:
        os.makedirs(parent, exist_ok=True)
    try:
        urllib.request.urlretrieve(base + p, p)
        ok += 1
        print("  " + p)
    except Exception as e:
        print("  FAIL %s: %s" % (p, e), file=sys.stderr)
print("Done: %d/%d audio files" % (ok, len(seen)))
PY
