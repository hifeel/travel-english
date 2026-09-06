#!/usr/bin/env bash
# 대화 JSON에서 edge-tts로 mp3 생성. MCP 없음.
# Usage: ./scripts/generate-audio.sh data/lessons/28.json
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JSON="${1:-}"
if [ -z "$JSON" ] || [ ! -f "$JSON" ]; then
  echo "usage: $0 data/lessons/NN.json" >&2
  exit 1
fi
command -v edge-tts >/dev/null || pip install -q edge-tts
python3 - "$ROOT" "$JSON" <<'PY'
import json, os, subprocess, sys
root, path = sys.argv[1], sys.argv[2]
with open(path, encoding="utf-8") as f:
    lesson = json.load(f)
os.makedirs(os.path.join(root, "audio"), exist_ok=True)
for t in lesson.get("turns", []):
    audio = t.get("audio") or ""
    text = (t.get("en") or "").strip()
    if not audio or not text:
        continue
    dest = os.path.join(root, audio)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    role = t.get("role") or ""
    voice = "en-US-JennyNeural" if role == "you" else "en-US-GuyNeural"
    print(voice, audio)
    subprocess.check_call(["edge-tts", "--voice", voice, "--text", text, "--write-media", dest])
print("done")
PY
