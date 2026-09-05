#!/usr/bin/env python3
"""Bundle data/lessons/*.json into the single data/lessons.json the index page loads.

The bundle is generated at deploy time and gitignored; data/lessons/*.json and
data/index.json are the source of truth.
"""
import json
import os
import sys


def main():
    if len(sys.argv) != 3:
        sys.exit("usage: build-lessons-json.py <repo-root> <output-path>")
    root, dest = sys.argv[1], sys.argv[2]

    with open(os.path.join(root, "data/index.json"), encoding="utf-8") as f:
        ids = json.load(f)["ids"]

    lessons = []
    for lid in ids:
        path = os.path.join(root, "data/lessons/%s.json" % lid)
        with open(path, encoding="utf-8") as f:
            lessons.append(json.load(f))

    with open(dest, "w", encoding="utf-8") as f:
        json.dump({"lessons": lessons}, f, ensure_ascii=False, indent=2)

    print("Generated lessons.json from %d lessons" % len(lessons))


if __name__ == "__main__":
    main()
