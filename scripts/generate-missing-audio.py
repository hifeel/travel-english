#!/usr/bin/env python3
"""Create any missing audio/*.mp3 from lesson JSON using edge-tts."""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LESSONS = os.path.join(ROOT, "data", "lessons")
AUDIO = os.path.join(ROOT, "audio")


def voice_for(role):
    return "en-US-JennyNeural" if role == "you" else "en-US-GuyNeural"


def main():
    os.makedirs(AUDIO, exist_ok=True)
    made = 0
    for name in sorted(os.listdir(LESSONS)):
        if not name.endswith(".json"):
            continue
        with open(os.path.join(LESSONS, name), encoding="utf-8") as f:
            lesson = json.load(f)
        for t in lesson.get("turns", []):
            rel = t.get("audio") or ""
            text = (t.get("en") or "").strip()
            if not rel or not text:
                continue
            dest = os.path.join(ROOT, rel)
            if os.path.isfile(dest) and os.path.getsize(dest) > 1000:
                continue
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            voice = voice_for(t.get("role") or "")
            print("TTS", voice, rel)
            subprocess.check_call(
                ["edge-tts", "--voice", voice, "--text", text, "--write-media", dest]
            )
            made += 1
    print("generated", made)
    return 0


if __name__ == "__main__":
    sys.exit(main())
