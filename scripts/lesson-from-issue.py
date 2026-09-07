#!/usr/bin/env python3
"""Turn a "새 레슨 추가" issue into data/lessons/<next id>.json.

The issue form renders as "### <label>" headings followed by the value, so the
body is parsed by label. Audio paths are left off on purpose --
generate-missing-audio.py assigns and speaks them.

Reads the body from ISSUE_BODY; writes the new lesson and prints its id to
GITHUB_OUTPUT when running in Actions.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LESSONS = os.path.join(ROOT, "data", "lessons")

FIELDS = {
    "영어 제목": "title_en",
    "한국어 제목": "title_ko",
    "부제": "subtitle",
    "목록에 뜰 한 줄 설명": "desc",
    "대화문": "turns",
    "표현 정리 (선택)": "tips",
}


def parse_body(body):
    """Split "### label\n\nvalue" sections into {label: value}."""
    out = {}
    parts = re.split(r"^###[ \t]*", body.replace("\r\n", "\n"), flags=re.M)
    for part in parts[1:]:
        label, _, value = part.partition("\n")
        value = value.strip()
        # A "render:" textarea arrives fenced; keep the inside verbatim.
        fence = re.match(r"^```[a-zA-Z]*\n(.*)\n?```$", value, re.S)
        if fence:
            value = fence.group(1)
        out[label.strip()] = value.strip()
    return out


def split_row(line):
    return [c.strip() for c in line.split("|")]


def build_turns(raw):
    turns = []
    for n, line in enumerate(raw.splitlines(), 1):
        line = line.strip()
        if not line:
            continue
        cells = split_row(line)
        if len(cells) < 4:
            sys.exit("대화문 %d번째 줄에 항목이 4개가 아닙니다: %r" % (n, line))
        role, speaker, en, ko = cells[0], cells[1], cells[2], "|".join(cells[3:]).strip()
        role = "you" if role.lower() == "you" else "them"
        if not en:
            sys.exit("대화문 %d번째 줄에 영어 문장이 없습니다" % n)
        turns.append({"role": role, "speaker": speaker or ("You (Traveler)" if role == "you" else "Staff"),
                      "en": en, "ko": ko})
    if not turns:
        sys.exit("대화문이 비어 있습니다")
    return turns


def build_tips(raw):
    tips = []
    for line in (raw or "").splitlines():
        line = line.strip()
        if not line:
            continue
        cells = split_row(line)
        if len(cells) < 2:
            continue
        tips.append({"en": cells[0], "ko": "|".join(cells[1:]).strip()})
    return tips


def next_id():
    ids = [int(n[:-5]) for n in os.listdir(LESSONS)
           if n.endswith(".json") and n[:-5].isdigit()]
    return "%02d" % (max(ids) + 1 if ids else 1)


def slugify(title):
    s = re.sub(r"[^a-z0-9]+", "-", (title or "").lower()).strip("-")
    return s or "lesson"


def main():
    body = os.environ.get("ISSUE_BODY", "")
    if not body.strip():
        sys.exit("ISSUE_BODY 가 비어 있습니다")

    sections = parse_body(body)
    got = {}
    for label, key in FIELDS.items():
        value = sections.get(label, "")
        if value in ("_No response_", "_응답 없음_"):
            value = ""
        got[key] = value

    for key in ("title_en", "title_ko", "subtitle", "desc", "turns"):
        if not got[key]:
            sys.exit("필수 항목이 비었습니다: %s" % key)

    lesson_id = next_id()
    lesson = {
        "id": lesson_id,
        "slug": slugify(got["title_en"]),
        "title_en": got["title_en"],
        "title_ko": got["title_ko"],
        "subtitle": got["subtitle"],
        "desc": got["desc"],
        "turns": build_turns(got["turns"]),
        "tips": build_tips(got["tips"]),
    }

    dest = os.path.join(LESSONS, "%s.json" % lesson_id)
    with open(dest, "w", encoding="utf-8") as f:
        json.dump(lesson, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("wrote %s (%d turns, %d tips)"
          % (dest, len(lesson["turns"]), len(lesson["tips"])))

    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as f:
            f.write("lesson_id=%s\n" % lesson_id)
            f.write("title=%s\n" % lesson["title_en"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
