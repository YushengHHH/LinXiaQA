export type YilinEntry={id:string;base:string;change:string;text:string};
const DOMAIN:Record<string,string[]>={
"团队":["人","众","友","同","合","和","争","离","信","言","家"],
"方向":["道","行","往","来","山","川","门","望","明","昏","天"],
"执行":["车","足","行","止","成","功","利","困","阻","门","田"],
"个人":["心","身","君","子","德","忧","喜","病","目","言","志"],
"外部":["风","雨","雷","水","火","天","地","国","王","灾","变"]};
const THEMES=[
{re:/阻|塞|閉|困|蹇|難|險|不得|不通/,t:"在受阻处重建通道"},
{re:/爭|鬭|戰|讎|怨|傷/,t:"把冲突转为可工作的分歧"},
{re:/迷|惑|昏|暗|失|亡/,t:"在失序中重新辨认方向"},
{re:/合|同|友|婚|和|比/,t:"让关系重新形成共同承担"},
{re:/行|車|馬|足|道路|往/,t:"让行动重新获得回声"},
{re:/風|雨|雷|水|火|變/,t:"在变化中保留可逆的行动"},
{re:/福|喜|安|利|成|得/,t:"把有利窗口转为组织能力"}];
function hash(s:string){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h>>>0}
function overlap(text:string,words:string[]){let n=0;for(const w of words)if(text.includes(w))n++;return n}
export function titleFor(e:YilinEntry,domain:string){const theme=THEMES.find(v=>v.re.test(e.text))?.t||"从旧惯性中看见新的位置";return domain+"｜"+theme}
export function matchYilin(data:YilinEntry[],input:{domain:string;query:string;answers:string[];mode:string;history:string[]}){
 const signal=[input.domain,input.query,...input.answers,input.mode,...input.history.slice(0,3)].join("|");
 const home=hash(signal)&4095;
 const words=[...(DOMAIN[input.domain]||[]),...Array.from(new Set((input.query+input.answers.join("")).replace(/[，。！？、\s]/g,""))).slice(0,18)];
 const candidates=Array.from({length:16},(_,i)=>(home+Math.imul(i,257))&4095);
 const scored=candidates.filter(index=>index!==home).map(index=>({index,score:overlap(data[index]?.text||"",words)}));
 scored.sort((a,b)=>b.score-a.score||a.index-b.index);
 return {index:home,alternatives:scored.slice(0,4).map(v=>v.index),fingerprint:home,reason:"自然语言、三题选择、诊断模式与历史轨迹共同形成12位处境指纹；再以领域词与林辞意象重排候选。"};
}