import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const articleBlock = page.slice(
  page.indexOf("let articleCase="),
  page.indexOf(",articleText=", page.indexOf("let articleCase=")),
);

test("issue article is slim, layered, and action-oriented", () => {
  assert.match(articleBlock, /caseLead/);
  assert.match(articleBlock, /articleCase\.turning/);
  assert.match(articleBlock, /frameworks\[0\]\.action/);
  assert.match(articleBlock, /frameworks\[1\]\.title/);
  assert.ok((articleBlock.match(/frameworks\[/g) || []).length <= 4);
  assert.doesNotMatch(articleBlock, /Signal 1|Signal 2|Signal 3|Focus:|Action:|Linci |Last:/);
  assert.doesNotMatch(articleBlock, /m\.lin/);
});
