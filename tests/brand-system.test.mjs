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
  assert.match(page, /M20 0 L54 34 M66 46 L74 54 M86 66 L120 100/);
  assert.match(page, /M0 20 L34 54 M46 66 L54 74 M66 86 L100 120/);
  assert.match(page, /M0 100 L34 66 M46 54 L54 46 M66 34 L100 0/);
  assert.match(page, /M20 120 L54 86 M66 74 L74 66 M86 54 L120 20/);
  assert.match(page, /cx="60" cy="60" r="3.2"/);
  assert.match(css, /\.brand-symbol/);
  assert.match(css, /\.hero-brand/);
  assert.match(css, /\.pdf-symbol/);
});
