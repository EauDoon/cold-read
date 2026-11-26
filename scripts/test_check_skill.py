"""Unit tests for check_skill.py.  python3 -m unittest discover -s scripts -p 'test_*.py'"""
import pathlib
import sys
import tempfile
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import check_skill  # noqa: E402

GOOD = """---
name: "cold-read"
description: 'Blind pass on outgoing work.'
---

# Cold Read

### 6a. Loop rules

Full text in references/loop-rules.md.

- **One lens, one evaluator.** Never merge.
- **Mechanism lens** when the artifact has economics.

Verdicts: CLEAN.
"""
RULES = """# rules

- **One lens, one evaluator.** Two lenses in one brief is one evaluator.
- **Mechanism lens, when the artifact has economics.** Who profits.
"""


def build(root, skill=GOOD, rules=RULES, extra=None):
    folder = root / ".claude" / "skills" / "cold-read"
    (folder / "references").mkdir(parents=True)
    (folder / "SKILL.md").write_text(skill, encoding="utf-8")
    (folder / "references" / "loop-rules.md").write_text(rules, encoding="utf-8")
    for name, body in (extra or {}).items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(body, encoding="utf-8")


def run(**kwargs):
    with tempfile.TemporaryDirectory() as tmp:
        root = pathlib.Path(tmp).resolve()
        build(root, **kwargs)
        errors = []
        skill_dir = root / ".claude" / "skills" / "cold-read"
        skill_md = (skill_dir / "SKILL.md").read_text(encoding="utf-8")
        check_skill.check_frontmatter(skill_md, errors)
        check_skill.check_references(skill_dir, skill_md, errors)
        check_skill.check_text(root, errors)
        return errors


class CheckSkillTests(unittest.TestCase):
    def test_good_package_passes(self):
        self.assertEqual(run(), [])

    def test_wrong_name_fails(self):
        errors = run(skill=GOOD.replace('"cold-read"', '"warm-read"'))
        self.assertTrue(any("name must be cold-read" in e for e in errors))

    def test_description_at_limit_passes_and_over_fails(self):
        at = GOOD.replace("Blind pass on outgoing work.", "x" * 220)
        over = GOOD.replace("Blind pass on outgoing work.", "x" * 221)
        self.assertEqual(run(skill=at), [])
        self.assertTrue(any("221 characters" in e for e in run(skill=over)))

    def test_double_quoted_description_fails(self):
        errors = run(skill=GOOD.replace("'Blind pass on outgoing work.'", '"Blind pass."'))
        self.assertTrue(any("single-quoted" in e for e in errors))

    def test_missing_reference_file_fails(self):
        errors = run(skill=GOOD.replace("Verdicts:", "See references/missing.md.\n\nVerdicts:"))
        self.assertTrue(any("references/missing.md" in e for e in errors))

    def test_rule_missing_from_reference_fails(self):
        errors = run(rules=RULES.replace("- **Mechanism lens, when the artifact has economics.** Who profits.\n", ""))
        self.assertTrue(any("mechanism lens" in e and "not in references" in e for e in errors))

    def test_rule_missing_from_skill_fails(self):
        errors = run(rules=RULES + "- **Divergence stop.** Stop.\n")
        self.assertTrue(any("divergence stop" in e and "not in SKILL.md" in e for e in errors))

    def test_dashes_fail_as_characters_and_entities(self):
        for dash in (chr(0x2014), chr(0x2013), "&mdash;", "&ndash;", "&#8212;", "&#x2013;"):
            self.assertEqual(check_skill.line_problems(f"a {dash} b"), ["an em or en dash"])
        self.assertEqual(check_skill.line_problems("a - b, 3 to 5, well-formed"), [])

    def test_dash_in_svg_fails(self):
        errors = run(extra={"assets/banner.svg": f"<svg><text>a {chr(0x2014)} b</text></svg>"})
        self.assertTrue(any("assets/banner.svg:1" in e for e in errors))

    def test_private_strings_fail(self):
        samples = ["C:" + "\\Users\\" + "someone", "/mnt" + "/project-files/x", "/Users" + "/someone/x",
                   "collection:" + "//53b79256-36af", "someone" + "@example.com"]
        for sample in samples:
            self.assertEqual(len(check_skill.line_problems(sample)), 1, sample)
        self.assertEqual(check_skill.line_problems("Co-Authored-By: Claude <noreply@anthropic.com>"), [])

    def test_broken_relative_link_fails(self):
        errors = run(extra={"README.md": "[rules](docs/none.md) and <img src=\"assets/none.svg\">"})
        self.assertEqual(sum("broken relative link" in e for e in errors), 2)

    def test_links_in_code_and_external_links_are_skipped(self):
        body = "`[x](nope.md)`\n\n```\n[y](nope.md)\n```\n\n[z](https://example.com) [top](#top) [ok](LICENSE)\n"
        self.assertEqual(run(extra={"README.md": body, "LICENSE": "text"}), [])

    def test_link_outside_the_repo_fails(self):
        errors = run(extra={"README.md": "[up](../../outside.md)"})
        self.assertTrue(any("broken relative link" in e for e in errors))


if __name__ == "__main__":
    unittest.main()
