import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('brand system is integrated across app and PDF export', () => {
  assert.match(page, /function BrandMark/);
  assert.match(page, /网罟天下，以佃以渔/);
  assert.match(page, /brand-symbol/);
  assert.match(page, /hero-brand/);
  assert.match(page, /article-symbol/);
  assert.match(page, /pdf-symbol/);
  assert.match(css, /\.brand-symbol/);
  assert.match(css, /\.hero-brand/);
  assert.match(css, /\.pdf-symbol/);
});
