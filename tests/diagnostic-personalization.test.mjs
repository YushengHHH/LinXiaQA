import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("diagnostic questions use the user's natural-language context", () => {
  const block = page.slice(page.indexOf("function contextProfile"), page.indexOf("const SYMBOL_RULES"));
  assert.ok(block.includes("function contextProfile"));
  assert.ok(block.includes("buildDiagnostic(x:any,mode:number,hist:any[],inp:any"));
  assert.ok(block.includes("\\u4e00\\u56e2\\u548c\\u6c14"));
  assert.ok(block.includes("\\u6563\\u6c99"));
  assert.ok(block.includes("\\u8868\\u9762\\u548c\\u6c14\\u6b63\\u5728\\u906e\\u4f4f\\u771f\\u5b9e\\u5206\\u5de5"));
  assert.ok(block.includes("profile.qs.map"));
  assert.ok(block.includes("profile.op[i]"));
  assert.doesNotMatch(block, /\?{4,}/);
  assert.ok(!block.includes("DOMAIN_CARE.?"));
});

test("personalized diagnosis anchor is shared by result, article, issue, and QA", () => {
  assert.ok(page.includes("dx=diagnosisView(x,ri,inp)"));
  assert.ok(page.includes("cx={...x,core:dx.core"));
  assert.ok(page.includes("<h1>{dx.title}</h1>"));
  assert.ok(page.includes("articleCase=buildArticleCase(cx,m,ri"));
  assert.ok(page.includes("RA("));
  assert.ok(page.includes("dx.title") && page.includes("m.id"));
});

test("history is linked only when the previous diagnosis is related", () => {
  const block = page.slice(page.indexOf("function relatedHistory"), page.indexOf("function linciForce"));
  assert.ok(block.includes("slice(1)"));
  assert.ok(block.includes("h&&h.domain===x.n"));
  assert.ok(block.includes("h.issue===m.id"));
  assert.ok(block.includes("score(h.type,dx.title)>=2"));
  assert.ok(page.includes("relHist&&<div className=\"compare\""));
  assert.ok(!page.includes("hist.length>1&&<div className=\"compare\""));
});

test("three follow-ups are generated from both diagnosis and issue anchors", () => {
  const qa = page.slice(page.indexOf('{p==="qa"&&'), page.indexOf('{p==="deep"&&'));
  assert.ok(page.includes("function buildFollowups"));
  assert.ok(page.includes("anchor=x.r[ri]") && page.includes("+m.id"));
  assert.ok(qa.includes("followups.map"));
  assert.ok(qa.includes("onClick={()=>ask(v)}"));
  assert.ok(qa.includes("value={askText}"));
});
