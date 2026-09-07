#!/usr/bin/env python3
"""Rewrite data/index.json from whatever lessons are in data/lessons/.

Adding a lesson should mean adding one file, so the id list is derived rather
than hand-maintained -- a lesson whose id is missing here never reaches the
list page, and that is an easy step to forget.

Run from anywhere:  python3 scripts/build-index.py
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LESSONS = os.path.join(ROOT, "data", "lessons")
INDEX = os.path.join(ROOT, "data", "index.json")


def main():
    ids = []
    for name in sorted(os.listdir(LESSONS)):
        if not name.endswith(".json"):
            continue
        path = os.path.join(LESSONS, name)
        with open(path, encoding="utf-8") as f:
            lesson = json.load(f)
        lesson_id = str(lesson.get("id") or "")
        stem = name[:-5]
        if lesson_id != stem:
            # build-lessons-json.py looks each lesson up by filename, so a
            # mismatch would silently drop it from the bundle.
            sys.exit("%s declares id %r; expected %r" % (name, lesson_id, stem))
        ids.append(lesson_id)

    if not ids:
        sys.exit("no lessons found in %s" % LESSONS)

    before = None
    if os.path.isfile(INDEX):
        with open(INDEX, encoding="utf-8") as f:
            before = f.read()

    after = json.dumps({"ids": ids}, ensure_ascii=False, indent=2) + "\n"
    if after == before:
        print("index.json already lists %d lessons" % len(ids))
        return 0

    with open(INDEX, "w", encoding="utf-8") as f:
        f.write(after)
    print("index.json now lists %d lessons" % len(ids))
    return 0


if __name__ == "__main__":
    sys.exit(main())
