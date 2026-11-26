<div align="center">

<img src="assets/banner.svg" alt="cold-read, a Claude skill: a blind pass on finished work before it leaves your hands. A document in a cold glass chamber is read by orbiting lenses, and one beam turns red on the flawed line." width="100%">

<h1>cold-read</h1>

<p><b>A Claude skill that reads finished work blind before it leaves your hands.</b></p>

<p>
<a href="https://github.com/EauDoon/cold-read/actions"><img src="https://img.shields.io/github/actions/workflow/status/EauDoon/cold-read/check.yml?branch=main" alt="build"></a>
<a href="https://github.com/EauDoon/cold-read/blob/main/LICENSE"><img src="https://img.shields.io/github/license/EauDoon/cold-read" alt="license"></a>
<a href="https://github.com/EauDoon/cold-read"><img src="https://img.shields.io/github/last-commit/EauDoon/cold-read" alt="last commit"></a>
</p>

<p>
<a href="https://eaudoon.github.io/cold-read/">3D explainer</a> ·
<a href="#quick-start">Quick&nbsp;start</a> ·
<a href="#when-it-fires">When&nbsp;it&nbsp;fires</a> ·
<a href="#the-loop">The&nbsp;loop</a> ·
<a href="#the-report">The&nbsp;report</a> ·
<a href="#what-it-costs">Cost</a> ·
<a href="#what-breaks-it">What&nbsp;breaks&nbsp;it</a> ·
<a href="#evals-and-checks">Evals</a>
</p>

</div>

The author of a draft is the worst reader of it. A context that wrote the work and then checks it inherits its own frame: it catches typos and misses the wrong premise, such as a page that breaks a limit the same author set three pages earlier. cold-read hands the finished artifact to readers that never saw it being made, one per lens, and blocks it on any single quoted failure.

It is the evaluator-optimizer loop with the evaluator made independent, plus the rules that keep it honest: the rubric is written before the draft, every FAIL carries a verbatim quote, numbers close only by a script the main thread runs, and the loop stops after two revision rounds.

## Quick start

It needs an agent that can run subagents or fresh sessions. A second model family as the reader is strongest.

```bash
git clone https://github.com/EauDoon/cold-read
```

For every project (personal skills):

```bash
mkdir -p ~/.claude/skills && cp -r cold-read/.claude/skills/cold-read ~/.claude/skills/
```

For one project:

```bash
mkdir -p your-project/.claude/skills && cp -r cold-read/.claude/skills/cold-read your-project/.claude/skills/
```

For the Claude apps, turn on code execution, build a zip with the skill folder at its root, and upload it under Customize > Skills. The apps trigger it from its description.

```bash
cd cold-read/.claude/skills && zip -r cold-read.zip cold-read
```

It fires on its own when a finished artifact is about to leave, or call it by name:

```
check this term sheet before I send it
```

```
/cold-read tear this deck apart, it goes to the board on Thursday
```

## When it fires

All three must hold. Two of three is a smell. One of three is a tax.

1. The work leaves the building: a third party will read it or act on it.
2. The pass bar can be stated before the draft exists.
3. Being wrong costs money, reputation or a decision.

Three classes fire without asking, because the class itself meets the gate: anything a lawyer will read (contract, term sheet, MOU, engagement letter, annex), arithmetic someone is paid against (invoice, reconciliation, revenue share, fee schedule), and external deliverables (a deck, memo or one-pager going outside, or a figure a counterparty will act on). Chat answers, internal notes and drafts still finding their shape never fire it.

| Tier | When | Readers |
|---|---|---|
| **LITE** | The default | One cold reader on the full rubric, one round |
| **FULL** | Someone signs it, pays against it, or acts on it in public with money or reputation at stake. Or "tear this apart" | One reader per lens, up to two revision rounds |
| **DELTA** | A bounded revision of work with a run logged in the last 14 days | The changed sections, every time-sensitive claim, the brief lens, and every numeric script rerun in full |

A contract or paid-against arithmetic never runs below LITE, whatever the label. "Draft the term sheet" runs FULL, because "draft" names the artifact, not the effort.

## The loop

```mermaid
flowchart LR
    R["Rubric first,<br/>3 to 6 binary criteria"] --> G["Generate"]
    G --> C["Cold readers,<br/>one per lens"]
    C --> Q{{"Any quoted<br/>FAIL?"}}
    Q -->|no, every reader passes| D(["Ship"])
    Q -->|yes| F["Fix the FAILs only"]
    F -->|round 2, fresh reader| C
    F -->|after round 2| S(["Ship with failures named,<br/>or do not ship"])
```

1. **Rubric first.** Three to six criteria, each binary, quotable, and checkable by someone who was not there. A criterion you cannot fail by pointing at text is a mood.
2. **Generate** normally, without writing for the evaluator.
3. **Cold read.** Each reader gets the artifact, the rubric and one named lens, and nothing about how the work was made. Lenses: evidence, internal consistency, mechanical style, the hostile reader, the brief, and names. The brief lens sees only the original request and the artifact, and catches the most expensive failure: perfect work that answers the wrong question.
4. **Asymmetric quorum.** One quoted FAIL is a FAIL. A PASS needs every reader. In the first proof run, the sharpest finding came from one reader of three.
5. **Revise the FAILs, and only the FAILs.** Anything else is a new draft and voids the round.
6. **Stop.** A fresh reader rereads once. The loop ends when every criterion passes, when round two flips nothing, or after two revision rounds. There is no round three.
7. **Log** one row per run in a store that outlives the session.

Numeric criteria never close by assertion. A reader returns a runnable script with the inputs hardcoded, the main thread runs it, and an unchecked number bars a clean verdict. The full loop rules, each with the failure that earned it, are in [references/loop-rules.md](.claude/skills/cold-read/references/loop-rules.md).

## The report

Four lines, every time it runs. It never runs silently and never asks permission first.

```
Cold read: FULL (contract), 2 rounds, ~400k tokens, 18 min. PASS WITH NOTES.
Changed: <every changed clause, figure or sentence on a contract or post; else up to five, then a count>
Your call: <open decisions with a recommendation>
Not checked: <each unchecked criterion and why>
```

Verdicts: **CLEAN** (nothing open, nothing unchecked), **PASS WITH NOTES** (no FAIL open, decisions or unchecked criteria listed), **BLOCKED** (a FAIL open, or an unchecked number on paid-against arithmetic).

## What it costs

Measured on logged runs, each in its own unit:

| Run | Readers and rounds | Spend |
|---|---|---|
| Proof run, long document, 06-08-2026 | 3 readers, 1 round | about 270k tokens, 7 minutes (unit not recorded) |
| Three-page static site, FULL, 28-10-2026 | 2 rounds | about 645k evaluator output tokens, 45 minutes |
| Same site, second log, 28-10-2026 | 4 readers by 2 rounds | about 1.93M subagent tokens, input and output |

Right for a contract or a board deck, absurd for a tweet. Scale readers to what being wrong costs, not to how much the work matters to its author. A run checkpoints at 60 minutes or 1.2M evaluator output tokens.

## What breaks it

- A rubric written after the draft. It rationalizes the draft.
- A reader that shares the author's context, or is told how the work was made or that it is good. That is self-review.
- Scores out of ten. They collapse to 7 and mean nothing; a criterion is PASS or FAIL.
- Majority vote. One quoted FAIL outvotes two passes, because a pass is what a reader returns when it did not look hard enough.
- Two lenses in one brief. That is one evaluator, and the second lens loses.
- A claimed recompute with no script. Numbers close only when the main thread runs the script itself.
- Fixing things nobody flagged. That is a new draft, and it voids the round.
- Handing the round-two reader the finding list. Round two is a regression read by a fresh reader.
- A summary of the public record. A public claim is checked against the publisher's own page.
- Reading only the visible page. Comments, speaker notes, tracked changes, hidden sheets and document properties go out with the file.
- Round three. If criteria still fail after two rounds, ship with the failures named, or do not ship.
- A log in the session directory or the assistant's memory. Neither is a record anyone can audit.

## Neighbours

| Skill | Owns | Split |
|---|---|---|
| [gauntlet-verify](https://github.com/EauDoon/gauntlet-verify) | Work in flight: a build held to a named reference, or research verified while it is drafted | In flight versus finished and shipping |
| Your prose style guide | The prose bar | It is the bar, cold-read runs the check |

Run one loop at a time: gauntlet-verify while the work is being made, cold-read once when it is finished and about to leave.

## Evals and checks

```bash
python3 scripts/check_skill.py   # frontmatter, references, loop rules, dashes, private strings, links
npm test                         # runner tests, removal tests, and the check script's unit tests
npm run evals                    # 24 cases against the skill text
```

The 24 cases in [evals/](evals/README.md) are 16 behavior cases and 8 trigger cases. Each one states a prompt, what passes and what fails, so a reviewer who was not there can grade a live run. Each one also pins the sentences in the skill that it depends on, and CI fails when a pinned sentence is removed or reworded. A static pass shows the instruction is still in the skill; whether a model follows it takes a live run.

All three commands run in CI on every push to `main` and every pull request. They need Python 3 and Node 18 or later, and no packages.

## Maintaining the skill

- Keep the description at 220 characters or fewer and lead with what the skill does, then the phrases that should fire it, then the one neighbour boundary. Skill listings have a character budget, and a skill that overflows it keeps only its name.
- A new rule goes in the compact list in SKILL.md section 6a and, with the failure that earned it, in `references/loop-rules.md`. The check script fails when the two lists differ.
- A new rule needs an eval case that pins it. Delete a criterion or rule that never fires across several logged runs.
- Dates are DD-MM-YYYY. No em or en dashes anywhere; the check script rejects them.

## Repo layout

<details>
<summary><b>Files and folders</b></summary>

<br>

```
.claude/skills/cold-read/
├── SKILL.md              # the skill
└── references/
    └── loop-rules.md     # each loop rule with the failure that earned it
.github/
├── ISSUE_TEMPLATE/       # bug report and feature request forms
├── PULL_REQUEST_TEMPLATE.md
└── workflows/check.yml   # check script, unit tests, and evals on main and pull requests
evals/
├── README.md             # every case, with how to grade a live run
├── cases/                # B1 to B16 behavior and T1 to T8 trigger cases as JSON
├── runner.mjs            # npm run evals: checks each case's pinned sentences
└── runner.test.mjs       # runner tests and the removal test for every case
scripts/
├── check_skill.py        # frontmatter, references, loop rules, dashes, private strings, links
└── test_check_skill.py   # unit tests for check_skill.py
docs/                     # the 3D explainer page (three.js bundled, no CDN)
assets/banner.svg
CHANGELOG.md
LICENSE                   # CC BY 4.0
README.md
SECURITY.md               # how to report a flaw
package.json              # npm test and npm run evals
```

</details>

To view the explainer from a checkout, serve `docs/` with any static server, for example `python3 -m http.server -d docs`.

## Credit

The loop is the evaluator-optimizer workflow from [Anthropic's "Building effective agents"](https://www.anthropic.com/engineering/building-effective-agents), with the evaluator moved to a context that never saw the work being made. The repository layout and the eval harness follow [gauntlet-verify](https://github.com/EauDoon/gauntlet-verify).

## License

[CC BY 4.0](LICENSE). The explainer page bundles [three.js](https://threejs.org) under its MIT license, in `docs/vendor/`.
