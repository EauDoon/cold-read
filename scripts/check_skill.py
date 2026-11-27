"""Mechanical checks for the cold-read skill package.

Runs with the standard library only:  python3 scripts/check_skill.py
Exit code 0 means every check passed.

1. Frontmatter: the name matches the folder and the description is one
   single-quoted line inside the listing limit.
2. Every reference file SKILL.md names exists, and the compact loop rules in
   SKILL.md and the full rules in references/loop-rules.md list the same rules.
3. House style: no em or en dashes, as characters, HTML entities, or script
   and style escapes.
4. Nothing private: no local paths, email addresses or workspace database ids.
5. Every relative link and image in a Markdown or HTML file resolves.
"""
import pathlib
import re
import sys
from urllib.parse import unquote

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKILL_NAME = "cold-read"
MAX_DESCRIPTION = 220
TEXT_SUFFIXES = {".md", ".html", ".py", ".yml", ".yaml", ".json", ".js", ".mjs", ".txt", ".svg"}
SKIP_DIRS = {".git", "node_modules", "vendor", "__pycache__"}
# These files spell out the patterns they look for.
PATTERN_FILES = {"scripts/check_skill.py", "scripts/test_check_skill.py"}

EM, EN = chr(0x2014), chr(0x2013)
# A dash is also caught when written as an HTML entity, as a script or JSON
# escape (backslash u or x), or as a CSS escape (backslash and the hex code).
DASH_RE = re.compile(
    f"{EM}|{EN}|&mdash;|&ndash;|&#0*821[12];|&#[xX]0*201[34];"
    r"|\\[uUxX]\{0*201[34]\}|\\[uUxX](?:0000)?201[34]"
    # A CSS escape reads the same as a year folder in a Windows path, so it counts only where CSS
    # ends it: at the end of the line, before a space, a quote, ; < ), before sentence punctuation
    # that ends the string, or before another escape that a path does not hold (a no-break space or
    # a code padded to four digits). Escapes of the U+2000 block may come between.
    r"""|\\0{0,2}201[34](?=(?:\\{1,2}0{0,2}2[0-9A-Fa-f]{3}\s?){0,16}"""
    r"""(?:$|[\s"';<)]|[.,:!?](?:$|[\s"'])|\\{1,2}(?:0{0,4}[Aa]0(?![0-9A-Fa-f])|00[0-9A-Fa-f]{2})))"""
)
PRIVATE = [
    (re.compile(r"[A-Za-z]:\\Users\\"), "a Windows user path"),
    (re.compile(r"/mnt/[\w-]+"), "a mounted folder path"),
    (re.compile(r"/Users/[\w.-]+"), "a macOS user path"),
    (re.compile(r"/home/[\w.-]+"), "a Linux home path"),
    (re.compile(r"collection://[0-9a-f-]{8,}"), "a workspace database id"),
    # The last label must be letters and the host must not open with two numeric labels (a leading v
    # is allowed), so a package version such as serve@14.2.4 or pkg@1.0.0-rc.next-1 does not match.
    (re.compile(r"[\w.+-]+@(?!v?\d+\.\d+(?![0-9A-Za-z_]))[\w-]+(?:\.[\w-]+)*\.[A-Za-z]{2,}(?![A-Za-z0-9])"), "an email address"),
]
ALLOWED_EMAILS = {"noreply@anthropic.com"}

FENCE_RE = re.compile(r"^(`{3,}|~{3,}).*?^\1[^\n]*$", re.M | re.S)
INLINE_CODE_RE = re.compile(r"`[^`\n]+`")
MD_LINK_RE = re.compile(r"\]\(\s*<?([^)\s>]+)>?(?:\s+[\"'][^)]*)?\s*\)")
HTML_LINK_RE = re.compile(r"""(?:href|src)\s*=\s*["']([^"']+)["']""")
EXTERNAL_RE = re.compile(r"^(?:[a-z][a-z0-9+.-]*:|//)", re.I)
BOLD_RULE_RE = re.compile(r"^- \*\*(.+?)\*\*", re.M)


def text_files(root):
    for path in sorted(root.rglob("*")):
        if path.is_file() and path.suffix in TEXT_SUFFIXES and not (SKIP_DIRS & set(path.relative_to(root).parts)):
            yield path


def check_frontmatter(skill_md, errors):
    front = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n", skill_md, re.S)
    if not front:
        errors.append("SKILL.md has no YAML frontmatter")
        return
    name = re.search(r'^name:\s*"?([^"\n]+)"?\s*$', front.group(1), re.M)
    desc = re.search(r"^description:\s*'(.*)'\s*$", front.group(1), re.M)
    if not name or name.group(1) != SKILL_NAME:
        errors.append(f"frontmatter name must be {SKILL_NAME}")
    if not desc:
        errors.append("frontmatter description must be one single-quoted line")
        return
    text = desc.group(1).replace("''", "'")
    if not text.strip():
        errors.append("description is empty")
    if len(text) > MAX_DESCRIPTION:
        errors.append(f"description is {len(text)} characters; the limit is {MAX_DESCRIPTION}")
    if re.search(r"<[^>]+>", text):
        errors.append("description contains an XML tag")


def rule_key(text):
    """The first two words of a rule name, enough to pair the two lists."""
    return " ".join(re.sub(r"[^a-z0-9 ]", "", text.lower()).split()[:2])


def check_references(skill_dir, skill_md, errors):
    for ref in sorted(set(re.findall(r"references/[\w.-]+\.md", skill_md))):
        if not (skill_dir / ref).is_file():
            errors.append(f"SKILL.md names {ref}, which does not exist")
    rules_path = skill_dir / "references" / "loop-rules.md"
    section = re.search(r"^### 6a\. Loop rules\n(.*?)(?=^Verdicts:|^#{2,3} )", skill_md, re.M | re.S)
    if not rules_path.is_file() or not section:
        errors.append("SKILL.md section 6a or references/loop-rules.md is missing")
        return
    compact = {rule_key(m) for m in BOLD_RULE_RE.findall(section.group(1))}
    full = {rule_key(m) for m in BOLD_RULE_RE.findall(rules_path.read_text(encoding="utf-8"))}
    for key in sorted(compact - full):
        errors.append(f"loop rule '{key}' is in SKILL.md section 6a but not in references/loop-rules.md")
    for key in sorted(full - compact):
        errors.append(f"loop rule '{key}' is in references/loop-rules.md but not in SKILL.md section 6a")


def line_problems(line):
    """Return a label for each dash or private string on one line."""
    found = []
    if DASH_RE.search(line):
        found.append("an em or en dash")
    for pattern, label in PRIVATE:
        for m in pattern.finditer(line):
            if m.group(0) not in ALLOWED_EMAILS:
                found.append(f"{label}: {m.group(0)}")
    return found


def link_targets(text, suffix):
    """Relative link and image targets in a Markdown or HTML file."""
    targets = [m.group(1) for m in HTML_LINK_RE.finditer(text)]
    if suffix == ".md":
        prose = INLINE_CODE_RE.sub("", FENCE_RE.sub("", text))
        targets = [m.group(1) for m in HTML_LINK_RE.finditer(prose)]
        targets += [m.group(1) for m in MD_LINK_RE.finditer(prose)]
    return [t for t in targets if not EXTERNAL_RE.match(t) and not t.startswith("#")]


def check_text(root, errors):
    for path in text_files(root):
        rel = path.relative_to(root).as_posix()
        text = path.read_text(encoding="utf-8")
        if rel not in PATTERN_FILES:
            for n, line in enumerate(text.splitlines(), 1):
                for problem in line_problems(line):
                    errors.append(f"{rel}:{n} has {problem}")
        if path.suffix in (".md", ".html"):
            for target in link_targets(text, path.suffix):
                clean = unquote(target.split("#")[0].split("?")[0])
                if not clean:
                    continue
                base = root if clean.startswith("/") else path.parent
                resolved = (base / clean.lstrip("/")).resolve()
                if not resolved.is_relative_to(root) or not resolved.exists():
                    errors.append(f"{rel}: broken relative link '{target}'")


def main(root=ROOT):
    errors = []
    skill_dir = root / ".claude" / "skills" / SKILL_NAME
    skill_path = skill_dir / "SKILL.md"
    if not skill_path.is_file():
        errors.append(f".claude/skills/{SKILL_NAME}/SKILL.md not found")
    else:
        skill_md = skill_path.read_text(encoding="utf-8")
        check_frontmatter(skill_md, errors)
        check_references(skill_dir, skill_md, errors)
    check_text(root, errors)
    if errors:
        print("\n".join(f"FAIL {e}" for e in errors))
        print(f"{len(errors)} failure(s)")
        return 1
    print("cold-read package checks pass: frontmatter, references, loop rules, no dashes, nothing private, links resolve.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
