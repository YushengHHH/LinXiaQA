import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('Easy Forest text is explained through accessible interpretation layers', () => {
  for (const label of ['字', '句', '全文', '典故', '变卦', '引申']) {
    assert.match(page, new RegExp(label));
  }
  assert.match(page, /function explainLinci/);
  assert.match(page, /周易变卦情境/);
  assert.match(page, /当下问题/);
  assert.match(page, /linci-guide/);
  assert.match(page, /linc-cards/);
  assert.match(css, /\.linci-guide/);
  assert.match(css, /\.linc-cards/);
});

test('Linci explanation is anchored to the exact matched text and diagnosis', () => {
  assert.match(page, /本句中/);
  assert.match(page, /按句段读完整走势/);
  assert.match(page, /原文可读成/);
  assert.match(page, /三重锚点锁定/);
  assert.match(page, /诊断锚点/);
  assert.match(page, /文本信号/);
  assert.doesNotMatch(page, /道路对应组织中的方向通道/);
});
