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
  assert.match(css, /\.pdf-document\{[^}]*width:210mm;height:296mm/);
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
  const exporter = page.slice(page.indexOf("async function saveArticlePdf"), page.indexOf("async function savePdf"));
  assert.match(css, /--pdf-body-size:10\.4pt;--pdf-body-leading:1\.62;--pdf-para-gap:3mm/);
  assert.match(css, /\.pdf-body p\{[^}]*font-size:var\(--pdf-body-size\);line-height:var\(--pdf-body-leading\)/);
  assert.match(css, /\.pdf-document h1\{font-size:23pt/);
  assert.match(css, /\.pdf-document blockquote p\{[^}]*font-size:11\.2pt/);
  assert.match(exporter, /pdfSizes=\[10\.4,10\.1,9\.8,9\.5,9\.2\]/);
  assert.match(exporter, /last\.getBoundingClientRect\(\)\.bottom<=sign\.getBoundingClientRect\(\)\.top-12/);
});

test("article PDF capture target remains drawable for html2canvas", () => {
  const exporter = page.slice(page.indexOf("async function saveArticlePdf"), page.indexOf("async function savePdf"));
  assert.match(css, /\.pdf-stage\{[^}]*left:0/);
  assert.match(css, /\.pdf-stage\{[^}]*z-index:2147483647/);
  assert.match(css, /\.pdf-stage\{[^}]*pointer-events:none/);
  assert.match(css, /\.pdf-document\{[^}]*position:relative/);
  assert.doesNotMatch(css, /\.pdf-stage\{[^}]*(left:-100000px|z-index:-1)/);
  assert.match(exporter, /requestAnimationFrame\(\(\)=>requestAnimationFrame/);
});
