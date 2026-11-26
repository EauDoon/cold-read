#!/usr/bin/env node
// Run every case in evals/cases/*.json against the skill text.
// Each case states a scenario a person can run live in a fresh session, and
// pins the SKILL.md sentences that scenario depends on. If a pinned sentence
// is removed or reworded, the case fails. Exit 0 only if every case passes.
// No dependencies: Node 18 or later.

import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = resolve(fileURLToPath(new URL(".", import.meta.url)));
const REPO = resolve(HERE, "..");
const SKILL_DIR = join(REPO, ".claude", "skills", "cold-read");
const CASES_DIR = join(REPO, "evals", "cases");

const CASE_KINDS = new Set(["behavior", "trigger"]);
const CHECK_TYPES = new Set(["skill_contains_all", "skill_description_contains", "reference_contains_all"]);
const SHOULD_FIRE = [true, false];

// Prose in the skill is hard-wrapped, so a pinned sentence can span lines.
export function normalize(text) {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

export function skillFromText(text, references = {}) {
  const m = /^---\r?\n(.*?)\r?\n---\r?\n/s.exec(text);
  if (!m) throw new Error("SKILL.md frontmatter not found");
  const d = /^description:\s*'(.*)'\s*$/m.exec(m[1]);
  if (!d) throw new Error("SKILL.md description must be one single-quoted line");
  const refs = {};
  for (const [name, body] of Object.entries(references)) refs[name] = normalize(body);
  return {
    description: normalize(d[1].replace(/''/g, "'")),
    body: normalize(text.slice(m[0].length)),
    references: refs,
  };
}

export function loadSkill() {
  const references = {};
  const refDir = join(SKILL_DIR, "references");
  for (const f of readdirSync(refDir).filter((f) => f.endsWith(".md"))) {
    references[`references/${f}`] = readFileSync(join(refDir, f), "utf8");
  }
  return skillFromText(readFileSync(join(SKILL_DIR, "SKILL.md"), "utf8"), references);
}

export function loadCases(dir = CASES_DIR) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
    .map((f) => ({ file: f, data: JSON.parse(readFileSync(join(dir, f), "utf8")) }));
}

const isText = (v) => typeof v === "string" && v.trim() !== "";

// A case that checks nothing must not report PASS. Return every reason the
// case cannot be run as written; an empty list means it is well formed.
export function validateCase(data) {
  if (data === null || typeof data !== "object" || Array.isArray(data)) return ["case is not a JSON object"];
  const problems = [];
  if (!isText(data.id)) problems.push("id must be a non-empty string");
  if (!CASE_KINDS.has(data.kind)) problems.push(`kind must be behavior or trigger, got ${JSON.stringify(data.kind)}`);
  if (!isText(data.prompt)) problems.push("prompt must be a non-empty string");
  if (data.kind === "behavior") {
    for (const field of ["passes_if", "fails_if"]) {
      if (!isText(data[field])) problems.push(`${field} must be a non-empty string`);
    }
  }
  if (data.kind === "trigger") {
    if (!SHOULD_FIRE.includes(data.should_fire)) problems.push("should_fire must be true or false");
    if (!isText(data.why)) problems.push("why must be a non-empty string");
  }
  if (!Array.isArray(data.checks) || data.checks.length === 0) {
    problems.push("checks must be a non-empty array");
    return problems;
  }
  data.checks.forEach((check, i) => {
    if (!check || !CHECK_TYPES.has(check.type)) {
      problems.push(`checks[${i}]: unknown type ${JSON.stringify(check && check.type)}`);
      return;
    }
    if (!Array.isArray(check.phrases) || check.phrases.length === 0 || !check.phrases.every(isText)) {
      problems.push(`checks[${i}]: phrases must be a non-empty array of non-empty strings`);
    }
    if (check.type === "reference_contains_all" && !isText(check.file)) {
      problems.push(`checks[${i}]: reference_contains_all needs a file`);
    }
  });
  return problems;
}

export function runCase(data, skill) {
  const problems = validateCase(data);
  if (problems.length) return { ok: false, problems };
  for (const check of data.checks) {
    let haystack;
    let where;
    if (check.type === "skill_contains_all") {
      haystack = skill.body;
      where = "SKILL.md";
    } else if (check.type === "skill_description_contains") {
      haystack = skill.description;
      where = "the description";
    } else {
      haystack = skill.references[check.file];
      where = check.file;
      if (haystack === undefined) {
        problems.push(`${check.file} does not exist in the skill folder`);
        continue;
      }
    }
    for (const phrase of check.phrases) {
      if (!haystack.includes(normalize(phrase))) problems.push(`${where} no longer says: ${phrase}`);
    }
  }
  return { ok: problems.length === 0, problems };
}

export function main() {
  const skill = loadSkill();
  const cases = loadCases();
  let failed = 0;
  const seen = new Set();
  for (const { file, data } of cases) {
    const result = runCase(data, skill);
    if (data && seen.has(data.id)) {
      result.ok = false;
      result.problems.push(`duplicate id ${data.id}`);
    }
    if (data) seen.add(data.id);
    if (data && `${data.id}.json` !== file) {
      result.ok = false;
      result.problems.push(`file name ${file} does not match id ${data.id}`);
    }
    const label = `${data && data.id ? data.id : file} ${data && data.kind ? data.kind : "?"} ${String((data && data.prompt) || "").slice(0, 60)}`;
    if (result.ok) {
      console.log(`PASS ${label}`);
    } else {
      failed += 1;
      console.log(`FAIL ${label}`);
      for (const p of result.problems) console.log(`     ${p}`);
    }
  }
  console.log(`\n${cases.length - failed} passed, ${failed} failed`);
  if (cases.length === 0) {
    console.log("no cases found");
    return 1;
  }
  return failed ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
