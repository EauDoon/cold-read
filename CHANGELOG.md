# Changelog

## Unreleased

Fixed

* Explainer page: the five lens rows stayed dimmed, and on a narrow screen their descriptions stayed hidden, when WebGL or JavaScript was not available. Only the 3D scene script lights a row, so the rows now dim only once that script runs.
* Explainer page: the install snippet ran `cp -r` into `~/.claude/skills/` without creating it, which fails on a machine with no skills folder. It now runs `mkdir -p` first, as the README does.
* Explainer page: the DELTA tier said only the change is read again. It now names what SKILL.md reruns: the change, time-sensitive claims, the brief lens and every numeric script.
* `scripts/check_skill.py` reported a package version such as `serve@14.2.4` as an email address. An address followed by an underscore or a hyphen, as in Markdown emphasis, is still reported. A prerelease version such as `pkg@1.0.0-rc.next-1` is not reported either. The cost: an address at a host that opens with two numeric labels is not reported.
* `scripts/check_skill.py` missed an em or en dash written as a script, JSON or CSS escape. A backslash before a year in a path, such as `\2013\`, is not a dash. A CSS escape reads the same as a year folder in a Windows path, so it is reported only where CSS ends it: at the end of the line, before a space, a quote, `;`, `<`, `)`, before sentence punctuation that ends the string, or before another escape that a path does not hold: a no-break space (`\a0`) or a code padded to four digits (`\00a0`). Escapes of the U+2000 block may come between. A year folder before a month folder (`reports\2014\03\`, `reports\2014\12`) is not a dash. A CSS dash escape directly before a letter or a hyphen is not reported, because it reads the same as a path such as `logs\2014-01`.
* `npm run evals` stopped with a stack trace and no file name when a case file was not valid JSON, or when a case named a reference file such as `constructor`. Both now print a FAIL line for that case.

Added

* A skip link on the explainer page, so a keyboard user can pass the header.
* `evals/page.test.mjs`: static tests for the explainer page that run in `npm test`. They cover the fixes above and check that every module the page imports is in `docs/`.

## 1.1.0, 26-11-2026

Brings the repository to the standard of its sibling, gauntlet-verify.

Added

* A runnable eval suite: 16 behavior cases and 8 trigger cases as JSON in `evals/cases/`, each pinning the sentences in the skill it depends on. `npm run evals` runs them, and `npm test` removes each pinned sentence in turn and expects its case to fail. The suite now has a DELTA case (B11), which 1.0.0 listed as open.
* `scripts/check_skill.py` now also checks that the loop rules in SKILL.md section 6a and in `references/loop-rules.md` are the same list, that every relative link and image resolves, that SVG files carry no dashes, and that dashes written as HTML entities are caught. It has unit tests.
* CI runs the check script, the tests and the evals on every push to `main` and every pull request.
* Issue and pull request templates.
* README sections: what breaks it, evals and checks, maintaining the skill, repo layout, credit.
* Share-preview tags, a share image and an icon on the explainer page.
* The skill attached to the release as `cold-read.zip` for the Claude apps.

Changed

* SKILL.md step 4: "A single evaluator is not enough" now reads "On a FULL pass a single evaluator is not enough". LITE runs one cold reader by design, and the two sentences contradicted each other.
* The README, the banner, the explainer page and its share image call this an LLM skill, not a Claude skill, and the Quick start names Claude Code and the Claude apps as one runtime among several, with a line for any other agent.
* `evals/evals.md` is replaced by `evals/README.md` and the case files. The ten original cases are all carried over.

## 1.0.0, 26-11-2026

First public release.

* The skill as used since 06-08-2026: the three-part gate, three auto-fire classes, LITE, FULL and DELTA tiers, one evaluator per lens, the deterministic numeric close, the asymmetric quorum, a two-round cap, and a four-line report.
* Prepared for publication: references to a private workspace, private neighbour skills, a private run log and its storage location were replaced with neutral wording. The protocol, the loop rules and the evals are otherwise unchanged.
* Added: README, a 3D explainer page in `docs/`, `scripts/check_skill.py`, and a CI workflow that runs it.
