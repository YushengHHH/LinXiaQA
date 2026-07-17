import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("article shows the Easy Forest source imprint exactly once", () => {
  const article = page.slice(page.indexOf('{p==="article"&&'), page.indexOf('{p==="issue"&&'));
  assert.equal(article.match(/《焦氏易林》/g)?.length, 1);
  assert.match(article, /《焦氏易林》林辞/);
  assert.doesNotMatch(article, /取意《焦氏易林》/);
});

test("article PDF is generated from a dedicated A4 editorial sheet", () => {
  const exporter = page.slice(page.indexOf("async function saveArticlePdf"), page.indexOf("async function savePdf"));
  assert.match(exporter, /pdf-document/);
  assert.match(exporter, /html2pdf\(\)\.set/);
  assert.match(css, /\.pdf-document\{width:210mm;height:296mm/);
  assert.doesNotMatch(exporter, /cloneNode|articleRef/);
  assert.doesNotMatch(exporter, /avoid-all/);
});

test("article tools stay available without interrupting the reading flow", () => {
  const article = page.slice(page.indexOf('{p==="article"&&'), page.indexOf('{p==="issue"&&'));
  assert.match(article, /article-utility/);
  assert.match(article, /joy-dock/);
  assert.doesNotMatch(article, /article-primary-actions|resonance-share|article-tools/);
  assert.match(css, /\.joy-dock\{position:fixed/);
});

test("the single-page PDF uses comfortable editorial typography", () => {
  assert.match(css, /\.pdf-body p\{[^}]*font-size:11\.2pt;line-height:1\.72/);
  assert.match(css, /\.pdf-document h1\{font-size:23pt/);
  assert.match(css, /\.pdf-document blockquote p\{[^}]*font-size:11\.8pt/);
});
