import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../app/page.tsx", import.meta.url);
const source = await readFile(file, "utf8");
const target = ',pagebreak:{mode:"avoid-all"}';
const count = source.split(target).length - 1;
if (count !== 1) throw new Error(`Expected one article pagebreak rule, found ${count}`);
await writeFile(file, source.replace(target, ""));
