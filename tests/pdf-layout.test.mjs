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
});

test("sharing stays available before and during reading", () => {
  assert.match(page, /article-primary-actions/);
  assert.match(page, /resonance-share/);
  assert.match(page, /joy-dock/);
  assert.match(css, /\.joy-dock\{position:fixed/);
});
