import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("issue reading and article use a branching archetype engine", () => {
  assert.match(page, /const ISSUE_ARCHETYPES:any=\{/);
  assert.match(page, /function pickArchetype/);
  assert.match(page, /function buildIssueEngine/);
  assert.match(page, /issueEngine=buildIssueEngine/);
  assert.match(page, /layers=issueEngine\.layers/);
  assert.match(page, /issueSections=issueEngine\.sections/);
  assert.match(page, /arch=pickArchetype/);
});

test("archetype engine has many distinct content paths", () => {
  const start = page.indexOf("const ISSUE_ARCHETYPES");
  const end = page.indexOf("function pickArchetype", start);
  const block = page.slice(start, end);
  assert.ok((block.match(/name:/g) || []).length >= 15);
  assert.ok((block.match(/thesis:/g) || []).length >= 15);
  assert.ok((block.match(/plan:/g) || []).length >= 15);
});

test("issue page renders generated sections instead of a fixed essay", () => {
  const issue = page.slice(page.indexOf('{p==="issue"&&'), page.indexOf('{p==="qa"&&'));
  assert.match(issue, /issueSections\.map/);
  assert.doesNotMatch(issue, /essay-body"><section><span>01/);
  assert.doesNotMatch(issue, /Signal 1|Signal 2|Signal 3|Focus:|Action:/);
});
