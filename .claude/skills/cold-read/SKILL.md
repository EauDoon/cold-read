---
name: "cold-read"
description: 'Blind pass on outgoing work: contracts, term sheets, fee schedules, external decks, memos. Use on is this ready, check this before I send it. WIP builds: gauntlet-verify.'
---

# Cold Read

The evaluator-optimizer loop, built so the evaluator is actually independent. `gauntlet-verify` owns work still in flight; this skill owns the finished artifact before it leaves.

## Why isolation is the whole thing

One call generates, another evaluates. If both run in the same context, the
evaluator inherits the generator's frame and its commitment to what it just
wrote. That is self-review, which catches mechanics and misses the wrong premise.
The failure it cannot see is the artifact contradicting a boundary the same
author set three pages earlier, because to that author both felt true when
written. On 02-08-2026 an adversarial pass caught exactly this in a model
benchmarking skill, which declared a noise floor in one section and violated it
in another.

A cold reader is any context that never saw the making: a subagent, a fresh
session, or a different model. Different model is strongest and cheapest when
generation ran on a workhorse seat, since only the critique pays frontier prices.

## The gate

Run the loop when all three hold.

1. An artifact leaves the building. Something a third party will read or act on.
2. The pass bar is statable before generating. If the bar can only be described
   after seeing the draft, there is no rubric, only taste.
3. Being wrong costs money, reputation, or a decision.

Two of three is a smell. One of three is a tax.

### Auto-fire classes

Three artifact classes fire the loop without asking. Each leaves the user's
hands. For these the gate is presumed met by the class itself, and the rubric
comes largely off the shelf from the user's standing rules.

1. A contract, term sheet, MOU, engagement letter, or annex. Anything a lawyer
   will read.
2. Arithmetic someone is paid against: invoice, reconciliation, revenue share,
   fee schedule, sensitivity table.
3. An external deliverable: a deck, memo, or one-pager going outside, a
   figure a counterparty will act on, a commitment made on the strength of the
   work.

Internal documents, notes and forecast tables that stay inside do not
auto-fire. The user can still ask for a read on any of them.

A social post is not on this list. The user's posting workflow and its
fact-check pass own posts, except a post announcing figures, dates, or a partner
commitment, which is class 3 and runs LITE.

### Tiers: the stakes test picks the tier; an effort label never switches it off

LITE is the default: one cold reader on the full rubric, one round, fixes
applied, one line back. FULL, one evaluator per routed lens and up to two
revision rounds, runs when the stakes test passes: someone signs it (contract,
term sheet, MOU, engagement letter), someone pays against it (invoice, fee
schedule, revenue share, reconciliation), or a counterparty or the public will
act on a figure or commitment in it with money or reputation riding on it.
Read what a label is attached to:

| The user said | Tier |
|---|---|
| "quick and dirty", "rough pass", "back of envelope", "just want the shape" | LITE |
| "draft the term sheet", "first draft of the MOU" | FULL. "Draft" is the noun for the artifact, not an effort label |
| "tear this apart", "red team this", "check this hard" | FULL, overrides any label and beats DELTA |
| A bounded revision of an artifact with a logged run in the last 14 days | DELTA, unless the DELTA rule below forbids it |
| An amendment to a contract that was already reviewed in full | LITE, one round, the amendment checklist as the whole rubric, because the substance was reviewed before the edit. FULL only on the user's ask |

**DELTA** checks the change and credits the logged run for the rest. It applies
when the earlier version has a run logged per step 7 in the last 14 days and is retrievable,
and the change is bounded: the user's edits, a section added, figures refreshed. Diff
the two, route the evaluators on the changed sections only, plus every
time-sensitive claim in the whole artifact, plus the brief lens on the whole
artifact, plus a full rerun of any numeric script (arithmetic is never
credited). One round, one-line fixes only. DELTA is never available for a
contract, a term sheet or paid-against arithmetic, never after a BLOCKED
verdict, never on a FULL phrase, and never when the diff touches more than a
third of the paragraphs, rows or slides; those rerun at their normal tier.

A contract or paid-against arithmetic never goes below LITE, whatever the user
called it.

No artifact, no loop. A conversation, an outline, or an exploration is not
checkable; build first.

Tell the user it ran, in the four-line report shape at the end of section 6a.
Never run it silently and never ask permission first.

Anti-triggers, so this skill stays expensive to fire: chat answers, internal
notes, quick lookups, exploratory research where the fix is more searching, and
any draft still finding its shape.

## Protocol

Copy this checklist and tick it off as you go:
- [ ] 1. Write the rubric first
- [ ] 2. Generate
- [ ] 3. Cold read, one evaluator per lens
- [ ] 4. Asymmetric quorum
- [ ] 5. Revise the FAILs only
- [ ] 6. Second round, then stop
- [ ] 7. Log where it survives

### 1. Write the rubric first

Before generating. A rubric written after the draft rationalizes the draft.

Three to six criteria. Each one must be:

- Binary. PASS or FAIL. No scores out of ten, which collapse to 7 and mean
  nothing.
- Quotable. Failing it produces a verbatim quote from the artifact. A criterion
  that cannot be failed by pointing at text is a mood.
- Checkable by someone who was not there. If resolving it needs the reasoning
  trace, the cold reader cannot run it.

Pull criteria from the user's standing rules rather than reinventing them: the
prose style guide (including names and counterparty rules), the rules for
stating claims and their certainty, the verify and labelling rules, the chart
standard, and the domain checklist for the substance.

**Built from a source of record.** When the artifact draws on a running record
(a ledger, a tracker, a log of rulings), add one criterion: every figure matches
the record, and nothing the record holds as a leaning or an open item is stated
as decided. If that record is confidential, ask the user first, before step 1,
whether the run may name it in the log; that is the one exception to never
asking permission first.

### 2. Generate

Normally. Do not think about the rubric while drafting; anticipating the
evaluator is how the loop degrades back into self-review.

### 3. Cold read

Spawn one evaluator per routed lens, usually 2 to 5, in parallel. Each gets, and only gets:

- The artifact, ideally by path or by reading it from source itself, so no part
  of the making leaks in.
- The full rubric.
- One assigned lens, named. Every evaluator reports on all criteria but owns two.

Lens diversity beats evaluator count. Three readers with the same lens vote on
the same blind spot. Standard lenses: evidence and citation binding, internal
consistency and self-contradiction, falsifiability and mechanical style, does the
argument survive a hostile reader, the brief, and names and attribution.

**The brief lens** is the cheapest and catches the most expensive failure: a
document that is internally perfect and answers the wrong question passes every
other lens. Its evaluator gets the user's verbatim request and the artifact,
nothing else, and answers four questions: what was asked for that is absent, what
is present that was not asked for and whether it earns its place, where an
ambiguous instruction was resolved one way without saying so, and what is the
first missing thing the user would ask for ten minutes before sending. Run it on
every FULL pass.

**The evidence lens checks assertion status**, not just existence: each claim's
stated certainty against the source's own status. Contested or settled, current
or superseded, agreed or proposed, hard date or target. A claim stated more
settled than its source is a FAIL with both quotes. True facts at the wrong
status are the finding class blind numeric checks miss.

**The names lens** applies the style guide's attribution rule: classify every
personal name by position. Title block, verdict, or a recommendation-carrying
sentence is a FAIL with the quote; argument prose is a FAIL; an Owner column or
dated source cell passes. The sweep is mechanical, grep with word boundaries,
because a bare search for Mark matches Market.

Every evaluator prompt carries these instructions verbatim:

- Default to FAIL when uncertain. A rubric that never fails anything is
  worthless.
- Quote verbatim. A violation you cannot quote does not exist, so drop it.
- Do not praise, do not summarize, no preamble.
- Do not soften a FAIL because the surrounding writing is good.
- Check mechanical criteria mechanically. Scan, do not assume.

Return format, fixed: per criterion, VERDICT, EVIDENCE quoted, and one FIX that a
writer could execute in a single edit. Then TOTAL FAILS. An evaluator returning
more than five FAILs against one criterion groups them by root cause, instances
listed; a flood buries the two findings that matter.

### 3a. Numeric criteria close deterministically

An evaluator never closes a numeric criterion by assertion. It returns a
complete runnable script, inputs hardcoded at the top as named variables,
recomputing every output figure from the stated inputs and method without
reading the artifact's own formulas first. The main thread executes the script
and uses its real output; a claimed recompute is the same self-assertion this
loop exists to distrust. No script, or a script that does not run: respawn once,
then record the criterion as unchecked, and an unchecked criterion bars a clean
verdict. A difference of any size fails until explained, and rounding is shown
to be rounding, with the step, direction, and maximum error, never assumed.

### 4. Asymmetric quorum

Not majority vote. The two directions are not symmetric.

- Any single quoted FAIL is a FAIL. The quote makes it checkable in seconds, so a
  false positive is cheap to reject by hand.
- PASS requires every evaluator to pass it. One reader's PASS is weak evidence,
  because passing is what an evaluator does when it did not look hard enough.

Expect singleton catches. In the 06-08-2026 proof run the sharpest finding came
from one reader of three, and one reader passed a criterion the other two failed
with a quote. A single evaluator is not enough.

### 5. Revise

Fix the FAILs. Only the FAILs. Do not improve things nobody flagged; that is a
new draft, and it invalidates the round.

### 6. Second round, then stop

Re-read once: go back to step 3 with a fresh evaluator. Stop at whichever comes first:

- All criteria PASS by quorum.
- Round two flips no criterion. A round that changes nothing means iteration is
  exhausted, not that another round will help.
- Two revision rounds are done. Hard cap. The cost of this loop compounds, and a
  stopping condition is the only guardrail against it.

If criteria are still failing at the cap, ship with the failures named, or do not
ship. Do not run round three.

### 6a. Loop rules

Full text, with the failure that earned each rule, in references/loop-rules.md.

- **One lens, one evaluator.** Never merge two lenses into one brief.
- **LITE fix ceiling.** More than three FAILs, or any fix bigger than a one-line edit, lifts the run to FULL from the fix pass on; say so in the report.
- **Dates are figures.** The step 3a script computes every date, weekday, window and deadline with `datetime`.
- **The public record is the source.** Check a public-record claim against the publisher's own page. No web access means unchecked, and CLEAN is barred.
- **Regulatory status.** Name the level the source supports (entity, activity, instrument or token), read for implicature, and check on the regulator's own site whether the framework is in force.
- **Sample, never hand-pick.** Census the consequential items; take every Nth of the rest and list what was not read.
- **Read the whole container** before an external send: comments, speaker notes, properties, tracked changes, hidden text, sheets and names.
- **Mechanism lens** when the artifact has economics: who profits from behaving badly, stated as a scenario with a loss.
- **An evaluator's finding is a claim, not a source.** Quote the primary before a supplied fact enters the artifact.
- **Round two is a regression read** by a fresh evaluator, without the finding list; the brief lens and any numeric script rerun on the whole artifact.
- **Divergence stop.** If round two raises at least as many new FAILs as round one, stop and say whether the brief or the source set is wrong.
- **Checkpoint** at 60 minutes from the first spawn or 1.2M evaluator output tokens: spawn nothing new and ask, with the cost stated. Unattended, end as it stands and say so first.
- **A blocked post never stays queued.** Unschedule a BLOCKED scheduled post, or open the Changed line with the unschedule ask.

Verdicts: **CLEAN** (nothing open, nothing unchecked), **PASS WITH NOTES** (no
FAIL open, decisions or unchecked criteria listed), **BLOCKED** (a FAIL open, or
an unchecked numeric criterion on paid-against arithmetic). Report in four lines:

```
Cold read: FULL (contract), 2 rounds, ~400k tokens, 18 min. PASS WITH NOTES.
Changed: <every changed clause, figure or sentence on a contract or post; else up to five, then a count>
Your call: <open decisions with a recommendation; repeats marked "open since DD Mon YYYY, reported N times">
Not checked: <each unchecked criterion and why>
```

### 7. Log where it survives

One row per run in a store that outlives the session: a database, a file in a
shared folder, or a repository. A log written to the session working directory
is discarded with the container, and a log written to the assistant's built-in
memory is not a record anyone can audit. Fields: Artifact (short name), Date,
Skill `cold-read`, Tier or mode (LITE, FULL or DELTA), Criteria failed (or
none), Fix held (yes, no or n/a), Rounds, Tokens, Verdict, Surface (where the
run happened), and Where (project and thread, or session title). Read the row
back, and never edit an earlier row; a correction is a new row that names the
row it corrects. For a plain file, one line per run:
`DD-MM-YYYY | cold-read | tier | artifact | criteria failed, or none | fix held: yes, no or n/a | rounds | tokens | verdict`.
If no store is reachable, skip the log and say so in the report. Criteria that
never fire across several runs get deleted. A rubric nobody can fail is theatre.

An artifact built from a confidential record: its row names it "confidential
output" plus a topic, with no figure, name or claim in any field.

## Boundaries

| Neighbour | Owns | Split |
|---|---|---|
| Analysis rules used while drafting | The analytical discipline while drafting | In-context versus blind and after. Both run, neither replaces the other |
| [gauntlet-verify](https://github.com/EauDoon/gauntlet-verify) | Work still in progress: a named reference bar, or isolated fact checks while research is drafted | In flight versus finished and shipping |
| The prose style guide | The prose bar itself, names and counterparty rules included | It is the bar, this runs the check |
| A strategy or backtest audit | Killing edge claims and backtests | Domain evaluator for one artifact class. When the artifact is a backtest, this skill loads that one as the lens |
| The skill standard | The standard for skills, eval at birth | It writes the eval, this runs a rubric loop on any artifact including skills |

## Cost

3 evaluators on a long document ran roughly 270k tokens and 7 minutes in the
06-08-2026 proof run: right for a contract or a board deck, absurd for a tweet.
Two logged FULL runs on a three-page static site, 28-10-2026, each in its own unit:
about 645k evaluator output tokens and 45 minutes for 2 rounds, and about 1.93M
subagent tokens (input and output) for 4 readers by 2 rounds. Both ended PASS
WITH NOTES. The proof run's unit is not recorded, so do not compare the three.
Scale evaluator count to what being wrong costs, not to how much the artifact
matters to its author.

Pairs with a prose style guide for the bar, the analysis rules while drafting,
`gauntlet-verify` for work still in flight, and a backtest audit when the
artifact is a backtest.
