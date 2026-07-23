import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const articleBlock = page.slice(page.indexOf("let articleCase="), page.indexOf(",articleText=", page.indexOf("let articleCase=")));

test("issue article is slim, layered, and action-oriented", () => {
  assert.match(articleBlock, /本次判断可以压缩成一句话/);
  assert.match(articleBlock, /落地只做三步/);
  assert.match(articleBlock, /不要把复杂处境重新写成复杂方案/);
  assert.match(articleBlock, /articleCase\.turning/);
  assert.ok((articleBlock.match(/frameworks\[/g) || []).length <= 3);
  assert.doesNotMatch(articleBlock, /四处不必同时启动/);
  assert.doesNotMatch(articleBlock, /一个可执行的十四天实验可以这样设计/);
  assert.doesNotMatch(articleBlock, /本次议题来自/);
});
