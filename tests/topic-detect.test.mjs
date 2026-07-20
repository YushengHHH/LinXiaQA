import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('topic detection gives visible feedback and remains usable', () => {
  assert.match(page, /function detect\(\)/);
  assert.match(page, /本地语义识别/);
  assert.match(page, /第二候选/);
  assert.match(page, /三题继续校准/);
  assert.doesNotMatch(page, /暂未识别出明确话题/);
  assert.match(page, /onKeyDown=\{e=>\{if\(e\.key==="Enter"\)detect\(\)\}\}/);
  assert.match(page, /className="detect-btn"/);
  assert.match(page, /topic-hint/);
  assert.match(css, /\.detect-btn/);
});
