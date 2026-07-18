import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('brand system is integrated across app and PDF export', () => {
  assert.match(page, /function BrandMark/);
  assert.match(page, /brand-symbol/);
  assert.match(page, /hero-brand/);
  assert.match(page, /article-symbol/);
  assert.match(page, /pdf-symbol/);
  assert.match(page, /M28 0 L54 26 M66 38 L82 54 M94 66 L120 92/);
  assert.match(page, /M0 28 L26 54 M38 66 L54 82 M66 94 L92 120/);
  assert.match(page, /M0 92 L26 66 M38 54 L54 38 M66 26 L92 0/);
  assert.match(page, /M28 120 L54 94 M66 82 L82 66 M94 54 L120 28/);
  assert.match(page, /cx="60" cy="60" r="2.8"/);
  assert.match(css, /\.brand-symbol/);
  assert.match(css, /\.hero-brand/);
  assert.match(css, /\.pdf-symbol/);
  assert.match(css, /stroke-width:5.8/);
  assert.match(css, /stroke-width:4.2/);
});
