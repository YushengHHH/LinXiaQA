import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("article guide case is generated from the current diagnosis context", () => {
  assert.match(page, /function buildArticleCase\(/);
  assert.match(page, /inp:string,as:number\[\],dqs:any\[\],mi:number,hist:any\[\]/);
  assert.match(page, /caseLead=articleCase\.lead/);
  assert.match(page, /articleCase\.turning/);
  assert.doesNotMatch(page, /let caseLead=\(\{"团队"/);
});
