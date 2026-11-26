"""Mechanical checks for the cold-read skill package.

Runs with the standard library only:  python3 scripts/check_skill.py
Exit code 0 means every check passed.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKILL = ROOT / ".claude" / "skills" / "cold-read"
TEXT_SUFFIXES = {".md", ".html", ".py", ".yml", ".json", ".js", ".mjs", ".txt"}
SKIP_DIRS = {".git", "node_modules", "vendor"}

errors = []


def fail(msg):
    errors.append(msg)


def text_files():
    for path in ROOT.rglob("*"):
        if path.is_file() and path.suffix in TEXT_SUFFIXES and not (SKIP_DIRS & set(path.parts)):
            yield path


# 1. Frontmatter: a name that matches the folder and a description inside the listing limit.
skill_md = (SKILL / "SKILL.md").read_text(encoding="utf-8")
front = re.match(r"^---\n(.*?)\n---\n", skill_md, re.S)
if not front:
    fail("SKILL.md has no YAML frontmatter")
else:
    name = re.search(r'^name:\s*"?([^"\n]+)"?\s*$', front.group(1), re.M)
    desc = re.search(r"^description:\s*'(.*)'\s*$", front.group(1), re.M)
    if not name or name.group(1) != "cold-read":
        fail("frontmatter name must be cold-read")
    if not desc:
        fail("frontmatter description must be one single-quoted line")
    elif len(desc.group(1)) > 220:
        fail(f"description is {len(desc.group(1))} characters; the limit is 220")

# 2. Every reference the skill names exists.
for ref in re.findall(r"references/[\w.-]+\.md", skill_md):
    if not (SKILL / ref).is_file():
        fail(f"SKILL.md names {ref}, which does not exist")

# 3. House style: no em or en dashes anywhere in the text files.
# 4. Nothing private: no local paths, email addresses or workspace database ids.
private = [
    (re.compile(r"[A-Za-z]:\\Users\\"), "a Windows user path"),
    (re.compile(r"/mnt/[\w-]+"), "a mounted folder path"),
    (re.compile(r"/Users/[\w.-]+"), "a macOS user path"),
    (re.compile(r"collection://[0-9a-f-]{8,}"), "a workspace database id"),
    (re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+"), "an email address"),
]
allowed_emails = {"noreply@anthropic.com"}
for path in text_files():
    if path.resolve() == pathlib.Path(__file__).resolve():
        continue
    rel = path.relative_to(ROOT)
    for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if "—" in line or "–" in line:
            fail(f"{rel}:{n} has an em or en dash")
        for pattern, label in private:
            for m in pattern.finditer(line):
                if m.group(0) in allowed_emails:
                    continue
                fail(f"{rel}:{n} has {label}: {m.group(0)}")

if errors:
    print("\n".join(errors))
    sys.exit(1)
print("cold-read package checks pass: frontmatter, references, no dashes, nothing private.")
