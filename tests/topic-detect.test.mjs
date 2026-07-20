import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('topic detection gives visible feedback and remains usable', () => {
  assert.match(page, /function detect\(\)/);
  assert.ok(page.includes('\u672c\u5730\u8bed\u4e49\u8bc6\u522b'));
  assert.ok(page.includes('\u7b2c\u4e8c\u5019\u9009'));
  assert.ok(page.includes('\u4e09\u9898\u7ee7\u7eed\u6821\u51c6'));
  assert.ok(!page.includes('\u6682\u672a\u8bc6\u522b\u51fa\u660e\u786e\u8bdd\u9898'));
  assert.match(page, /onKeyDown=\{e=>\{if\(e\.key==="Enter"\)detect\(\)\}\}/);
  assert.match(page, /className="detect-btn"/);
  assert.match(page, /naturalPending/);
  assert.ok(page.includes('\u7b49\u5f85\u8bc6\u522b\uff1a\u5148\u4e0d\u9ad8\u4eae\u4efb\u4f55\u8bdd\u9898\u57df'));
  assert.match(page, /className=\{naturalPending\?"muted"/);
  assert.match(page, /topic-hint/);
  assert.match(css, /\.detect-btn/);
  assert.match(css, /\.domain-cards\.pending/);
  assert.match(css, /button\.muted/);
});
