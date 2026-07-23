import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const articleBlock = page.slice(
  page.indexOf("let articleCase="),
  page.indexOf(",articleText=", page.indexOf("let articleCase=")),
);
const builder = page.slice(page.indexOf("function buildArticleCase"), page.indexOf("function buildFollowups"));

test("issue article is slim, layered, and action-oriented", () => {
  assert.ok(articleBlock.includes("caseLead"));
  assert.ok(articleBlock.includes("articleCase.evidence"));
  assert.ok(articleBlock.includes("articleCase.claim"));
  assert.ok(articleBlock.includes("articleCase.certify"));
  assert.ok(articleBlock.includes("articleCase.action"));
  assert.ok(articleBlock.includes("articleCase.close"));
  assert.ok((articleBlock.match(/articleCase\./g) || []).length <= 8);
  assert.doesNotMatch(articleBlock, /Signal 1|Signal 2|Signal 3|Focus:|Action:|Linci |Last:/);
  assert.ok(!articleBlock.includes("m.lin,"));
});

test("article forms a user-answer issue-claim linci-certification triangle", () => {
  assert.ok(builder.includes("q0=dqs[0]?.q"));
  assert.ok(builder.includes("choices=as.map"));
  assert.ok(builder.includes("evidence="));
  assert.ok(builder.includes("claim="));
  assert.ok(builder.includes("certify="));
  assert.ok(builder.includes("caseLead="));
  assert.ok(builder.includes("person=base[0]"));
  assert.ok(builder.includes("role=base[1]"));
  assert.ok(builder.includes("m.lin"));
  assert.ok(builder.includes("linciPower.first"));
  assert.ok(builder.includes("linciPower.last"));
  assert.ok(builder.includes("linciPower.tone"));
  assert.ok(builder.includes("linciPower.cue"));
  assert.ok(builder.includes("frameworks[0]?.title"));
  assert.ok(builder.includes("frameworks[1]?.title"));
});
