"use client";
import {useEffect,useMemo,useState} from "react";
import {buildStrategyPaths,diagnosisQuestions,getState,resolveDiagnosis,type AnswerValue} from "../lib/zhidao-model";

type Screen="home"|"diagnose"|"map"|"system"|"history";
type RecordItem={date:string,hex:string,target:string,mode:string,progress:number,topic?:string,state?:string,risk?:string,pathName?:string,summary?:string};
const modes=[{name:"自动驾驶",desc:"系统在每个节点自动重新寻优"},{name:"半自动",desc:"目标变化时先请你确认"},{name:"手动锁定",desc:"终点不变，只重算路径"},{name:"静默陪伴",desc:"不主动打扰，打开时再更新"}];
const focusOptions=[
 {id:"people",label:"人不动",desc:"方向知道，但相关人没有真正开始行动。",profile:{action:"推进受阻",relation:"目标-执行",risk:"停滞"}},
 {id:"resource",label:"资源不够",desc:"不是不想做，而是人手、时间、能力或预算撑不住。",profile:{action:"资源错配",relation:"目标-资源",risk:"失焦"}},
 {id:"judgment",label:"判断不清",desc:"大家对什么最重要、谁来拍板、下一步看什么没有共识。",profile:{action:"信息失真",relation:"上下传导",risk:"失真"}},
 {id:"relation",label:"关系卡住",desc:"跨部门、上下级或责任边界让事情绕来绕去。",profile:{action:"责任悬置",relation:"横向协作",risk:"内耗"}}
];
const lenses=[
 {id:"execution",name:"执行推进",keys:["执行","推进","推不动","落地","交付","目标","进度"],hint:"这像是目标与行动之间的断点。"},
 {id:"resource",name:"资源能力",keys:["资源","人手","能力","预算","时间","支持","忙"],hint:"这像是供给、负荷与优先级之间的错位。"},
 {id:"relation",name:"协作关系",keys:["部门","协作","沟通","扯皮","配合","对齐","责任"],hint:"这像是关系接口和责任边界出现了摩擦。"},
 {id:"decision",name:"判断决策",keys:["决策","拍板","高层","反馈","一线","基层","信息"],hint:"这像是判断权与真实信息之间的传导问题。"},
 {id:"rule",name:"规则流程",keys:["流程","规则","审批","制度","合规","创新","试错"],hint:"这像是稳定机制压住了变化空间。"}
];

function BrandMark({className=""}:{className?:string}){return <svg className={`brand-mark ${className}`} viewBox="0 0 120 120" aria-hidden="true"><g fill="none" strokeLinecap="butt"><path className="mark-deep mark-wide" d="M28 0 L54 26 M66 38 L82 54 M94 66 L120 92"/><path className="mark-soft mark-thin" d="M0 28 L26 54 M38 66 L54 82 M66 94 L92 120"/><path className="mark-deep mark-wide" d="M0 92 L26 66 M38 54 L54 38 M66 26 L92 0"/><path className="mark-soft mark-thin" d="M28 120 L54 94 M66 82 L82 66 M94 54 L120 28"/></g><circle className="mark-dot" cx="60" cy="60" r="2.8"/></svg>}
function Trigram({code}:{code:string}){return <span className="trigram" aria-label={`卦象编码 ${code}`}>{code.split("").map((v,i)=><i className={v==="1"?"yang":"yin"} key={i}/>)}</span>}
const guaNames=["坤","剥","比","观","豫","晋","萃","否","谦","艮","蹇","渐","小过","旅","咸","遁","师","蒙","坎","涣","解","未济","困","讼","升","蛊","井","巽","恒","鼎","大过","姤","复","颐","屯","益","震","噬嗑","随","无妄","明夷","贲","既济","家人","丰","离","革","同人","临","损","节","中孚","归妹","睽","兑","履","泰","大畜","需","小畜","大壮","大有","夬","乾"];
function makeChangeScene(){const fromCode=Math.floor(Math.random()*64),moving=Math.floor(Math.random()*6),toCode=fromCode^(1<<moving),toLines=Array.from({length:6},(_,i)=>(toCode>>i)&1);return{from:guaNames[fromCode],to:guaNames[toCode],moving,toLines}}
function DynamicChange(){const[scene,setScene]=useState({from:"乾",to:"履",moving:2,toLines:[1,1,0,1,1,1]});useEffect(()=>{setScene(makeChangeScene());const timer=setInterval(()=>setScene(makeChangeScene()),4200);return()=>clearInterval(timer)},[]);return <div className="change-stage" aria-label="动态变卦演示"><div className="change-meta"><span>动态变卦 · 随机一爻</span><b>{scene.from}之{scene.to}</b><small>一次变卦，多种可能</small></div><div className="six-lines">{scene.toLines.map((v,i)=><i className={`${v?"yang":"yin"} ${i===scene.moving?"moving":""}`} key={`${scene.from}-${scene.to}-${i}`}><span/><span/></i>)}</div><em className="change-word change">变易</em><em className="change-word constant">不易</em><em className="change-word simple">简易</em><div className="change-caption"><span>本卦 · {scene.from}</span><i>第 {scene.moving+1} 爻变</i><span>之卦 · {scene.to}</span></div></div>}
function PathMetrics({metrics}:{metrics:{cost:number;resistance:number;speed:number;risk:number}}){return <div className="path-metrics">{[["代价",metrics.cost],["阻力",metrics.resistance],["见效",metrics.speed],["风险",metrics.risk]].map(([label,value])=><span key={label as string}><small>{label}</small><i><em style={{width:`${Number(value)*20}%`}}/></i><b>{value}/5</b></span>)}</div>}
function PathReason({path,isDefault}:{path:{recommendation:string;notFirst:string;prerequisite:string};isDefault?:boolean}){return <div className="path-reason"><p><b>{isDefault?"为什么默认推荐":"为什么暂不优先"}</b>{isDefault?path.recommendation:path.notFirst}</p><p><b>启动前提</b>{path.prerequisite}</p></div>}
function PathFeedback({index,path}:{index:number;path:{name:string;cost:string;prerequisite:string}}){const texts=["你选择了低代价快速验证路径。先不要追求完整解决，而是用一个小接口证明局面能动。","你选择了结构重构路径。它更有力度，但会触动责任、资源和协作边界，需要准备承压。","你选择了目标切换路径。这是高代价选择，建议先确认授权、共识和不可让渡的目标内核。"];return <div className="path-feedback"><small>当前选择反馈</small><b>{path.name} · {path.cost}</b><p>{texts[index]||texts[0]}</p><em>{path.prerequisite}</em></div>}
function ReportSummary({hex,inertia,path}:{hex:{name:string;title:string;symptom:string;inertiaTitle:string;warning:string};inertia:{name:string};path:{name:string;recommendation:string}}){return <div className="report-summary"><small>诊断报告摘要 V0.1</small><ol><li><b>当前状态</b><span>你现在更接近「{hex.name} · {hex.title}」：{hex.symptom}</span></li><li><b>最大风险</b><span>若不干预，容易滑向「{inertia.name} · {hex.inertiaTitle}」：{hex.warning}</span></li><li><b>建议先走</b><span>先走「{path.name}」：{path.recommendation}</span></li></ol></div>}
function StateExplain({answers,hex}:{answers:(AnswerValue|undefined)[];hex:{name:string;code:string}}){const tau=answers.find(a=>a?.tau!==undefined)?.tau??0,phase=answers.find(a=>a?.phase!==undefined)?.phase??0,delta=answers.find(a=>a?.delta!==undefined)?.delta??0;const items=[["先做什么",tau?"清障碍":"补动力"],["卡在哪里",phase?"跨界协同":"流程交接"],["信息从哪来",delta?"一线反馈":"上级拍板"]];return <div className="state-explain"><small>为什么是{hex.name} · 诊断状态可解释 V0.1</small><p>系统把三次选择翻译成三个管理判断，再组合成当前处境。</p><div>{items.map(([k,v])=><span key={k}><b>{k}</b><em>{v}</em></span>)}</div><i>本次编码：{items.map(([,v])=>v).join(" / ")} → {hex.name}（{hex.code}）</i></div>}
function getComplaintLens(topic:string){return lenses.find(l=>l.keys.some(k=>topic.includes(k)))||{id:"general",name:"组织困惑",hint:"先把这件事放进组织关系里看。"}}
function pickTag(topic:string,pairs:[string,string[]][],fallback:string){return pairs.find(([,keys])=>keys.some(k=>topic.includes(k)))?.[0]||fallback}
function buildComplaintProfile(topic:string,focusId?:string){
 const lens=getComplaintLens(topic);
 const focus=focusOptions.find(item=>item.id===focusId);
 return {
  lens,
  object:pickTag(topic,[["高层/决策层",["高层","老板","领导","决策","拍板"]],["一线/基层",["一线","基层","员工","现场"]],["跨部门协作",["部门","跨部门","协作","配合"]],["团队整体",["团队","组织","大家","成员"]]],"相关人群"),
  action:focus?.profile.action||pickTag(topic,[["推进受阻",["推不动","推进","落地","执行","进度"]],["责任悬置",["负责","责任","没人","归口"]],["信息失真",["反馈","信息","沟通","说不清"]],["资源错配",["资源","人手","预算","时间","忙"]],["规则压制",["流程","审批","规则","制度"]]],"问题动作"),
  relation:focus?.profile.relation||pickTag(topic,[["上下传导",["高层","基层","一线","反馈","下达"]],["横向协作",["部门","协作","配合","对齐","扯皮"]],["目标-执行",["目标","执行","落地","交付"]],["规则-创新",["规则","流程","创新","试错"]]],"组织关系"),
  risk:focus?.profile.risk||pickTag(topic,[["停滞",["推不动","停","拖","慢"]],["内耗",["内耗","冲突","扯皮","争"]],["失焦",["模糊","混乱","散","不清楚"]],["失真",["反馈","信息","过滤","感知"]],["僵化",["规则","流程","审批"]]],"待观察风险"),
  focus:focus?.label||"未补充"
 };
}
function tailorQuestions(topic:string){
 const lens=getComplaintLens(topic),short=topic.length>22?topic.slice(0,22)+"…":topic;
 return diagnosisQuestions.map(q=>{
  if(q.key==="tau")return {...q,title:`处理“${short}”，此刻更该先补动力，还是先清障碍？`,note:`${lens.hint} 第一问先判断管理动作的优先级：补目标、补资源、补共识，还是先清掉旧承诺、责任不清和内耗。`,options:[
   {...q.options[0],text:`先围绕“${short}”重建共同目标，让相关人重新看见方向`},
   {...q.options[1],text:`先给“${short}”补资源、能力或时间，否则推进只是口号`},
   {...q.options[2],text:`先清掉“${short}”背后的旧承诺和模糊责任，不然越推越乱`},
   {...q.options[3],text:`先处理“${short}”牵出的内耗和冲突，否则新动作会变形`}
  ]};
  if(q.key==="phase")return {...q,title:`“${short}”主要卡在流程交接，还是卡在跨部门/跨层级协同？`,note:`第二问看问题发生的位置：是上下游交接没接住，还是多个部门、多个层级之间互相牵制。`,options:[
   {...q.options[0],text:`“${short}”常卡在上下游交接处，谁接下一棒不清楚`},
   {...q.options[1],text:`“${short}”从目标到执行层层变形，理解不一致`},
   {...q.options[2],text:`“${short}”牵涉多个部门或层级，资源和判断难以对齐`},
   {...q.options[3],text:`大家表面支持“${short}”，但关键处会绕开或悬置`}
  ]};
  return {...q,title:`围绕“${short}”，真实判断现在主要从哪里来？`,note:`第三问看信息流向：是上级拍板仍占主导，还是一线事实正在反过来修正判断。`,options:[
   {...q.options[0],text:`主要等上方给“${short}”定方向，团队再执行`},
   {...q.options[1],text:`“${short}”方向看似明确，但真实反馈总是来得太晚`},
   {...q.options[2],text:`一线关于“${short}”的信号很多，但很难进入真正决策`},
   {...q.options[3],text:`基层已在围绕“${short}”自发调整，高层还没完全感知`}
  ]};
 });
}

export default function Home(){
 const[screen,setScreen]=useState<Screen>("home"),[step,setStep]=useState(-1),[complaint,setComplaint]=useState(""),[focus,setFocus]=useState(""),[answers,setAnswers]=useState<(AnswerValue|undefined)[]>([]),[path,setPath]=useState(0),[mode,setMode]=useState(1),[records,setRecords]=useState<RecordItem[]>([]),[saved,setSaved]=useState(false);
 useEffect(()=>{try{setRecords(JSON.parse(localStorage.getItem("linxia-fskn-records")||"[]"))}catch{}},[]);
 const hex=useMemo(()=>resolveDiagnosis(answers),[answers]);
 const inertia=getState(hex.inertiaId);
 const targetPaths=useMemo(()=>buildStrategyPaths(hex),[hex]);
 const chosen=targetPaths[path]||targetPaths[0];
 const topic=complaint.trim()||"这件说不清的组织困惑";
 const lens=getComplaintLens(topic);
 const profile=buildComplaintProfile(topic,focus);
 const activeQuestions=useMemo(()=>tailorQuestions(topic),[topic]);
 const evidence=activeQuestions.map((question,index)=>{
  const selected=answers[index];
  const option=question.options.find(item=>{
   if(!selected)return false;
   if(item.value.tau!==undefined)return selected.tau===item.value.tau;
   if(item.value.phase!==undefined)return selected.phase===item.value.phase;
   return selected.delta===item.value.delta;
  });
  return {question,option};
 });
 const nav=(s:Screen)=>{setScreen(s);scrollTo(0,0)};
 function start(){setStep(-1);setFocus("");setAnswers([]);setPath(0);setSaved(false);nav("diagnose")}
 function submitComplaint(){setComplaint(topic);setStep(-2)}
 function chooseFocus(id:string){setFocus(id);setStep(0)}
 function answer(value:AnswerValue){let next=[...answers];next[step]=value;setAnswers(next);if(step<2)setStep(step+1);else nav("map")}
 function save(){if(saved)return;const item={date:new Date().toLocaleDateString("zh-CN"),hex:hex.name+" · "+hex.title,target:chosen.target+" · "+chosen.name+" · "+topic,mode:modes[mode].name,progress:33,topic,state:`当前状态：${hex.name} · ${hex.title}。${hex.symptom}`,risk:`最大风险：${inertia.name} · ${hex.inertiaTitle}。${hex.warning}`,pathName:chosen.name,summary:`建议先走「${chosen.name}」：${chosen.recommendation}`};let next=[item,...records].slice(0,12);setRecords(next);setSaved(true);localStorage.setItem("linxia-fskn-records",JSON.stringify(next))}
 return <main>
  <header className="top"><button className="brand" onClick={()=>nav("home")}><BrandMark className="brand-symbol"/><span><b>知道 · 管理</b><small>林下问路｜网罟天下，以佃以渔</small></span></button><nav><button onClick={start}>处境诊断</button><button onClick={()=>nav("system")}>方法体系</button><button onClick={()=>nav("history")}>演化记录 <i>{records.length}</i></button></nav></header>
  {screen!=="home"&&<div className="subnav"><button onClick={()=>nav("home")}>← 林下入口</button><ol>{["知境","见势","择路","迭代"].map((x,i)=><li className={(screen==="diagnose"&&i<=0)||(screen==="map"&&i<=2)||(screen==="history")?"on":""} key={x}><span>0{i+1}</span>{x}</li>)}</ol><b>FSKN / V6.0</b></div>}

  {screen==="home"&&<><section className="hero"><div className="hero-left"><div className="hero-brand"><BrandMark className="hero-symbol"/><div><b>林下问路</b><small>ZHIDAO MANAGEMENT</small></div></div><p className="eyebrow">林下问路 · 组织处境诊断与动态推演</p><h1>知境，<br/><em>而后知道。</em></h1><p className="lead">以关系结构为镜，以管理实践为用。<br/>看见现在在哪里，不改变会去哪里，以及下一爻可以怎样动。</p><div className="actions"><button className="primary" onClick={start}>开始三问诊断 <span>↗</span></button><button className="link" onClick={()=>nav("system")}>先了解方法体系</button></div><div className="promise"><span>01 三问知境</span><span>02 动态变卦</span><span>03 三路寻优</span></div></div><DynamicChange/></section>
  <section className="triple"><div className="section-title"><p className="eyebrow">三卦路径沙盘</p><h2>不是一条静态路线，<br/>而是持续修正的航向。</h2></div>{[["现状之卦","极简自拍","把三次选择编码成当下处境"],["惯性之卦","默认趋势","推演非干预状态下的自然滑向"],["目标之卦","期望终点","比较代价，选择当前更好的归宿"]].map((v,i)=><article key={v[0]}><span>0{i+1}</span><h3>{v[0]}</h3><b>{v[1]}</b><p>{v[2]}</p><i/></article>)}</section>
  <section className="engine"><aside><p className="eyebrow">四层策略引擎</p><h2>古典意象在表，<br/>离散结构在里。</h2><p>从五行的关系空间，到八卦的瞬时处境、六十四卦的情境议题，再到易林的演化建议。用户不必理解数学，也能获得可解释的判断。</p><button className="light" onClick={()=>nav("system")}>查看完整映射 →</button></aside><div>{[["0","五行","管理的基本关系"],["1","八卦","八种基础处境"],["2","六十四卦","六十四种情境议题"],["3","易林","变化中的操作线索"]].map(v=><article key={v[0]}><small>LEVEL {v[0]}</small><b>{v[1]}</b><p>{v[2]}</p></article>)}</div></section></>}

  {screen==="diagnose"&&<section className="diagnose"><aside><p className="eyebrow">{step===-1?"第零问 · 主诉":step===-2?"补一问 · 校准":"三变即三问"}</p><h1>先把困惑放下，<br/>再一起问路。</h1><p>{step===-1?"不必完整描述背景。只要写下此刻最卡住、最反复、最说不清的一件事。":step===-2?"先补一个最小判断：这不是正式诊断，只是帮系统把主诉画像校准一点。":`系统已识别为「${lens.name}」语境，三问会围绕你的主诉展开，并写入 S₈ 状态表。`}</p>{step>=-2&&step!==-1&&<div className="profile-mini"><small>主诉画像标签</small><span><b>对象</b>{profile.object}</span><span><b>动作</b>{profile.action}</span><span><b>关系</b>{profile.relation}</span><span><b>风险</b>{profile.risk}</span></div>}<div className="progress"><span style={{width:`${step===-1?12:step===-2?25:(step+1)/3*100}%`}}/></div><small>{step===-1?"0 / 3":step===-2?"校准 / 3":`${step+1} / 3`}</small></aside>{step===-1?<div className="question complaint"><p className="eyebrow">主诉 · 围绕真实问题诊断</p><h2>此刻最困扰你的组织问题是什么？</h2><textarea value={complaint} onChange={e=>setComplaint(e.target.value)} placeholder="例如：目标很清楚，但团队总是推不动；几个部门都很忙，却没人愿意真正负责；我感觉组织哪里不对，但说不清。" autoFocus/><div className="complaint-tips"><span>一句话即可</span><span>可以很模糊</span><span>后面三问会帮你定位</span></div><button className="primary" onClick={submitComplaint}>先补一问，再进入三问 <span>↗</span></button></div>:step===-2?<div className="question followup"><p className="eyebrow">主诉画像 · 快速校准</p><h2>这件事最先卡住的是哪里？</h2><p>选择一个最接近的入口即可。选错也没关系，后面的三问会继续修正判断。</p><div className="options">{focusOptions.map((x,i)=><button onClick={()=>chooseFocus(x.id)} key={x.id}><span>{String.fromCharCode(65+i)}</span><b>{x.label}</b><small>{x.desc}</small><i>校准画像 →</i></button>)}</div><button className="back" onClick={()=>setStep(-1)}>← 修改主诉</button></div>:<div className="question"><p className="eyebrow">{activeQuestions[step].label} · {lens.name}</p><h2>{activeQuestions[step].title}</h2><p>{activeQuestions[step].note}</p><small className="axis">{activeQuestions[step].axis}</small><div className="options">{activeQuestions[step].options.map((x,i)=><button onClick={()=>answer(x.value)} key={x.text}><span>{String.fromCharCode(65+i)}</span><b>{x.text}</b><small>{x.evidence}</small><i>写入状态 →</i></button>)}</div>{step>0&&<button className="back" onClick={()=>setStep(step-1)}>← 返回上一问</button>}{step===0&&<button className="back" onClick={()=>setStep(-2)}>← 返回补一问</button>}</div>}</section>}

  {screen==="map"&&<section className="map-page"><div className="report-head"><p className="eyebrow">主诉诊断报告 · V0.5</p><span>STATE / S₈-{hex.id} / {hex.code}</span><h1>围绕这件事，先判断你在哪里。</h1><blockquote>{topic}</blockquote><div className="profile-card"><small>主诉画像 V0.3 · 诊断标签</small><p>这些不是按钮，而是系统对你主诉的初步理解：它们说明系统会从哪个管理角度继续提问。</p><span><b>问题类型</b>{profile.lens.name}</span><span><b>最先卡点</b>{profile.focus}</span><span><b>相关对象</b>{profile.object}</span><span><b>问题动作</b>{profile.action}</span><span><b>组织关系</b>{profile.relation}</span><span><b>风险倾向</b>{profile.risk}</span></div><ReportSummary hex={hex} inertia={inertia} path={chosen}/><StateExplain answers={answers} hex={hex}/></div><div className="report-grid"><article className="report-main"><small>现状判断</small><div><Trigram code={hex.code}/><b>{hex.name}</b></div><h2>{hex.title}</h2><p>{hex.symptom}</p><p>{hex.explanation}</p></article><article className="report-proof"><small>判断依据</small><h2>三问写入 S₈ 状态表</h2><ul>{evidence.map(({question,option},i)=><li key={question.key}><span>0{i+1}</span><div><b>{question.axis}</b><p>{option?.text||"尚未回答"}</p><small>{option?.evidence||"系统按默认状态推导。"}</small></div></li>)}</ul></article><article className="report-inertia"><small>如果不干预</small><div><Trigram code={inertia.code}/><b>{inertia.name}</b></div><h2>{hex.inertiaTitle}</h2><p>{hex.warning}</p></article><article className="report-recommend"><small>默认推荐路径</small><h2>{chosen.name} · {chosen.cost}</h2><p>{chosen.desc}</p><PathMetrics metrics={chosen.metrics}/><PathReason path={chosen} isDefault/><em>{chosen.rationale}</em></article></div><div className="insight-panel"><article><small>常见组织症状</small><h2>这类处境通常长这样</h2><ul>{hex.patterns.map(item=><li key={item}>{item}</li>)}</ul></article><article><small>容易误判</small><h2>不要把表象当病因</h2><p>{hex.misread}</p></article><article className="avoid"><small>此刻勿做</small><h2>{hex.avoid}</h2><p>先停止会放大惯性的动作，再谈新增动作。</p></article><article className="first-action"><small>第一行动</small><h2>{hex.firstAction}</h2><p>第一步必须小、清楚、可观察；它不是最终方案，而是下一次判断的证据。</p></article></div><div className="map-head compact"><p className="eyebrow">三卦路径沙盘 · 本次诊断</p><h1>{hex.title}</h1><p>报告先给出可执行判断；沙盘用于比较“现在、惯性、目标”三者之间的关系。</p></div><div className="three-hex"><article className="current"><small>现状之卦 · S₈</small><div><Trigram code={hex.code}/><b>{hex.name}</b></div><h2>{hex.title}</h2><p>{hex.explanation}</p></article><i>不干预 →</i><article className="inertia"><small>惯性之卦 · 默认趋势</small><div><Trigram code={inertia.code}/><b>{inertia.name}</b></div><h2>{hex.inertiaTitle}</h2><p>{hex.warning}</p></article><i>主动选择 →</i><article className="target"><small>目标之卦 · 期望终点</small><div><Trigram code={chosen.targetCode}/><b>{chosen.target}</b></div><h2>{chosen.name}</h2><p>{chosen.desc}</p></article></div>
  <div className="path-pick"><div><p className="eyebrow">三条推荐路径 · P₄₀₉₆ 雏形</p><h2>你愿意承担哪一种改变？</h2></div><section>{targetPaths.map((p,i)=><button className={i===path?"selected":""} onClick={()=>setPath(i)} key={p.tag}><span>{p.tag}</span><div><b>{p.name}</b><small>{p.cost}</small><p>{p.desc}</p><PathMetrics metrics={p.metrics}/><PathReason path={p} isDefault={i===0}/><em>{p.rationale}</em></div><i>{i===path?"已选择":"比较此路"}</i></button>)}</section><PathFeedback index={path} path={chosen}/></div>
  <div className="roadbook"><aside><p className="eyebrow">从 {hex.name} 到 {chosen.target}</p><h2>14 天第一段路书</h2><p>针对“{topic}”，先抵达下一个可观测节点，而不是一次性给出完整方案。</p></aside><ol>{chosen.moves.map((x,i)=><li key={x}><span>0{i+1}</span><b>{x}</b><small>{["今天","7 天内","14 天内"][i]}</small></li>)}</ol><div className="gate"><small>收敛闸门</small><span><i/>主诉变清楚</span><span><i/>行动 ≤ 2 步</span><span><i/>风险信号转弱</span></div></div>
  <div className="mode"><div><p className="eyebrow">控制权在你</p><h2>下一次变化发生时，系统怎样陪你？</h2></div><div>{modes.map((m,i)=><button className={mode===i?"on":""} onClick={()=>setMode(i)} key={m.name}><b>{m.name}</b><small>{m.desc}</small></button>)}</div><button className="primary" onClick={save}>{saved?"本次路径已存档 ✓":"确认路径，进入第一次迭代"}</button></div></section>}

  {screen==="system"&&<section className="system"><div className="system-hero"><p className="eyebrow">知道管理 · 方案总览</p><h1>以关系为体，<br/>以管理实践为用。</h1><p>这套方案把组织看作一个持续变化的关系网络。它的工作不是给复杂现实贴标签，而是把当下状态、默认趋势与可选目标放进同一个可计算、可讨论的框架。</p></div><div className="axioms">{[["八卦","八种基础处境","三问先把复杂组织压缩成八种可辨认的基础姿态：乾、兑、离、震、巽、坎、艮、坤，用来回答“我现在在哪”。"],["六十四卦","八种处境的上下复合","把一个基础处境放在上层，再把另一个基础处境放在下层，形成 8 × 8 的六十四种情境议题，用来解释“为什么会这样”。"],["4096 种变卦","六十四卦之间的可达变化","任一现状卦都可能转向任一目标卦，形成 64 × 64 = 4096 条演化关系，用来比较“不变会怎样、改变往哪走、先动哪一爻”。"]].map(v=><article key={v[0]}><small>{v[0]}</small><h2>{v[1]}</h2><p>{v[2]}</p></article>)}</div><div className="math-kernel"><aside><p className="eyebrow">数学内核 · M-1.0</p><h2>从可观测三问，<br/>进入可计算演化。</h2><p>以 FSKN 数学体系为本体，把组织处境映射为离散状态空间、非交换演化和自适应控制问题。</p></aside><div>{[["状态空间","S₈","三种正交的二相管理行为，组成八种基础组织状态。"],["映射空间","M₆₄","现状状态与参照状态成对编码，形成六十四种情境议题。"],["演化空间","P₄₀₉₆","任一现状卦到任一目标卦皆为一条可比较的路径，支持代价、风险和中继点计算。"],["控制策略","π*","在惯性驱动力与干预控制力之间寻优，持续修正下一步动作。"]].map(v=><article key={v[0]}><small>{v[0]}</small><b>{v[1]}</b><p>{v[2]}</p></article>)}</div></div><div className="system-map"><aside><p className="eyebrow">产品闭环</p><h2>诊断不是终点，<br/>而是进入深度内容与持续问答的入口。</h2></aside><div>{[["诊断","我现在在哪","三问 → 八种处境"],["议题","为什么会这样","六十四种情境 · 七层阅读"],["问答","下一步怎么走","三锚点 · 200字行动指令"],["迭代","目标还对不对","内层修路 · 外层换靶"]].map((v,i)=><article key={v[0]}><span>0{i+1}</span><b>{v[0]}</b><h3>{v[1]}</h3><p>{v[2]}</p></article>)}</div></div><div className="principles"><p className="eyebrow">三重承诺</p><div><article><b>可解释</b><p>每一个判断都能回到三问、三卦与路径代价。</p></article><article><b>可选择</b><p>系统给出多条路线，目标与陪伴模式由用户决定。</p></article><article><b>可更新</b><p>变化后重新计算，旧答案不会永久定义组织。</p></article></div></div><button className="primary center" onClick={start}>从三问进入系统 <span>↗</span></button></section>}

  {screen==="history"&&<section className="history"><div className="section-title"><p className="eyebrow">演化记录 · 仅保存在此设备</p><h1>每次变卦，<br/>都是重新出发。</h1><p>这里记录的是判断如何更新，不是一个固定不变的组织画像。V0.1 会保存主诉、摘要和当时选择的路径。</p></div>{records.length?<div className="records enhanced">{records.map((r,i)=><article key={i}><time>{r.date}</time><div className="record-core"><small>本次主诉</small><b>{r.topic||"早期诊断记录"}</b><p>{r.summary||r.target}</p></div><span>→</span><div className="record-detail"><small>报告摘要</small><p>{r.state||`本卦：${r.hex}`}</p><p>{r.risk||`目标之卦：${r.target}`}</p><em>{r.pathName?`推荐路径：${r.pathName}`:`陪伴模式：${r.mode}`}</em></div><div className="record-progress"><i><em style={{width:`${r.progress}%`}}/></i><small>第 1 / 3 个中继节点 · {r.mode}</small></div></article>)}</div>:<div className="empty"><BrandMark className="empty-symbol"/><h2>尚未开始第一次演化</h2><p>完成三问并选择一条目标路径后，本次判断会留在这里。</p><button className="primary" onClick={start}>开始三问诊断</button></div>}</section>}
  <footer><div><BrandMark className="footer-symbol"/><span><b>知道 · 管理</b><small>林下问路</small></span></div><p>网罟天下，以佃以渔</p><span>知境，而后知道。</span></footer>
 </main>
}
