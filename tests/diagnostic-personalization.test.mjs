import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("diagnostic questions adapt across four modes and remember context", () => {
  assert.match(page, /function buildDiagnostic/);
  assert.match(page, /orders=\[\[0,1,2\],\[0,1,2\],\[2,0,1\],\[2,1,0\]\]/);
  assert.match(page, /微小变化也算进展/);
  assert.match(page, /刚才你选择了/);
  assert.match(page, /dqs\[q-1\]\.op\[as\[q-1\]\]/);
});

test("three follow-ups are generated from both diagnosis and issue anchors", () => {
  const qa = page.slice(page.indexOf('{p==="qa"&&'), page.indexOf('{p==="deep"&&'));
  assert.match(page, /function buildFollowups/);
  assert.match(page, /anchor=x\.r\[ri\]\+" × "\+m\.id/);
  assert.match(qa, /followups\.map/);
  assert.match(qa, /onClick=\{\(\)=>ask\(v\)\}/);
  assert.match(qa, /value=\{askText\}/);
});
