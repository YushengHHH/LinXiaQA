import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("diagnostic questions use the user's natural-language context", () => {
  const block = page.slice(page.indexOf("function contextProfile"), page.indexOf("const SYMBOL_RULES"));
  assert.match(block, /function contextProfile/);
  assert.match(block, /buildDiagnostic\(x:any,mode:number,hist:any\[\],inp:any/);
  assert.match(block, /\\u4e00\\u56e2\\u548c\\u6c14/);
  assert.match(block, /\\u6563\\u6c99/);
  assert.match(block, /\\u8868\\u9762\\u548c\\u6c14\\u6b63\\u5728\\u906e\\u4f4f\\u771f\\u5b9e\\u5206\\u5de5/);
  assert.match(block, /profile\.qs\.map/);
  assert.match(block, /profile\.op\[i\]/);
  assert.doesNotMatch(block, /\?{4,}/);
  assert.doesNotMatch(block, /DOMAIN_CARE\.\?/);
});

test("personalized diagnosis anchor is shared by result, article, issue, and QA", () => {
  assert.match(page, /dx=diagnosisView\(x,ri,inp\)/);
  assert.match(page, /cx=\{\.\.\.x,core:dx\.core/);
  assert.match(page, /<h1>\{dx\.title\}<\/h1>/);
  assert.match(page, /articleCase=buildArticleCase\(cx,m,ri/);
  assert.match(page, /双锚校准："\+dx\.title/);
});

test("three follow-ups are generated from both diagnosis and issue anchors", () => {
  const qa = page.slice(page.indexOf('{p==="qa"&&'), page.indexOf('{p==="deep"&&'));
  assert.match(page, /function buildFollowups/);
  assert.match(page, /anchor=x\.r\[ri\]\+" × "\+m\.id/);
  assert.match(qa, /followups\.map/);
  assert.match(qa, /onClick=\{\(\)=>ask\(v\)\}/);
  assert.match(qa, /value=\{askText\}/);
});
