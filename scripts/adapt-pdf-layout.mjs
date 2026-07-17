import { readFile, writeFile } from "node:fs/promises";

const pageFile = new URL("../app/page.tsx", import.meta.url);
const cssFile = new URL("../app/globals.css", import.meta.url);

let page = await readFile(pageFile, "utf8");
const fitAnchor = "await(document.fonts?.ready||Promise.resolve());await html2pdf().set";
const fitCode = 'await(document.fonts?.ready||Promise.resolve());let pdfSizes=[10.4,10.1,9.8,9.5,9.2],pdfLeads=[1.62,1.6,1.58,1.56,1.54],pdfGaps=[3,2.8,2.6,2.4,2.2];for(let i=0;i<pdfSizes.length;i++){sheet.style.setProperty("--pdf-body-size",pdfSizes[i]+"pt");sheet.style.setProperty("--pdf-body-leading",String(pdfLeads[i]));sheet.style.setProperty("--pdf-para-gap",pdfGaps[i]+"mm");await new Promise<void>(done=>requestAnimationFrame(()=>done()));let last=body.lastElementChild as HTMLElement|null;if(!last||last.getBoundingClientRect().bottom<=sign.getBoundingClientRect().top-12)break}await html2pdf().set';
if ((page.split(fitAnchor).length - 1) !== 1) throw new Error("Unexpected PDF fitting anchor count");
page = page.replace(fitAnchor, fitCode);
await writeFile(pageFile, page);

let css = await readFile(cssFile, "utf8");
css = css.replace(
  ".pdf-document{width:210mm;height:296mm;overflow:hidden;",
  ".pdf-document{--pdf-body-size:10.4pt;--pdf-body-leading:1.62;--pdf-para-gap:3mm;width:210mm;height:296mm;overflow:hidden;",
);
css = css.replace(
  ".pdf-document blockquote p{margin:0;font-size:11.8pt;line-height:1.6}.pdf-body p{margin:0 0 3.8mm;font-size:11.2pt;line-height:1.72;text-align:justify}",
  ".pdf-document blockquote p{margin:0;font-size:11.2pt;line-height:1.55}.pdf-body p{margin:0 0 var(--pdf-para-gap);font-size:var(--pdf-body-size);line-height:var(--pdf-body-leading);text-align:justify}",
);
await writeFile(cssFile, css);
