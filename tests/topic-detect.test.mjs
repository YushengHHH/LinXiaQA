import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('topic detection gives visible feedback and remains usable', () => {
  assert.match(page, /function detect\(\)/);
  assert.ok(page.includes('\u8f7b\u91cf\u8bed\u4e49\u8bc6\u522b'));
  assert.ok(page.includes('\u6a21\u7cca\u65f6\u8bf7\u4f60\u786e\u8ba4'));
  assert.ok(page.includes('\u53ef\u80fd\u662f'));
  assert.ok(page.includes('\u6b21\u8981\u4fe1\u53f7'));
  assert.ok(!page.includes('\u6682\u672a\u8bc6\u522b\u51fa\u660e\u786e\u8bdd\u9898'));
  assert.match(page, /boost=\(i:number\)/);
  assert.ok(page.includes('\u4e00\u56e2\u548c\u6c14'));
  assert.ok(page.includes('\u4e00\u56e2\u6563\u6c99'));
  assert.ok(page.includes('\u529e\u516c\u5ba4'));
  assert.match(page, /gap<2/);
  assert.match(page, /disabled=\{naturalPending\}/);
  assert.match(page, /className="detect-btn"/);
  assert.match(page, /naturalPending/);
  assert.ok(page.includes('\u7b49\u5f85\u8bc6\u522b\uff1a\u5148\u4e0d\u9ad8\u4eae\u4efb\u4f55\u8bdd\u9898\u57df'));
  assert.match(page, /className=\{naturalPending\?"muted"/);
  assert.match(page, /topic-hint/);
  assert.match(css, /\.detect-btn/);
  assert.match(css, /\.domain-cards\.pending/);
  assert.match(css, /button\.muted/);
  assert.match(css, /\.next:disabled/);
});
