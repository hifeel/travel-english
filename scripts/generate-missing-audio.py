#!/usr/bin/env python3
"""Fill in missing turn audio: assign a path where there is none, then speak it.

A turn with no "audio" key used to be skipped in silence, so a new lesson that
only carried the English and Korean produced nothing at all and said so as
"generated 0". Paths are derived from the lesson id, which keeps them unique
without anyone having to pick an unused prefix.
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LESSONS = os.path.join(ROOT, "data", "lessons")
AUDIO = os.path.join(ROOT, "audio")


def voice_for(role):
    return "en-US-JennyNeural" if role == "you" else "en-US-GuyNeural"


def assign_paths(path, lesson):
    """Give every spoken turn an audio path, saving the lesson if any were added."""
    lesson_id = str(lesson.get("id") or "")
    added = 0
    for i, t in enumerate(lesson.get("turns", []), 1):
        if t.get("audio") or not (t.get("en") or "").strip():
            continue
        t["audio"] = "audio/%s-%02d.mp3" % (lesson_id, i)
        added += 1
    if added:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(lesson, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print("assigned %d audio path(s) in %s" % (added, os.path.basename(path)))
    return added


def main():
    os.makedirs(AUDIO, exist_ok=True)
    made = 0
    for name in sorted(os.listdir(LESSONS)):
        if not name.endswith(".json"):
            continue
        path = os.path.join(LESSONS, name)
        with open(path, encoding="utf-8") as f:
            lesson = json.load(f)
        assign_paths(path, lesson)
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
            # python -m rather than the edge-tts console script: pip puts that
            # script somewhere that is on PATH in CI but usually is not locally,
            # and this way the same command works in both places.
            subprocess.check_call(
                [sys.executable, "-m", "edge_tts",
                 "--voice", voice, "--text", text, "--write-media", dest]
            )
            made += 1
    print("generated", made)
    return 0


if __name__ == "__main__":
    sys.exit(main())
