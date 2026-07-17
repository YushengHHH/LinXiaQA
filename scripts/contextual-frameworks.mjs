import { readFile, writeFile } from "node:fs/promises";

const pageFile = new URL("../app/page.tsx", import.meta.url);
const cssFile = new URL("../app/globals.css", import.meta.url);
let page = await readFile(pageFile, "utf8");

const helperAnchor = "const QA_LENS=";
const helperPos = page.indexOf(helperAnchor);
if (helperPos < 0) throw new Error("QA lens anchor missing");
const helpers = `const SYMBOL_RULES=[
{re:/道|路|行|往|征|来|归/,key:"通道",title:"重画行动通道",detail:"林辞把注意力放在行进与抵达上。管理上要看的不是口号是否正确，而是决定如何穿过角色、资源与反馈，最终抵达结果。",action:"画出从决定到结果的五个节点，只修复第一个中断处。"},
{re:/门|户|闭|塞|阻|关/,key:"边界",title:"打开必要边界",detail:"门、户与阻塞提示信息或权力被卡在边界上。继续催促不会自动打开边界，需要明确谁能放行、谁在等待。",action:"找出一个需要放行的决定，写清授权人、时限和默认处理方式。"},
{re:/舟|川|河|水|泉|流/,key:"流动",title:"恢复资源流动",detail:"水与舟关注承载和流向。组织里的资源、信息或注意力可能仍在移动，却没有流向最需要的位置。",action:"追踪一项关键资源本周实际流向，停止一处与目标无关的分流。"},
{re:/山|石|陵|坎|谷|崖/,key:"阻力",title:"先辨认真实阻力",detail:"山石与险地说明阻力具有结构，不会因意志增强而消失。要区分必须绕行、可以移除和需要等待的部分。",action:"把阻力分成绕行、移除、等待三类，只为其中一类安排动作。"},
{re:/火|日|光|明|照/,key:"可见度",title:"让关键事实见光",detail:"光与火提示可见性。问题可能不是无人努力，而是关键事实没有进入共同视野，导致判断仍靠想象。",action:"在下一次会议只呈现三项事实：结果、偏差、尚未验证的假设。"},
{re:/风|雨|雷|震|云/,key:"变化",title:"区分信号与波动",detail:"风雨雷震意味着环境正在改变，但变化的速度不等于方向已经清楚。管理者要先区分短期波动和持续信号。",action:"为同一信号设置两个观察时点，避免只凭一次波动改变全局。"},
{re:/鸿|雁|鸟|凤|鹤|鸣/,key:"信号",title:"听见远处信号",detail:"鸟与鸣叫常指向传递、回应和距离。组织需要确认信号是否被听见、由谁解释、有没有形成回声。",action:"选择一个边缘角色，询问他看见了什么但尚未进入正式讨论。"},
{re:/虎|狼|狐|鹿|牛|马|兽/,key:"力量",title:"重新安置力量",detail:"兽类意象把注意力带到本能、力量和控制。力量若没有边界，会变成压迫；若没有承载，也会变成失控。",action:"列出一项必须集中决策和一项应当下放的决策，本周完成交接。"},
{re:/夫|妇|婚|家|子|母|父|友/,key:"关系",title:"重订关系契约",detail:"家庭与伴侣意象提示关系中的期待、承诺和位置。真正的卡点可能是双方默认的契约已经不同。",action:"让关键双方分别写下‘我负责什么、我需要什么、不再默认什么’。"},
{re:/病|伤|害|毒|螫|忧|泣/,key:"耗损",title:"先停止继续耗损",detail:"病伤害忧说明系统已经付出代价。此时首要任务不是扩大改善，而是识别仍在制造伤害的重复动作。",action:"停止一项已经连续两次无效的动作，观察七天内负担是否下降。"},
{re:/田|禾|谷|果|木|林|生/,key:"生长",title:"保护生长条件",detail:"田木果实提醒我们，成长依赖条件而不是催熟。管理动作应转向土壤、节律和可持续反馈。",action:"为一个正在萌芽的有效做法补足时间、资源和复盘，而不是立即全面推广。"},
{re:/金|玉|宝|利|财|获/,key:"价值",title:"重新确认价值去向",detail:"金玉财获指向价值与资源。要判断组织正在追逐什么、奖励什么，以及真正重要的价值是否被次要指标替代。",action:"删除一个与核心结果冲突的指标，把资源重新指向唯一价值结果。"}];
const RESULT_MOVES={团队:[{title:"把共同结果放回桌面",detail:"诊断显示协同正在失去共同目标，各自完成并不等于共同完成。",action:"用一句话重写共同结果，并让每个角色说出自己的交付接口。"},{title:"让沉默变成可讨论的分歧",detail:"诊断显示关系正在用沉默保护自己，表面和气掩盖了真实取舍。",action:"会前匿名收集一个反对意见，会上先讨论分歧再讨论方案。"},{title:"从集中承担改为责任接口",detail:"诊断显示责任正向少数人集中，补位正在替代能力成长。",action:"选一项高频补位，明确负责人可决定、需协商与必须升级的边界。"}],方向:[{title:"只保留能够兑现的承诺",detail:"诊断显示方向信用正在破产，新的宣讲会被旧的失约解释。",action:"收回多余口号，只公布一个两周内可兑现的方向承诺。"},{title:"把战略语言翻译成取舍",detail:"诊断显示战略仍停留在语言里，团队不知道什么因此停止。",action:"为战略写出一项新增、一项停止和一项资源倾斜。"},{title:"建立第一个新参照",detail:"诊断显示组织缺少新方向的可见证据，旧地图仍在支配行动。",action:"选择一个小场景建立新基准，用前后证据替代愿景解释。"}],执行:[{title:"停止用忙碌证明有效",detail:"诊断显示动作数量正在遮蔽结果，团队需要减少而不是加码。",action:"删除一项汇报，只保留结果、偏差和下一决定。"},{title:"接通被等待切断的链路",detail:"诊断显示执行链路被等待切断，关键决定没有明确到达时间。",action:"为最常等待的接口指定决定人、截止时间和超时默认方案。"},{title:"让反馈早于失败出现",detail:"诊断显示反馈系统已经失灵，风险直到临近交付才可见。",action:"把一次末端验收前移为中途样本检查，允许提前暴露失败。"}],个人:[{title:"让角色追上已经变化的自己",detail:"诊断显示新角色仍被旧身份承担，个人正在用过去的方式证明价值。",action:"写下新角色必须亲自做的三件事，以及应该退出的三件事。"},{title:"用选择替代控制感",detail:"诊断显示控制正在替代领导，确定感来自亲自介入而非系统能力。",action:"挑一个非关键决定不再给答案，只提供判断标准和复盘时间。"},{title:"建立可承受的管理边界",detail:"诊断显示管理者缺少边界，持续补位正在侵蚀判断力。",action:"公开一个响应时段、一个升级条件和一类不再代办的事项。"}],外部:[{title:"承认旧地图已经失效",detail:"诊断显示环境已变而旧解释仍在工作，需要先更新假设。",action:"列出三个仍在沿用的旧假设，为每个寻找一条反证。"},{title:"把噪声分层而不是压平",detail:"诊断显示组织被多重声音牵引，需要区分事实、解释和情绪。",action:"把外部信息分为事实、趋势、噪声三栏，只对事实采取即时动作。"},{title:"用可逆试探代替豪赌",detail:"诊断显示转型缺少可逆试探，选择因此被迫一次性做大。",action:"设计一个两周可撤回的小试探，预先写明继续、调整和停止条件。"}]} as Record<string,any[]>;
function deriveFrameworks(m:any,x:any,ri:number){let lin=String(m.lin||""),hash=Array.from(String(m.id||"")).reduce((n:any,c:any)=>n+c.charCodeAt(0),0),hits=SYMBOL_RULES.filter(v=>v.re.test(lin));for(let k=0;hits.length<2&&k<SYMBOL_RULES.length;k++){let v=SYMBOL_RULES[(hash+k*5)%SYMBOL_RULES.length];if(!hits.includes(v))hits.push(v)}let fromRule=(v:any)=>{let cue=lin.match(v.re)?.[0]||v.key;return{title:"从‘"+cue+"’看"+v.key+"："+v.title,source:"林辞信号："+cue,detail:v.detail,action:v.action}},move=(RESULT_MOVES[x.n]||RESULT_MOVES.团队)[ri]||RESULT_MOVES.团队[0],bad=lin.match(/不得|无成|凶|害|病|忧|困|亡|破|泣/),good=lin.match(/吉|利|喜|福|成|获|安|昌|庆/),timing=bad?{title:"时机判断：先止损，再求成",source:"林辞语气："+bad[0],detail:"林辞出现受阻或耗损信号，当前更适合缩小暴露面、停止无效动作，而不是扩大承诺。",action:"确定一项立即停止的动作和一个七天观察指标。"}:good?{title:"时机判断：先固化，再放大",source:"林辞语气："+good[0],detail:"林辞出现有利信号，重点不是庆祝或扩张，而是看清有效条件是否能够被重复。",action:"记录本次有效的三个条件，下一轮只复制其中一个。"}:{title:"时机判断：小步试探，保留回路",source:"林辞语气：未定",detail:"林辞没有给出单向信号，说明处境仍需通过小规模行动获得反馈。",action:"设计一个可撤回的两周试探，预先写明继续与停止条件。"};return[fromRule(hits[0]),fromRule(hits[1]),{...move,source:"诊断信号："+x.r[ri]},timing]}
`;
page = page.slice(0, helperPos) + helpers + page.slice(helperPos);

page = page.replace('function buildFollowups(x:any,m:any,ri:number){', 'function buildFollowups(x:any,m:any,ri:number,frameworks:any[]){');
page = page.replace('如果从‘"+x.f[0]+"’开始', '如果从‘"+frameworks[0].title+"’开始');
page = page.replace('dqs=buildDiagnostic(x,mi,hist),dq=dqs[q],followups=buildFollowups(x,m,ri)', 'dqs=buildDiagnostic(x,mi,hist),dq=dqs[q],frameworks=deriveFrameworks(m,x,ri),followups=buildFollowups(x,m,ri,frameworks)');
page = page.replace('选择‘"+x.f[0]+"’设计一个14天小实验', '选择‘"+frameworks[0].title+"’设计一个14天小实验');
page = page.replace('x.f.join("；")+"。"', 'frameworks.map(v=>v.title).join("；")+"。"');

const oldArticleOne = '"因此，第一个进入位置是“"+x.f[0]+"”。它要求管理者把宏大的问题缩小到一个可以在两周内观察的真实场景，只定义一个共同结果，并让所有参与者知道什么可以暂时不做。第二个位置是“"+x.f[1]+"”。真实分歧必须在决定形成之前出现，而不是在会议结束后以拖延、沉默或返工的形式出现。",';
const newArticleOne = '"这一次的四个进入位置不是领域通用模板，而是由林辞信号与诊断共同导出。第一处是“"+frameworks[0].title+"”："+frameworks[0].detail+" 可先做："+frameworks[0].action+" 第二处是“"+frameworks[1].title+"”："+frameworks[1].detail+" 可先做："+frameworks[1].action,';
const oldArticleTwo = '"第三个位置是“"+x.f[2]+"”。责任不是把任务交给某个人，而是赋予他对取舍、资源和停止事项作出决定的空间。第四个位置是“"+x.f[3]+"”。组织需要停止奖励隐性救火和无边界补位，否则任何新的制度都会再次被旧的行为模式吸收。四个位置不必同时启动，选择其中最接近当前阻力的一处即可。",';
const newArticleTwo = '"第三处回应诊断：“"+frameworks[2].title+"”。"+frameworks[2].detail+" 可先做："+frameworks[2].action+" 第四处判断时机：“"+frameworks[3].title+"”。"+frameworks[3].detail+" 可先做："+frameworks[3].action+" 四处不必同时启动，选择最接近当前阻力的一处即可。",';
if (!page.includes(oldArticleOne) || !page.includes(oldArticleTwo)) throw new Error("Article framework paragraphs missing");
page = page.replace(oldArticleOne, newArticleOne).replace(oldArticleTwo, newArticleTwo);

const oldRows = '{x.f.map((v,i)=><button className="knowledge-row" key={v} onClick={()=>AT({title:v,short:"点击获得这一知识点的应用解释",deep:"把“"+v+"”转化为一个14天实验：只选择一个真实场景，明确可观察结果、唯一责任人、停止事项与复盘日期。记录证据，不评价态度。"})}><b>0{i+1}</b><span>{v}</span><i>点击浸润 →</i></button>)}';
const newRows = '{frameworks.map((v,i)=><button className="knowledge-row" key={v.title} onClick={()=>AT({title:v.title,short:v.source,deep:v.detail+" 可执行动作："+v.action})}><b>0{i+1}</b><span><strong>{v.title}</strong><small>{v.source}</small></span><i>点击浸润 →</i></button>)}';
const oldDetails = '{x.f.map((v,i)=><details key={v}><summary><span>0{i+1}</span>{v}</summary><p>把它转化为边界清晰、可观察、可复盘的小行动。</p></details>)}';
const newDetails = '{frameworks.map((v,i)=><details key={v.title}><summary><span>0{i+1}</span>{v.title}</summary><small>{v.source}</small><p>{v.detail}</p><b>可先做：{v.action}</b></details>)}';
if (!page.includes(oldRows) || !page.includes(oldDetails)) throw new Error("Framework UI anchors missing");
page = page.replace(oldRows, newRows).replace(oldDetails, newDetails);
await writeFile(pageFile, page);

let css = await readFile(cssFile, "utf8");
css += '.knowledge-row span strong{display:block;font-weight:500}.knowledge-row span small{display:block;margin-top:5px;color:var(--red);font:9px sans-serif;letter-spacing:.08em}.framework details>small{display:block;margin:10px 0 0 45px;color:var(--red);font:9px sans-serif;letter-spacing:.08em}.framework details>b{display:block;margin:12px 0 0 45px;color:var(--pine);font-size:13px}';
await writeFile(cssFile, css);
