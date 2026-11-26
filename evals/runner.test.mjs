// Tests for the eval runner, the case files, and the README index.
// Every case must fail when any sentence it pins is taken out of the skill,
// so a green suite cannot survive a deleted instruction.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadCases, loadSkill, normalize, runCase, skillFromText, validateCase } from "./runner.mjs";

const SKILL = loadSkill();
const CASES = loadCases();
const README = readFileSync(fileURLToPath(new URL("./README.md", import.meta.url)), "utf8");

test("the suite has behavior and trigger cases", () => {
  assert.ok(CASES.filter(({ data }) => data.kind === "behavior").length >= 10);
  assert.ok(CASES.filter(({ data }) => data.kind === "trigger").length >= 6);
});

test("trigger cases cover both fire and no-fire", () => {
  const triggers = CASES.filter(({ data }) => data.kind === "trigger").map(({ data }) => data.should_fire);
  assert.ok(triggers.includes(true));
  assert.ok(triggers.includes(false));
});

for (const { file, data } of CASES) {
  test(`${data.id} is well formed, named after its id, and passes`, () => {
    assert.deepEqual(validateCase(data), []);
    assert.equal(file, `${data.id}.json`);
    const result = runCase(data, SKILL);
    assert.deepEqual(result.problems, []);
  });

  test(`${data.id} fails when any pinned sentence is removed`, () => {
    for (const check of data.checks) {
      for (const phrase of check.phrases) {
        const needle = normalize(phrase);
        const mutated = {
          description: SKILL.description.split(needle).join(""),
          body: SKILL.body.split(needle).join(""),
          references: Object.fromEntries(
            Object.entries(SKILL.references).map(([k, v]) => [k, v.split(needle).join("")]),
          ),
        };
        assert.equal(runCase(data, mutated).ok, false, `removing "${phrase}" did not fail ${data.id}`);
      }
    }
  });

  test(`${data.id} is listed in evals/README.md`, () => {
    assert.match(README, new RegExp(`^\\| ${data.id} \\|`, "m"));
  });
}

test("evals/README.md lists no case that does not exist", () => {
  const ids = new Set(CASES.map(({ data }) => data.id));
  for (const m of README.matchAll(/^\| ([BT]\d+) \|/gm)) assert.ok(ids.has(m[1]), `${m[1]} has no case file`);
});

test("every case file is JSON with a unique id", () => {
  const files = readdirSync(fileURLToPath(new URL("./cases/", import.meta.url)));
  assert.equal(files.filter((f) => f.endsWith(".json")).length, CASES.length);
  assert.equal(new Set(CASES.map(({ data }) => data.id)).size, CASES.length);
});

test("a case with no checks is rejected, not passed", () => {
  const empty = { id: "Z1", kind: "trigger", prompt: "x", should_fire: true, why: "y", checks: [] };
  assert.equal(runCase(empty, SKILL).ok, false);
});

test("an unknown check type is rejected", () => {
  const bad = { id: "Z2", kind: "trigger", prompt: "x", should_fire: true, why: "y", checks: [{ type: "nope", phrases: ["a"] }] };
  assert.equal(runCase(bad, SKILL).ok, false);
});

test("a behavior case needs passes_if and fails_if", () => {
  const bad = { id: "Z3", kind: "behavior", prompt: "x", checks: [{ type: "skill_contains_all", phrases: ["the gate"] }] };
  assert.equal(validateCase(bad).length, 2);
});

test("a check against a missing reference file fails", () => {
  const bad = {
    id: "Z4", kind: "behavior", prompt: "x", passes_if: "a", fails_if: "b",
    checks: [{ type: "reference_contains_all", file: "references/none.md", phrases: ["a"] }],
  };
  assert.equal(runCase(bad, SKILL).ok, false);
});

test("phrases match across hard-wrapped lines and ignore case", () => {
  const skill = skillFromText("---\nname: \"x\"\ndescription: 'A blind pass.'\n---\nOne quoted\n   FAIL is a fail.\n");
  const data = { id: "Z5", kind: "trigger", prompt: "x", should_fire: true, why: "y", checks: [{ type: "skill_contains_all", phrases: ["one quoted fail is a FAIL"] }] };
  assert.equal(runCase(data, skill).ok, true);
});

test("description checks read the description, not the body", () => {
  const skill = skillFromText("---\nname: \"x\"\ndescription: 'A blind pass.'\n---\nterm sheets\n");
  const data = { id: "Z6", kind: "trigger", prompt: "x", should_fire: true, why: "y", checks: [{ type: "skill_description_contains", phrases: ["term sheets"] }] };
  assert.equal(runCase(data, skill).ok, false);
});
