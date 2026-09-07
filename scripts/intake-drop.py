#!/usr/bin/env python3
"""Move any lesson JSON in drop/ into data/lessons/ under the next free id.

Uploading a lesson should not mean knowing which number is next or keeping the
filename and the "id" field in agreement -- build-index.py refuses to run when
those disagree, and that is a confusing way to find out. Anything dropped here
is renumbered and normalised instead.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DROP = os.path.join(ROOT, "drop")
LESSONS = os.path.join(ROOT, "data", "lessons")

REQUIRED = ("title_en", "title_ko", "subtitle", "desc", "turns")


def existing_ids():
    return {n[:-5] for n in os.listdir(LESSONS)
            if n.endswith(".json") and n[:-5].isdigit()}


def slugify(title):
    s = re.sub(r"[^a-z0-9]+", "-", (title or "").lower()).strip("-")
    return s or "lesson"


def normalise(lesson, lesson_id, source):
    for key in REQUIRED:
        if not lesson.get(key):
            sys.exit("%s: 필수 항목이 없습니다: %s" % (source, key))
    if not isinstance(lesson["turns"], list) or not lesson["turns"]:
        sys.exit("%s: turns 가 비어 있습니다" % source)

    for i, t in enumerate(lesson["turns"], 1):
        if not (t.get("en") or "").strip():
            sys.exit("%s: %d번째 turn 에 en 이 없습니다" % (source, i))
        t["role"] = "you" if str(t.get("role", "")).lower() == "you" else "them"
        if not t.get("speaker"):
            t["speaker"] = "You (Traveler)" if t["role"] == "you" else "Staff"

    lesson["id"] = lesson_id
    if not lesson.get("slug"):
        lesson["slug"] = slugify(lesson["title_en"])
    lesson.setdefault("tips", [])
    return lesson


def main():
    if not os.path.isdir(DROP):
        print("drop/ 없음")
        return 0

    files = sorted(n for n in os.listdir(DROP) if n.endswith(".json"))
    if not files:
        print("drop/ 에 처리할 파일 없음")
        return 0

    taken = existing_ids()
    moved = []
    for name in files:
        src = os.path.join(DROP, name)
        with open(src, encoding="utf-8") as f:
            try:
                lesson = json.load(f)
            except ValueError as e:
                sys.exit("%s: JSON 을 읽지 못했습니다 — %s" % (name, e))

        # Keep the id it came with when that slot is free; otherwise take the
        # next one, so re-uploading a lesson does not overwrite a different one.
        wanted = str(lesson.get("id") or "").strip()
        if re.fullmatch(r"\d{1,2}", wanted or "") and wanted.zfill(2) not in taken:
            lesson_id = wanted.zfill(2)
        else:
            lesson_id = "%02d" % (max((int(i) for i in taken), default=0) + 1)
        taken.add(lesson_id)

        lesson = normalise(lesson, lesson_id, name)
        dest = os.path.join(LESSONS, "%s.json" % lesson_id)
        with open(dest, "w", encoding="utf-8") as f:
            json.dump(lesson, f, ensure_ascii=False, indent=2)
            f.write("\n")
        os.remove(src)
        moved.append((name, lesson_id, lesson["title_en"], len(lesson["turns"])))
        print("%s -> data/lessons/%s.json  (%s, %d turns)"
              % (name, lesson_id, lesson["title_en"], len(lesson["turns"])))

    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as f:
            f.write("moved=%s\n" % " ".join(m[1] for m in moved))
    return 0


if __name__ == "__main__":
    sys.exit(main())
