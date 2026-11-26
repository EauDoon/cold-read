# cold-read evals

Two layers. The static layer runs in CI: each case pins the sentences in the skill that its scenario depends on, and fails if one is removed or reworded. The live layer is run by hand: give the prompt to a fresh session with the skill installed and grade the reply against the pass and fail columns.

```bash
npm run evals   # every case against the skill text
npm test        # runner tests, removal tests, and the check script's unit tests
```

`evals/runner.test.mjs` removes each pinned sentence in turn and expects its case to fail, so a green suite cannot survive a deleted instruction. A static pass shows the instruction is still in the skill. It does not show that a model follows it; only a live run does.

## Behavior cases

| Case | Prompt | Passes if | Fails if |
|---|---|---|---|
| B1 | Here is the finished term sheet for the partner. Send it over to them. | The loop fires at FULL without asking permission, writes the rubric, and reports in four lines. | It sends the term sheet unread, asks whether to run a check, or runs silently. |
| B2 | Rough pass on this term sheet, quick and dirty, then I send it. | Runs LITE: one cold reader on the full rubric, one round. The effort label lowers the tier and never switches the loop off. | It skips the loop because the user asked for a rough pass, or runs FULL against the label. |
| B3 | Draft the term sheet for the new partner. | Runs FULL once the term sheet exists, because draft names the artifact and not the effort. | It reads draft as an effort label and runs LITE or nothing. |
| B4 | Check this board memo before I send it. | Writes three to six criteria before reading for defects. Each is binary, quotable, and checkable by someone who was not there. | A criterion is phrased as improve, strengthen, or make sure, or is scored out of ten, or the rubric is written after the findings. |
| B5 | Check this one-pager before it goes to the client. | Each evaluator prompt holds the artifact, the full rubric, and one named lens. It holds no trace of how the artifact was made and no framing of it as good. | An evaluator is told the drafting history, the author's intent, or that the draft is strong. |
| B6 | Check this fee schedule before it goes to the counterparty. An evaluator replies that it recomputed every total and they match. | The numeric criterion stays open until an evaluator returns a runnable script and the main thread runs it. A claimed recompute with no script is respawned once, then recorded as unchecked, which bars CLEAN. | It closes the numeric criterion on the evaluator's word. |
| B7 | Three evaluators read the deck. Two pass criterion 3. One fails it with a verbatim quote. | Criterion 3 fails. One quoted FAIL is a FAIL, and a PASS needs every evaluator. | It takes the majority and passes criterion 3. |
| B8 | Two revision rounds are done and one criterion still fails. The user is away. | It stops. It ships with the failure named or does not ship, and never runs round three. It logs one row in a store that outlives the session and reads it back. With no store, it skips the log and says so. | It runs a third round, or logs only to the session directory or the assistant's built-in memory. |
| B9 | Check this before I send it. Context: The file is an amendment to a signed lease that was already reviewed in full. | Runs LITE, one round, with the amendment checklist as the whole rubric. The same file with 'tear it apart' runs FULL. | The amendment runs FULL unasked. |
| B10 | Check this partner one-pager before it goes out. Context: The one-pager was built from a running ledger. One figure differs from the ledger, and a leaning is stated as agreed. | The rubric carries the source-of-record criterion. The run fails the figure that differs from the ledger and the leaning stated as agreed, each with a quote. If the ledger is confidential, the run asks first, and the log row says confidential output plus a topic with no figure, name or claim. | It checks the one-pager only against itself, or the log row leaks a confidential figure. |
| B11 | I changed two paragraphs in the memo you checked last week. Check it again before I send it. Context: The earlier run is logged, less than 14 days old, and the earlier version is retrievable. | Runs DELTA: the changed sections, every time-sensitive claim in the whole artifact, the brief lens on the whole artifact, and a full rerun of any numeric script. One round. The same request on a contract, after a BLOCKED verdict, or with more than a third of the artifact changed reruns at its normal tier. | It credits arithmetic from the earlier run, or runs DELTA on a contract. |
| B12 | Quick check on this contract before I sign. Context: The single cold reader returns five FAILs, one of which needs a clause rewritten. | The LITE round returns more than three FAILs, so the run lifts to FULL from the fix pass on and the report says so. | It rewrites many clauses in one LITE pass and ships with no regression read. |
| B13 | Round one fixes are in. Read it again. | Round two is a regression read by a fresh evaluator who does not get the finding list. The brief lens and any numeric script rerun on the whole artifact. If round two raises at least as many new FAILs as round one, the run stops and says whether the brief or the source set is wrong. | The same evaluator rereads with its own findings in hand, or the loop keeps iterating while new FAILs grow. |
| B14 | Is this invoice ready to send? Context: One numeric criterion could not be checked because no script ran. | The reply is the four-line report: tier, rounds, tokens, time and verdict; Changed; Your call; Not checked. An unchecked numeric criterion on paid-against arithmetic reads BLOCKED. | It reports a mood, omits what was not checked, or calls an unchecked invoice CLEAN. |
| B15 | Tear this proposal apart before it goes to the client. | FULL. One evaluator per lens, and the brief lens runs: its evaluator gets only the verbatim request and the artifact and answers the four questions. | Lenses are merged into one brief, or the brief lens is skipped. |
| B16 | Check this memo before I send it. Context: The agent cannot spawn subagents. | The cold reader is a fresh session or a different model. The protocol reads correctly with subagent replaced by either. | It reviews the memo in the context that wrote it and calls that a cold read. |

## Trigger cases

| Case | Prompt | Should fire | Why |
|---|---|---|---|
| T1 | check this deck before Thursday, it goes to the board | yes | A finished external deck is about to leave |
| T2 | what is the capital gains tax rate in Germany | no | A quick lookup is an anti-trigger |
| T3 | is this ready? it is the fee schedule for the partner | yes | Arithmetic someone is paid against |
| T4 | my landing page still looks generated, do another pass | no | Work still in flight belongs to gauntlet-verify |
| T5 | help me outline the investor memo | no | No artifact exists yet |
| T6 | post this tweet about my weekend | no | A social post is not an auto-fire class |
| T7 | schedule this post announcing the partnership figures and the launch date | yes | A post announcing figures, dates, or a partner commitment is class 3 and runs LITE |
| T8 | here are my internal notes and a forecast table from the planning call | no | Internal documents do not auto-fire |

## Grading a live run

1. Start a fresh session with only this skill installed, so a neighbour cannot take the request.
2. Paste the prompt, with the context line if the case has one.
3. Grade the reply against Passes if and Fails if. A reply that meets neither is a fail.
4. Record the model, the agent runtime, the date and the result. A result on one model does not carry to another.

## Adding a case

Add `evals/cases/<id>.json` with the fields the other cases use, pin at least one sentence from the skill in `checks`, and add its row to the tables above. `npm test` fails until the row exists and every pinned sentence is in the skill.
