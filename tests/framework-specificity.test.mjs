import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("four entry positions derive from the matched Easy Forest text", () => {
  assert.match(page, /const SYMBOL_RULES=\[/);
  assert.match(page, /function deriveFrameworks/);
  assert.match(page, /SYMBOL_RULES\.filter\(v=>v\.re\.test\(lin\)\)/);
  assert.match(page, /林辞信号：/);
  assert.match(page, /诊断信号：/);
  assert.match(page, /时机判断：/);
});

test("reading framework renders distinct evidence and actions", () => {
  const issue = page.slice(page.indexOf('{p==="issue"&&'), page.indexOf('{p==="qa"&&'));
  assert.match(issue, /frameworks\.map/);
  assert.match(issue, /v\.source/);
  assert.match(issue, /v\.detail/);
  assert.match(issue, /v\.action/);
  assert.doesNotMatch(issue, /x\.f\.map|x\.f\.join/);
});
