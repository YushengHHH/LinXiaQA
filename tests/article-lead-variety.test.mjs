import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const fn = page.slice(page.indexOf("function buildArticleCase"), page.indexOf("function buildFollowups"));

test("article lead avoids reusable scene templates and English labels", () => {
  assert.match(fn, /caseLead|lead=/);
  assert.match(fn, /choices=as\.map/);
  assert.doesNotMatch(fn, /Signal 1|Signal 2|Signal 3|Focus:|Action:|Linci |Last:/);
  assert.doesNotMatch(fn, /地点像是|触发点是|第一眼看到的是|轻量现场/);
});
