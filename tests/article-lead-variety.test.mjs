import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const fn = page.slice(page.indexOf("function buildArticleCase"), page.indexOf("function buildFollowups"));

test("article lead uses varied diagnosis-shaped openings instead of the old reusable scene", () => {
  assert.match(fn, /idx=\(ri\+mi\+as\.reduce/);
  assert.match(fn, /leads=\[/);
  assert.doesNotMatch(fn, /地点像是/);
  assert.doesNotMatch(fn, /触发点是/);
  assert.doesNotMatch(fn, /第一眼看到的是/);
  assert.doesNotMatch(fn, /轻量现场/);
});
