import { readFile, writeFile } from "node:fs/promises";

const pageFile = new URL("../app/page.tsx", import.meta.url);
const cssFile = new URL("../app/globals.css", import.meta.url);
let page = await readFile(pageFile, "utf8");

const modeAnchor = 'const M=["标准版","变化监测版","重新定位版","执行反馈版"];';
const helpers = `const DOMAIN_CARE={团队:["沉默、分歧与彼此的辛苦","共同承担","团队"],方向:["犹疑、观望与失去的信心","方向信用","团队"],执行:["等待、返工与无效忙碌","行动回声","协作者"],个人:["补位、消耗与难以说出的压力","角色边界","自己"],外部:["噪声、风险与判断焦虑","环境信号","团队"]} as Record<string,string[]>;
function buildDiagnostic(x:any,mode:number,hist:any[]){let c=DOMAIN_CARE[x.n]||DOMAIN_CARE.团队,prior=hist.some(h=>h.domain===x.n),orders=[[0,1,2],[0,1,2],[2,0,1],[2,1,0]],stems=[[
"先不急着解决‘"+x.a+"’。最近哪一幕最像你正在经历的"+c[0]+"？",
"当你已经尽力推动，‘"+c[1]+"’最常在哪个时刻变得困难？",
"如果这次只先照顾一个关键处，你最希望从哪里替"+c[2]+"松开一点？"],[
"和上次相比，哪一种状态变化最值得被看见——哪怕它还很小？",
"这段时间里，哪个旧卡点又回来了，或者换了一种样子？",
"为了确认自己的努力没有白费，下一步你最想看到哪一种真实证据？"],[
"如果暂时不问谁对谁错，你现在最想重新理解‘"+x.a+"’里的哪一部分？",
"过去曾经有效的做法，今天最可能在哪一点开始变成负担？",
"站到新的位置上，你最想为"+c[2]+"重新定下什么边界？"],[
"上次之后，你真正尝试过的改变更接近哪一种？没有做到也可以如实选择。",
"行动推进到哪里时，现实最先给了你什么回声？",
"如果我们陪你把下一步再缩小一点，眼下最值得守住的是哪一处？"]],notes=[[
"不必判断对错，只选最像你的一幕。",
"你已经在承担很多；这一题只想辨认阻力从哪里来。",
"先照顾最要紧的一处，不要求一次解决全部。"],[
prior?"我们记得你来过；微小变化也算进展。":"先建立今天的坐标，之后才看得见变化。",
"反复不是退步，它往往是在提示结构还没有改变。",
"用证据陪你判断，不用意志责备自己。"],[
"先把归责放在一边，给处境一次被重新理解的机会。",
"旧办法曾保护过你，也可能到了需要更新的时候。",
"新的位置不是推翻过去，而是让今天更能呼吸。"],[
"真实比完成感重要；没有尝试也会成为有效信息。",
"我们关注行动收到的反馈，而不是给努力打分。",
"把下一步缩小到能做到、能观察、能复盘。"]];return stems[mode].map((q,i)=>({q,note:notes[mode][i],op:x.op[orders[mode][i]],source:orders[mode][i]}))}
const QA_LENS={团队:["哪一次沉默最值得先被听见","谁正在承担超出角色边界的责任","怎样让一次真实分歧变成共同承诺"],方向:["哪一项承诺最需要重新获得信用","团队需要先看到什么证据才愿意跟随","怎样让方向从口号变成一次共同取舍"],执行:["哪一个等待正在切断行动链路","谁缺少做取舍和停止事项的权力","怎样让第一份反馈更早出现"],个人:["哪一种补位正在悄悄耗尽你","哪条边界需要被温和而清楚地说出","怎样把亲自承担变成帮助他人成长"],外部:["哪个信号可能被焦虑放大或被惯性忽略","团队需要共同区分哪些信号、噪声与趋势","怎样用一次可逆试探更新判断"]} as Record<string,string[]>;
function buildFollowups(x:any,m:any,ri:number){let l=QA_LENS[x.n]||QA_LENS.团队,anchor=x.r[ri]+" × "+m.id;return[{q:"面对‘"+x.r[ri]+"’，"+l[0]+"？结合‘"+m.t+"’，我该先观察什么？",answer:"先不要急着扩大动作。请回到最近一次真实场景，记录‘"+l[0]+"’出现前后的事实，再用林辞‘"+m.id+"’提醒自己辨认通道、关系与反馈是否仍然畅通。"},{q:"在‘"+x.r[ri]+"’与‘"+m.id+"’共同指向的处境里，"+l[1]+"？",answer:"把人和问题分开看：先确认谁拥有决定权、谁承担了结果、谁只能等待。围绕‘"+l[1]+"’进行一次短对话，目标不是追责，而是重新对齐权责与支持。"},{q:"如果从‘"+x.f[0]+"’开始，"+l[2]+"？用什么证据判断改变是真的？",answer:"设计一个14天的小实验：只选一个场景，明确一个共同结果、唯一负责人和一项停止事项。把‘"+l[2]+"’变成可观察行为；到期只看证据，再决定扩大、调整或停止。"}].map(v=>({...v,anchor}))}`;
if (!page.includes(modeAnchor)) throw new Error("Mode anchor missing");
page = page.replace(modeAnchor, modeAnchor + helpers);

page = page.replace('[ans,RA]=useState("")', '[ans,RA]=useState(""),[askText,SAT]=useState("")');
page = page.replace(
  'let mi=track?3:hist.length?Math.min(hist.length,2):0,unlock=Math.min(4,(hist.length?1:0)+(read>=70?1:0)+(ans?1:0)+(hist.length>=3?1:0));function go',
  'let mi=track?3:hist.length?Math.min(hist.length,2):0,unlock=Math.min(4,(hist.length?1:0)+(read>=70?1:0)+(ans?1:0)+(hist.length>=3?1:0)),dqs=buildDiagnostic(x,mi,hist),dq=dqs[q],followups=buildFollowups(x,m,ri);function go',
);
page = page.replace('answers:a.map((n,j)=>x.op[j][n])', 'answers:a.map((n,j)=>dqs[j].op[n])');

const oldAskStart = 'function ask(){RA("基于诊断锚点「"+x.r[ri]+"」与议题锚点「"+m.id+"」，建议先从“"+x.f[0]+"”开始。把它设计成14天内可验证的小实验：明确一个结果、一个负责人、一个停止事项。先获得真实证据，再扩大改变。")}';
const newAskStart = 'function ask(item?:any){let question=item?.q||askText.trim()||"我现在最需要看清什么？",guidance=item?.answer||("先把问题放回一个具体场景。围绕‘"+x.r[ri]+"’辨认反复出现的阻力，再借‘"+m.id+"’观察通道、关系与反馈。选择‘"+x.f[0]+"’设计一个14天小实验，用事实更新判断。");RA("你问的是："+question+"\\n\\n双锚校准："+x.r[ri]+" × "+m.id+"\\n\\n"+guidance)}';
if (!page.includes(oldAskStart)) throw new Error("Ask function anchor missing");
page = page.replace(oldAskStart, newAskStart);

const quizStart = page.indexOf('{p==="quiz"&&');
const quizEnd = page.indexOf('{p==="result"&&');
if (quizStart < 0 || quizEnd < 0) throw new Error("Quiz block missing");
const quizBlock = `{p==="quiz"&&<section className="quiz-page"><aside><p>当前话题域</p><h2>{x.i} · {x.n}</h2><div><span>诊断模式</span><b>{M[mi]}</b><small>{["建立处境基线","关注与上次相比的变化","重新认识当前处境","跟进执行进展与卡点"][mi]}</small></div><button onClick={()=>go("start")}>← 更换话题域</button></aside><article><div className="quiz-top"><span>第 {q+1} / 3 题</span><i>{[1,2,3].map(n=><b className={n<=q+1?"done":""} key={n}/>)}</i></div><p className="eyebrow">{M[mi]} · {x.n}</p>{inp&&q===0&&<div className="user-context"><small>我们从你的原话出发</small><p>“{inp}”</p></div>}{q>0&&as[q-1]!==undefined&&<div className="choice-memory"><small>刚才你选择了</small><p>{dqs[q-1].op[as[q-1]]}</p></div>}<h1>{dq.q}</h1><p className="diagnostic-care">{dq.note}</p><div className="choices">{dq.op.map((v,i)=><button onClick={()=>pick(i)} key={v}><span>{String.fromCharCode(65+i)}</span><b>{v}</b><i>选择 →</i></button>)}</div></article></section>}
`;
page = page.slice(0, quizStart) + quizBlock + page.slice(quizEnd);

const qaStart = page.indexOf('{p==="qa"&&');
const qaEnd = page.indexOf('{p==="deep"&&');
if (qaStart < 0 || qaEnd < 0) throw new Error("QA block missing");
const qaBlock = `{p==="qa"&&<section className="page qa-page"><div className="qa-context"><p className="eyebrow">第三部 · 双锚问答</p><h1>把理解，<br/>带回处境。</h1><div><small>诊断锚点</small><b>{x.r[ri]}</b><p>{x.n} · {M[mi]}</p></div><div><small>议题锚点</small><b>{m.id}</b><p>{m.t}</p></div></div><div className="qa-main"><p>从你的处境继续追问</p><small className="qa-intro">下面三问由本次诊断与议题共同生成，不是通用清单。</small>{followups.map(v=><button className="anchor-question" onClick={()=>ask(v)} key={v.q}><span><b>{v.q}</b><small>{v.anchor}</small></span><i>→</i></button>)}<textarea value={askText} onChange={e=>SAT(e.target.value)} placeholder="也可以写下此刻最放不下的问题……"/><button className="solid" onClick={()=>ask()}>提交我的追问</button>{ans&&<div className="answer"><p className="eyebrow">林下回答 · 双锚生成</p><p className="answer-text">{ans}</p><div><small>回答依据</small><span>{x.r[ri]}</span><span>{m.id}</span></div><button onClick={()=>go("deep")}>查看认知图谱 →</button></div>}</div></section>}
`;
page = page.slice(0, qaStart) + qaBlock + page.slice(qaEnd);
await writeFile(pageFile, page);

let css = await readFile(cssFile, "utf8");
css += '.diagnostic-care{margin:-24px 0 24px;padding-left:14px;border-left:2px solid var(--red);color:#6c756f;font-size:13px;line-height:1.7}.choice-memory{margin:18px 0 0;padding:13px 16px;background:#ebe5d8;border:1px solid #d6cfbf}.choice-memory small{font:9px sans-serif;letter-spacing:.12em;color:var(--red)}.choice-memory p{margin:5px 0 0;font-size:13px;color:#46544c}.qa-intro{display:block;margin:-8px 0 24px;color:var(--muted);line-height:1.7}.qa-main>.anchor-question{display:grid!important;grid-template-columns:1fr auto!important;align-items:center!important}.anchor-question>span{text-align:left}.anchor-question b{display:block;font-weight:500;line-height:1.65}.anchor-question small{display:block;margin-top:6px;color:var(--red);font:9px sans-serif;letter-spacing:.08em}.anchor-question i{font-style:normal}.answer-text{white-space:pre-line}';
await writeFile(cssFile, css);
