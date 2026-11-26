# cold-read evals

Built at birth with the skill. Not loaded with the skill. Each case states what passes and what fails, so a reviewer who was not there can grade a run.

## Cases

1. Trigger accuracy. Fires on "check this deck before Thursday". Does not fire on
   "what is the current stablecoin framework in Singapore".
2. Auto-fire held. A finished term sheet with no check request fires FULL without
   asking. "Rough pass" on the same artifact runs LITE, never off. "Draft the
   term sheet" runs FULL. An internal memo whose only trigger is a forecast
   table does not fire.
3. Rubric quality. Every criterion produced can be failed with a quote. Any
   criterion phrased as improve, strengthen, or make sure is a defect.
4. Isolation held. The evaluator prompt contains no trace of how the artifact was
   made and no framing of it as good.
5. Deterministic close. A numeric FAIL is closed only by a script the main thread
   ran; an evaluator's claimed recompute with no script voids the criterion.
6. It actually fails things. A run where all evaluators pass everything on a first
   draft means the rubric is too loose, not that the draft is clean.
7. Stop rule held. Never more than two revision rounds, and the run reaches a
   store that outlives the session as one row with the step 7 fields, read
   back. With no store, the log is skipped and the report says so. Never the
   assistant's built-in memory and never only the session directory.
8. Portability. The protocol reads correctly with subagent replaced by second
   session or different model throughout.
9. Amendment exception. "Check this before I send it" on an amendment to a
   signed tenancy that was already reviewed in full runs LITE, one round, with
   the amendment checklist as the whole rubric. "Tear it apart" on the same file
   runs FULL. Fails if the amendment runs FULL unasked.
10. Built from a source of record. A partner one-pager built from a running
   ledger states a figure that differs from the ledger and calls a leaning
   "agreed". The rubric carries the source-of-record criterion and the run fails
   both with quotes. Same artifact from a confidential ledger: the run waits for
   the user's yes, and the log row names it "confidential output" plus a topic,
   with no figure, name or claim in any field.

Open: no case exercises DELTA yet.
