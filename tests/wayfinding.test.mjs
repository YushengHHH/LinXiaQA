import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("every inner view receives a persistent journey navigator", () => {
  assert.match(page, /p!=="welcome"&&<nav className="journey-nav"/);
  assert.match(page, /返回上处/);
  for (const label of ["定问", "诊断", "七层阅读", "议题文章", "双锚问答", "我的认知"]) {
    assert.match(page, new RegExp(label));
  }
  assert.match(css, /\.journey-nav\{height:48px;position:sticky/);
});

test("knowledge immersion offers explicit exits", () => {
  assert.match(page, /← 返回议题原文/);
  assert.match(page, /返回原文继续阅读/);
  assert.match(page, /带着知识点追问/);
  assert.match(page, /aria-label="关闭知识浸润"/);
});

test("seven reading layers can be traversed in both directions", () => {
  assert.match(page, /className="layer-switch"/);
  assert.match(page, /← 上一层/);
  assert.match(page, /下一层 →/);
  assert.match(page, /读连续文章/);
  assert.match(page, /去双锚问答/);
});
