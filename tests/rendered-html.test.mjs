import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server renders the 林下问路 product shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<title>林下问路｜知道管理的组织路径沙盘<\/title>/);
  assert.match(html, /开始六问诊断/);
  assert.match(html, /六问路径沙盘/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps core workflow surfaces independently componentized", async () => {
  const files = await Promise.all(
    [
      "diagnosis-page.tsx",
      "report-page.tsx",
      "history-page.tsx",
      "revisit-workspace.tsx",
      "system-page.tsx",
      "home-page.tsx",
      "use-diagnosis-controller.ts",
    ].map((name) =>
      readFile(new URL(`../app/${name}`, import.meta.url), "utf8"),
    ),
  );
  const source = files.join("\n");
  assert.match(source, /M₆₄ 复诊结论可信度 V0\.1/);
  assert.match(source, /M₆₄ 复诊行动决策闸门 V0\.1/);
  assert.match(source, /M₆₄ 行动实验复查 V0\.1/);
  assert.match(source, /M₆₄ 实验复盘与下一步生成 V0\.1/);
});
