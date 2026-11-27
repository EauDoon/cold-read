// Static tests for the explainer page in docs/. They read the file as text,
// so they run in CI with no browser.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DOCS = fileURLToPath(new URL("../docs/", import.meta.url));
const PAGE = readFileSync(`${DOCS}index.html`, "utf8");
const STYLE = /<style>(.*?)<\/style>/s.exec(PAGE)[1].replace(/\/\*.*?\*\//gs, "");

// Selectors of every CSS rule whose declarations match, media queries included.
function selectorsWhere(declaration) {
  const found = [];
  for (const m of STYLE.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (declaration.test(m[2]) && /\.lenses li/.test(m[1])) found.push(m[1].trim());
  }
  return found;
}

test("the lens list is dimmed or collapsed only when the 3D scene runs", () => {
  // Only the scene script adds .on to a lens row. Without WebGL or without
  // JavaScript the rows must stay readable, so every rule that dims or hides
  // them has to sit under .has-gl, which the script sets once it has a renderer.
  const dimmed = selectorsWhere(/opacity:\s*0?\.\d/);
  const hidden = selectorsWhere(/display:\s*none/);
  assert.ok(dimmed.length > 0 && hidden.length > 0, "the dim and hide rules were not found");
  for (const selector of [...dimmed, ...hidden]) {
    assert.match(selector, /^\.has-gl /, `"${selector}" applies when the scene is not running`);
  }
});

test("the install snippet creates the skills folder before copying into it", () => {
  const snippet = /<pre class="install"><code>(.*?)<\/code>/s.exec(PAGE)[1];
  const lines = snippet.split("\n");
  const copy = lines.findIndex((l) => l.includes("cp -r") && l.includes("~/.claude/skills/"));
  const make = lines.findIndex((l) => l.includes("mkdir -p ~/.claude/skills"));
  assert.ok(copy >= 0, "the copy command is missing");
  assert.ok(make >= 0 && make <= copy, "cp -r fails when ~/.claude/skills does not exist");
});

test("every local module the page imports is in docs/", () => {
  const map = JSON.parse(/<script type="importmap">(.*?)<\/script>/s.exec(PAGE)[1]).imports;
  const script = /<script type="module">(.*?)<\/script>/s.exec(PAGE)[1];
  const specifiers = [...script.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
  assert.ok(specifiers.length > 0);
  for (const spec of specifiers) {
    const prefix = Object.keys(map).filter((k) => spec === k || (k.endsWith("/") && spec.startsWith(k))).sort((a, b) => b.length - a.length)[0];
    const path = prefix ? map[prefix] + spec.slice(prefix.length) : spec;
    assert.ok(path.startsWith("./"), `${spec} does not resolve to a local file`);
    assert.ok(existsSync(DOCS + path.slice(2)), `${spec} resolves to ${path}, which is missing`);
  }
});

test("the page has a skip link to its main content as the first focusable element", () => {
  const firstLink = /<a\b[^>]*>/.exec(PAGE.slice(PAGE.indexOf("<body>")))[0];
  assert.match(firstLink, /class="skip"/);
  const id = /href="#([^"]+)"/.exec(firstLink)[1];
  assert.match(PAGE, new RegExp(`<main[^>]*id="${id}"`));
});
