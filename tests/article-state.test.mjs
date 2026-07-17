import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";
const source=fs.readFileSync("app/page.tsx","utf8");const data=JSON.parse(fs.readFileSync("app/yilin-data.json","utf8"));
function hash(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h>>>0}
test("missing article query does not become index zero",()=>{assert.match(source,/av!==null&&av\.trim\(\)!==""/);assert.doesNotMatch(source,/Number\(u\.searchParams\.get\("article"\)\)/)});
test("latest diagnosis restores its issue",()=>{assert.match(source,/YILIN\.findIndex\(e=>e\.id===hs\[0\]\.issue\)/)});
test("different diagnosis signals reach different articles",()=>{let signals=["团队|沉默|各自很忙|信息很多|共同承担|标准版","方向|战略反复|表面配合|等待结果|建立承诺|标准版","执行|项目延期|节点延期|解释未完成|反馈太长|标准版"];let ids=signals.map(s=>data[hash(s)&4095].id);assert.equal(new Set(ids).size,3)});
