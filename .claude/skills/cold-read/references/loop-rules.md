# cold-read loop rules, full text

The compact list in SKILL.md section 6a is binding; this file carries each rule with the failure that earned it.

Each rule names the failure that earned it.

- **One lens, one evaluator.** Two lenses in one brief is one evaluator, and
  the second brief loses. A merged panel passed a risk paper that a re-run with
  separated lenses failed on two blockers.
- **LITE fix ceiling.** If a LITE round returns more than three FAILs, or any
  FAIL whose fix is more than a one-line edit (one figure, date, name, label or
  sentence), lift to FULL from the fix pass on and say so in the report. A
  contract review once ran LITE, rewrote nine clauses in one pass, and shipped
  with no regression read.
- **Dates are figures.** The step 3a script computes every date, weekday,
  window, deadline and phrase like "the same weekend" with `datetime`.
- **The public record is the source.** A claim about the public record is
  checked against the publisher's own page, never a summary of it. A figure its
  publisher contradicts is a FAIL (a post once said 91 percent; the publisher
  said 43). No web access means the check is unchecked, and CLEAN is barred.
- **Regulatory status.** For every claim that something is licensed,
  regulated, approved, exempt or in force, name the level the source supports:
  entity, activity, instrument or token. A claim at a different level fails.
  Read for implicature: a regulator's name beside a product can assert a status
  no sentence states. Check on the regulator's own site whether the framework
  is in force, in consultation or superseded.
- **Sample, never hand-pick.** Consequential items (payment figures, trigger
  dates, parties, cross-references, quotes) get a census. For the rest, count,
  take every Nth by position for about ten items, and list what was not read.
- **Read the whole container** before an external send: comments, speaker
  notes, document properties, tracked changes, hidden text, hidden sheets and
  named ranges. Anything internal found there fails. A deck once shipped a
  colleague's request in its speaker notes.
- **Mechanism lens, when the artifact has economics.** Who profits from
  behaving badly, and how much. Stale or manipulated oracle, depeg, a 90
  percent drawdown, 10x and 0.1x the assumed volume, day one and the final day,
  a threshold exactly met, whether a cap limits a balance at rest or a flow,
  and what the counterparty does the day the incentive stops. A finding is a
  scenario with a loss, never a risk category.
- **An evaluator's finding is a claim, not a source.** Before any fact an
  evaluator supplied enters the artifact, open the primary source and quote it.
- **Round two is a regression read.** A fresh evaluator reads every changed
  section whole, plus the sources, without the finding list or the before
  text. The brief lens and any numeric script always rerun on the whole
  artifact. Fix passes have introduced errors only the blind round caught.
- **Divergence stop.** If round two raises at least as many new FAILs as round
  one did, stop: the brief or the source set is wrong, not the prose. Say which.
- **Checkpoint.** At 60 minutes from the first spawn or 1.2M evaluator output
  tokens, spawn nothing new, write what is open, and ask whether to continue
  with the cost stated. Unattended, the run ends as it stands and the report's
  first line says so.
- **A blocked post never stays queued.** If a scheduled post comes back
  BLOCKED, unschedule it, or open the Changed line with the unschedule ask.
  Advisory blocks once let two blocked posts publish on schedule.

