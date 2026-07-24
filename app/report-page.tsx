"use client";

import {
  getTrigramState,
  hexagramStates,
  lineActionMap,
  resolveDiagnosis,
  type AnswerValue,
  type DerivedHexagram,
  type HexagramState,
  type LineActionTemplate,
  type M64StrategyPath,
} from "../lib/zhidao-model";
import type { RecordItem } from "../lib/revisit-model";

function HexagramMark({
  name,
  upper,
  lower,
  code,
}: {
  name: string;
  upper: string;
  lower: string;
  code: string;
}) {
  const up = getTrigramState(upper),
    down = getTrigramState(lower);
  return (
    <span
      className="hexagram-mark"
      aria-label={`${name} ${upper}上${lower}下 ${code}`}
    >
      <b>{name}</b>
      <em>
        {up.symbol}
        {down.symbol}
      </em>
      <span>
        {[...up.lines, ...down.lines].map((v, i) => (
          <i className={v} key={i} />
        ))}
      </span>
    </span>
  );
}

function PathMetrics({
  metrics,
}: {
  metrics: { cost: number; resistance: number; speed: number; risk: number };
}) {
  return (
    <div className="path-metrics">
      {[
        ["代价", metrics.cost],
        ["阻力", metrics.resistance],
        ["见效", metrics.speed],
        ["风险", metrics.risk],
      ].map(([label, value]) => (
        <span key={label as string}>
          <small>{label}</small>
          <i>
            <em style={{ width: `${Number(value) * 20}%` }} />
          </i>
          <b>{value}/5</b>
        </span>
      ))}
    </div>
  );
}
function PathReason({
  path,
  isDefault,
}: {
  path: { recommendation: string; notFirst?: string; prerequisite: string };
  isDefault?: boolean;
}) {
  return (
    <div className="path-reason">
      <p>
        <b>{isDefault ? "为什么默认推荐" : "为什么暂不优先"}</b>
        {isDefault ? path.recommendation : path.notFirst || path.recommendation}
      </p>
      <p>
        <b>启动前提</b>
        {path.prerequisite}
      </p>
    </div>
  );
}
function PathFeedback({
  path,
}: {
  path: { name: string; cost: string; prerequisite: string };
}) {
  const texts: { [key: string]: string } = {
    顺势微调:
      "你选择了低代价快速验证路径。先不要追求完整解决，而是用一个小接口证明局面能动。",
    重构跃迁:
      "你选择了结构重构路径。它更有力度，但会触动责任、资源和协作边界，需要准备承压。",
    理想靶心:
      "你选择了目标切换路径。这是高代价选择，建议先确认授权、共识和不可让渡的目标内核。",
  };
  return (
    <div className="path-feedback">
      <small>当前选择反馈</small>
      <b>
        {path.name} · {path.cost}
      </b>
      <p>{texts[path.name] || texts.顺势微调}</p>
      <em>{path.prerequisite}</em>
    </div>
  );
}
function ActionMapping({ actions }: { actions: LineActionTemplate[] }) {
  return (
    <div className="action-mapping">
      <small>M₆₄ 路径行动映射 V0.1</small>
      {actions.map((action) => (
        <article key={action.line}>
          <span>第{action.line}爻</span>
          <div>
            <b>{action.name}</b>
            <p>{action.diagnosis}</p>
            <em>先做：{action.firstAction}</em>
            <i>证据：{action.evidence}</i>
            <i>勿做：{action.avoid}</i>
          </div>
        </article>
      ))}
    </div>
  );
}
function ActionFeedback({
  feedback,
  setFeedback,
  nextReview,
}: {
  feedback: string;
  setFeedback: (v: string) => void;
  nextReview: string;
}) {
  return (
    <div className="feedback-loop">
      <aside>
        <p className="eyebrow">M₆₄ 行动反馈闭环 V0.1</p>
        <h2>做完以后，回来写一笔。</h2>
        <p>
          闭环不是写总结，而是留下三类证据：做了什么、局面有没有动、下一次复诊要看什么。
        </p>
      </aside>
      <div>
        <label>行动反馈</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="例如：我暂停了一个反复拉扯的协调会，改成由一个责任人收口；一线反馈更具体了，但资源冲突还没有解决。"
        />
        <div className="feedback-tags">
          <span>做了什么</span>
          <span>看见什么证据</span>
          <span>还卡在哪里</span>
        </div>
        <p>
          <b>建议复诊点</b>
          {nextReview}
        </p>
      </div>
    </div>
  );
}

function ReportSummary({
  currentHex,
  psychHex,
  structHex,
  targetHex,
  hex,
  path,
}: {
  currentHex: {
    name: string;
    situationTitle: string;
    upper: { name: string };
    lower: { name: string };
  };
  psychHex: DerivedHexagram;
  structHex: DerivedHexagram;
  targetHex: DerivedHexagram;
  hex: { name: string; title: string };
  path: { name: string; recommendation: string };
}) {
  return (
    <div className="report-summary">
      <small>诊断报告摘要 V0.5 · M₆₄ 主报告</small>
      <ol>
        <li>
          <b>主诊断卦</b>
          <span>
            当前主判断是「{currentHex.name} · {currentHex.situationTitle}」，即
            {currentHex.upper.name}上{currentHex.lower.name}下。
          </span>
        </li>
        <li>
          <b>双重惯性</b>
          <span>
            心理卦为「{psychHex.to.name}」，事理卦为「{structHex.to.name}
            」；二者都从 M₆₄ 六爻现状卦推得。
          </span>
        </li>
        <li>
          <b>目标与路径</b>
          <span>
            目标卦为「{targetHex.to.name}」，建议先走「{path.name}」：
            {path.recommendation} 基础态「{hex.name}」仅作底层参考。
          </span>
        </li>
      </ol>
    </div>
  );
}
function DerivedHexCard({ item }: { item: DerivedHexagram }) {
  const cls =
    item.type === "psychological"
      ? "report-psych"
      : item.type === "target"
        ? "report-target"
        : "report-struct";
  return (
    <article className={cls}>
      <small>{item.title} · M₆₄ V0.1</small>
      <div>
        <HexagramMark
          name={item.to.name}
          upper={item.to.upper.name}
          lower={item.to.lower.name}
          code={item.to.code}
        />
      </div>
      <h2>{item.question}</h2>
      <p>{item.reading}</p>
      <em className="risk-tone">{item.rationale}</em>
      <span className="risk-total">
        变爻：{item.changedLines.map((line) => `第${line}爻`).join("、")}
      </span>
    </article>
  );
}
function RevisitCompare({
  record,
  currentHex,
  risk,
  taskImpact,
}: {
  record: RecordItem;
  currentHex: {
    name: string;
    situationTitle: string;
    lines: ("yang" | "yin")[];
  };
  risk: { key: string; label: string };
  taskImpact?: { delta: number; notes: string[] };
}) {
  const oldHex =
    (record.hex || record.state || "").split(" · ")[0] || "上次状态";
  const oldState = hexagramStates.find((item) => item.name === oldHex);
  const oldRisk =
    record.risk?.match(/风险强度：([^。]+)/)?.[1] || "上次风险未记录";
  const moved = oldHex !== currentHex.name;
  const feedback = record.feedback?.trim();
  const riskTone =
    risk.key === "high"
      ? "风险仍在高位，先止损再优化。"
      : risk.key === "mid"
        ? "风险仍在积累，需要看行动证据是否变强。"
        : "风险已有缓和迹象，可以用小动作继续验证。";
  const diffs = oldState
    ? currentHex.lines
        .map((line, index) => ({
          line: index + 1,
          from: oldState.lines[index],
          to: line,
          action: lineActionMap[(index + 1) as 1 | 2 | 3 | 4 | 5 | 6],
        }))
        .filter((item) => item.from !== item.to)
    : [];
  const weaker = diffs.filter((item) => item.to === "yin").length;
  const stronger = diffs.filter((item) => item.to === "yang").length;
  const pathDecision =
    risk.key === "high" || weaker >= 2
      ? {
          name: "目标重构",
          tone: "升级路径",
          reason:
            "风险仍高或多层转弱，原路径不足以承接，需要重估目标、授权与资源边界。",
        }
      : weaker === 1
        ? {
            name: "重点校正",
            tone: "换路校正",
            reason:
              "有一个关键爻位转弱，说明原动作需要联动一个管理层面，不宜只做单点观察。",
          }
        : stronger > 0
          ? {
              name: "顺势微调",
              tone: "降阶巩固",
              reason:
                "已有爻位转强，说明行动开始产生证据，先用低代价动作巩固变化。",
            }
          : {
              name: record.pathName || "顺势微调",
              tone: "继续观察",
              reason:
                "六爻结构暂未明显变化，先保留原路径，但下一轮必须补足行动证据。",
            };
  const pivot = diffs[0]?.action;
  const recalcMoves =
    pathDecision.name === "目标重构"
      ? [
          "今天：暂停一个会继续放大风险的旧动作",
          "7 天内：重新确认目标、授权和资源取舍",
          "14 天内：只保留一条可验证的新路径",
        ]
      : pathDecision.name === "重点校正"
        ? [
            `今天：围绕「${pivot?.name || "关键卡点"}」补一次事实取证`,
            `7 天内：联动一个相邻管理层面，明确责任接口`,
            `14 天内：复盘新证据，决定是否继续换路`,
          ]
        : pathDecision.name === "顺势微调"
          ? [
              `今天：保留已经有效的小动作，不急着扩大`,
              `7 天内：围绕「${pivot?.name || "转强层面"}」补一条验证证据`,
              `14 天内：若信号稳定，再扩大到第二个接口`,
            ]
          : [
              "今天：补写上次行动事实",
              "7 天内：观察同一爻位是否出现新证据",
              "14 天内：再决定继续原路还是换路",
            ];
  const verdict = diffs.length
    ? `爻变：${diffs.map((item) => `第${item.line}爻`).join("、")}`
    : moved
      ? "换卡点"
      : "同卦延续";
  const conclusion =
    taskImpact && taskImpact.delta > 0
      ? `任务状态把复诊强度上调 ${taskImpact.delta}：说明还有未完成或出现新变化的任务，风险暂不宜判定为下降。`
      : taskImpact && taskImpact.delta < 0
        ? `任务状态把复诊强度下调 ${Math.abs(taskImpact.delta)}：说明已有任务完成，原阻滞有所松动，但仍需看六问证据。`
        : "本次主要依据六问与爻级变化判断，任务状态暂未明显改变权重。";
  return (
    <div className={`revisit-compare ${moved ? "moved" : "stable"}`}>
      <small>M₆₄ 复诊结论差异提示 V0.1</small>
      <div>
        <span>
          <b>上次主卦</b>
          {oldHex}
        </span>
        <i>{moved ? "→" : "≈"}</i>
        <span>
          <b>本次主卦</b>
          {currentHex.name}
        </span>
        <em>{verdict}</em>
      </div>
      <p>
        {diffs.length
          ? `这次具体变化落在${diffs.map((item) => `「${item.action.name}」`).join("、")}。系统据此重算路径：${pathDecision.tone}，建议转入「${pathDecision.name}」，并同步改写下一段行动。`
          : moved
            ? `主诊断已从「${oldHex}」转向「${currentHex.name}」，但暂未定位到可反查的爻级差异，先按换卡点处理。`
            : `本次仍接近「${currentHex.name}」，六爻结构也没有明显变化，重点要看上次行动有没有产生证据。`}
      </p>
      <div className="conclusion-diff">
        <b>这次和上次相比</b>
        <span>
          {oldRisk} → {risk.label}
        </span>
        <span>
          {record.pathName && record.pathName !== pathDecision.name
            ? `路径从「${record.pathName}」转向「${pathDecision.name}」`
            : `路径判断：${pathDecision.name}`}
        </span>
        <em>{conclusion}</em>
      </div>
      {diffs.length > 0 && (
        <ol className="line-diff">
          {diffs.map((item) => (
            <li key={item.line}>
              <span>第{item.line}爻</span>
              <div>
                <b>{item.action.name}</b>
                <p>
                  {item.from === "yin" ? "上次偏弱" : "上次可承接"} →{" "}
                  {item.to === "yin" ? "本次偏弱" : "本次可承接"}
                </p>
                <small>
                  {item.to === "yang"
                    ? `这一层正在恢复承接力：${item.action.evidence}`
                    : `这一层转弱或仍弱：${item.action.diagnosis}`}
                </small>
              </div>
            </li>
          ))}
        </ol>
      )}
      <div className="path-recalc">
        <small>路径重算</small>
        <b>
          {pathDecision.tone} · {pathDecision.name}
        </b>
        <p>{pathDecision.reason}</p>
        <em>
          上次路径：{record.pathName || "未记录"}；本次建议：{pathDecision.name}
        </em>
        <ol className="action-rewrite">
          {recalcMoves.map((move, index) => (
            <li key={move}>
              <span>0{index + 1}</span>
              <b>{move}</b>
            </li>
          ))}
        </ol>
      </div>
      <ul>
        <li>
          <b>风险变化</b>
          <span>
            {oldRisk} → {risk.label}。{riskTone}
          </span>
        </li>
        <li>
          <b>行动反馈</b>
          <span>
            {feedback
              ? `上次记录：“${feedback}”`
              : "上次还没有记录行动反馈，本次复诊只能先比较卦象与风险。"}
          </span>
        </li>
        <li>
          <b>复诊判断</b>
          <span>
            {feedback
              ? "把反馈与新行动对照：若行动层对应爻位转强，先巩固；若转弱，立刻换动作或换路。"
              : "建议本次保存时补写行动反馈，下一轮才能判断新动作是否撬动了对应爻位。"}
          </span>
        </li>
      </ul>
    </div>
  );
}

function StateExplain({
  answers,
  hex,
  currentHex,
}: {
  answers: (AnswerValue | undefined)[];
  hex: { name: string; code: string };
  currentHex: {
    name: string;
    code: string;
    upper: { name: string };
    lower: { name: string };
  };
}) {
  const tau = answers.find((a) => a?.tau !== undefined)?.tau ?? 0,
    phase = answers.find((a) => a?.phase !== undefined)?.phase ?? 0,
    delta = answers.find((a) => a?.delta !== undefined)?.delta ?? 0;
  const items = [
    ["三问基础态", hex.name],
    ["六问现状卦", currentHex.name],
    ["上下结构", `${currentHex.upper.name}上${currentHex.lower.name}下`],
  ];
  return (
    <div className="state-explain">
      <small>报告结构统一为 M₆₄ V0.1</small>
      <p>
        本报告以六问生成的 M₆₄ 六爻卦作为唯一主诊断。S₈
        三爻卦只保留为底层基础态，用来解释“为什么会偏向这个方向”，不再和主卦并列争夺结论。
      </p>
      <div>
        {items.map(([k, v]) => (
          <span key={k}>
            <b>{k}</b>
            <em>{v}</em>
          </span>
        ))}
      </div>
      <i>
        读取顺序：先看 M₆₄ 主卦 → 再看六爻卡点 → 最后把 S₈ 当作底层倾向参考。
      </i>
    </div>
  );
}
const lineNames: { [key: number]: { name: string; focus: string } } = {
  1: { name: "初爻 · 基层活力", focus: "真正做事的人是否还愿意动" },
  2: { name: "二爻 · 资源韧性", focus: "人、时间、能力和预算是否撑得住" },
  3: { name: "三爻 · 运营效率", focus: "目标是否变成清楚交付" },
  4: { name: "四爻 · 管理铰链", focus: "接口、责任和反馈是否接得住" },
  5: { name: "五爻 · 战略决策", focus: "目标、优先级和资源是否落位" },
  6: { name: "上爻 · 外部环境", focus: "外部变化是否改写原判断" },
};
function SixLineExplain({
  evidence,
}: {
  evidence: {
    question: { axis: string };
    option?: { text: string; evidence: string; value: AnswerValue };
  }[];
}) {
  const rows = evidence
    .map(({ option }, i) => {
      const line = option?.value.line || ((i + 1) as 1 | 2 | 3 | 4 | 5 | 6),
        weight = option?.value.weight || 0,
        weak = option?.value.lineValue === "yin" || weight >= 3;
      return {
        line,
        meta: lineNames[line],
        weight,
        weak,
        text: option?.text || "尚未回答",
        evidence: option?.evidence || "系统暂按默认状态推导。",
        tone: weak ? "偏弱/需关注" : "偏强/可承接",
      };
    })
    .sort((a, b) => a.line - b.line);
  const weakRows = rows.filter((r) => r.weak),
    strongRows = rows.filter((r) => !r.weak);
  const core =
    weakRows.sort((a, b) => b.weight - a.weight)[0] ||
    rows.sort((a, b) => b.weight - a.weight)[0];
  return (
    <div className="sixline-explain">
      <small>六问结果解释增强 V0.1</small>
      <h2>真正的卡点：{core?.meta.name}</h2>
      <p>
        {core
          ? `这次最值得先看的不是卦名本身，而是「${core.meta.focus}」。你的选择显示这里的信号最重，后续行动最好先围绕这一层取证。`
          : "完成六问后，系统会在这里解释主要卡点。"}
      </p>
      <div className="sixline-summary">
        <span>
          <b>偏弱层</b>
          {weakRows.length
            ? weakRows.map((r) => r.meta.name.split(" · ")[1]).join("、")
            : "暂无明显偏弱层"}
        </span>
        <span>
          <b>可承接层</b>
          {strongRows.length
            ? strongRows.map((r) => r.meta.name.split(" · ")[1]).join("、")
            : "仍需继续观察"}
        </span>
        <span>
          <b>解释口径</b>先看权重，再看阴阳，再回到具体选项证据
        </span>
      </div>
      <ol>
        {rows.map((r) => (
          <li className={r.weak ? "weak" : "strong"} key={r.line}>
            <span>第{r.line}爻</span>
            <div>
              <b>{r.meta.name}</b>
              <em>
                {r.tone} · 权重 {r.weight}
              </em>
              <p>{r.text}</p>
              <small>{r.evidence}</small>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
function WeightExplain({
  answers,
  score,
  taskImpact,
}: {
  answers: (AnswerValue | undefined)[];
  score: number;
  taskImpact?: { delta: number; notes: string[] };
}) {
  const total = answers.reduce((sum, a) => sum + (a?.weight || 0), 0),
    delta = taskImpact?.delta || 0,
    adjusted = Math.max(0, total + delta),
    level = adjusted >= 8 ? "强" : adjusted >= 5 ? "中" : "轻";
  return (
    <div className="weight-explain">
      <small>选项权重 V0.1</small>
      <p>
        同一大类里的不同选项现在会产生不同强度。复诊时，任务状态会作为加权提示参与解释，但不会替用户回答六问。
      </p>
      <div className="weight-visual">
        <span>
          <b>六问权重</b>
          <i>
            <em style={{ width: `${Math.min(100, (total / 10) * 100)}%` }} />
          </i>
          <strong>{total || 0}</strong>
        </span>
        <span>
          <b>任务修正</b>
          <i>
            <em
              style={{
                width: `${Math.min(100, (Math.abs(delta) / 6) * 100)}%`,
              }}
            />
          </i>
          <strong>{delta > 0 ? `+${delta}` : delta}</strong>
        </span>
        <span>
          <b>合成强度</b>
          <i>
            <em style={{ width: `${Math.min(100, (adjusted / 12) * 100)}%` }} />
          </i>
          <strong>
            {adjusted} · {level}
          </strong>
        </span>
      </div>
      <span>当前路径行动代价：{score}/5</span>
      {taskImpact?.notes.map((x) => (
        <span key={x}>{x}</span>
      ))}
    </div>
  );
}

type EvidenceItem = {
  question: { key: string; axis: string };
  option?: { text: string; evidence: string; value: AnswerValue };
};
type Props = {
  currentHex: HexagramState;
  psychHex: DerivedHexagram;
  structHex: DerivedHexagram;
  targetHex: DerivedHexagram;
  hex: ReturnType<typeof resolveDiagnosis>;
  chosen: M64StrategyPath;
  targetPaths: M64StrategyPath[];
  riskLevel: { key: string; label: string; total: number; tone: string };
  taskImpact: { delta: number; notes: string[] };
  answers: (AnswerValue | undefined)[];
  evidence: EvidenceItem[];
  topic: string;
  profile: {
    lens: { name: string };
    focus: string;
    object: string;
    action: string;
    relation: string;
    risk: string;
  };
  revisit: RecordItem | null;
  actionPlan: {
    type: string;
    headline: string;
    first: string;
    note: string;
    moves: string[];
  };
  path: number;
  setPath: (value: number) => void;
  feedback: string;
  setFeedback: (value: string) => void;
  nextReview: string;
  mode: number;
  setMode: (value: number) => void;
  modes: { name: string; desc: string }[];
  save: () => void;
  saved: boolean;
};

export function ReportPage(props: Props) {
  const {
    currentHex,
    psychHex,
    structHex,
    targetHex,
    hex,
    chosen,
    targetPaths,
    riskLevel,
    taskImpact,
    answers,
    evidence,
    topic,
    profile,
    revisit,
    actionPlan,
    path,
    setPath,
    feedback,
    setFeedback,
    nextReview,
    mode,
    setMode,
    modes,
    save,
    saved,
  } = props;
  return (
    <section className="map-page">
      <div className="report-head">
        <p className="eyebrow">主诉诊断报告 · V1.0</p>
        <span>
          MAIN / M₆₄-{currentHex.id} · PSY / M₆₄-{psychHex.to.id} · STR / M₆₄-
          {structHex.to.id} · TARGET / M₆₄-{targetHex.to.id}
        </span>
        <h1>{currentHex.name}：这是本次六问生成的主诊断卦。</h1>
        <blockquote>{topic}</blockquote>
        <div className="profile-card">
          <small>主诉画像 V0.3 · 诊断标签</small>
          <p>
            这些不是按钮，而是系统对你主诉的初步理解：它们说明系统会从哪个管理角度继续提问。
          </p>
          <span>
            <b>问题类型</b>
            {profile.lens.name}
          </span>
          <span>
            <b>最先卡点</b>
            {profile.focus}
          </span>
          <span>
            <b>相关对象</b>
            {profile.object}
          </span>
          <span>
            <b>问题动作</b>
            {profile.action}
          </span>
          <span>
            <b>组织关系</b>
            {profile.relation}
          </span>
          <span>
            <b>风险倾向</b>
            {profile.risk}
          </span>
        </div>
        {revisit && (
          <RevisitCompare
            record={revisit}
            currentHex={currentHex}
            risk={riskLevel}
            taskImpact={taskImpact}
          />
        )}
        <ReportSummary
          currentHex={currentHex}
          psychHex={psychHex}
          structHex={structHex}
          targetHex={targetHex}
          hex={hex}
          path={chosen}
        />
        <StateExplain answers={answers} hex={hex} currentHex={currentHex} />
        <SixLineExplain evidence={evidence} />
        <WeightExplain
          answers={answers}
          score={chosen.metrics.cost}
          taskImpact={revisit ? taskImpact : undefined}
        />
      </div>
      <div className="report-grid">
        <article className="report-main">
          <small>主诊断 · M₆₄ 六爻现状卦</small>
          <div>
            <HexagramMark
              name={currentHex.name}
              upper={currentHex.upper.name}
              lower={currentHex.lower.name}
              code={currentHex.code}
            />
          </div>
          <h2>{currentHex.situationTitle}</h2>
          <p>{currentHex.managementReading}</p>
          <p>{currentHex.coreContradiction}</p>
        </article>
        <article className="report-proof">
          <small>判断依据</small>
          <h2>六问写入六个爻位</h2>
          <ul>
            {evidence.map(({ question, option }, i) => (
              <li key={`${question.key}-${i}`}>
                <span>0{i + 1}</span>
                <div>
                  <b>{question.axis}</b>
                  <p>{option?.text || "尚未回答"}</p>
                  <small>
                    {option
                      ? `${option.evidence} 第 ${option.value.line || i + 1} 爻 · 权重 +${option.value.weight || 1}`
                      : "系统按默认状态推导。"}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        </article>
        <DerivedHexCard item={psychHex} />
        <DerivedHexCard item={structHex} />
        <DerivedHexCard item={targetHex} />
        <article className="report-recommend">
          <small>路径推荐 · M₆₄ V0.1</small>
          <h2>
            {chosen.name} · 目标卦「{chosen.target.name}」
          </h2>
          <p>{chosen.desc}</p>
          <PathMetrics metrics={chosen.metrics} />
          <PathReason path={chosen} isDefault />
          <span className="weight-score">
            变化爻 {chosen.changedLines.map((line) => `第${line}爻`).join("、")}
          </span>
          <em>
            {chosen.rationale} 当前路径由「{currentHex.name}」到「
            {chosen.target.name}」的差异爻生成。
          </em>
        </article>
      </div>
      <div className="insight-panel">
        <article>
          <small>基础态参考 · S₈</small>
          <h2>
            {hex.name} · {hex.title}
          </h2>
          <p>{hex.explanation}</p>
        </article>
        <article>
          <small>容易误判</small>
          <h2>不要把 S₈ 当作主卦</h2>
          <p>
            {hex.misread} 本报告主结论以「{currentHex.name}」为准。
          </p>
        </article>
        <article className="avoid">
          <small>此刻勿做</small>
          <h2>{hex.avoid}</h2>
          <p>先停止会放大惯性的动作，再谈新增动作。</p>
        </article>
        <article className={`first-action action-${riskLevel.key}`}>
          <small>第一行动 · {actionPlan.type}</small>
          <h2>{actionPlan.headline}</h2>
          <p>{actionPlan.first}</p>
          <em>{actionPlan.note}</em>
        </article>
      </div>
      <div className="map-head compact">
        <p className="eyebrow">三卦路径沙盘 · M₆₄</p>
        <h1>
          从 {currentHex.name} 到 {targetHex.to.name}
        </h1>
        <p>
          现状卦、心理卦、目标卦都来自同一个 M₆₄
          六爻状态；事理卦保留在上方报告卡片中，路径按现状与目标之间的差异爻生成。
        </p>
      </div>
      <div className="three-hex">
        <article className="current">
          <small>主现状卦 · M₆₄</small>
          <div>
            <HexagramMark
              name={currentHex.name}
              upper={currentHex.upper.name}
              lower={currentHex.lower.name}
              code={currentHex.code}
            />
          </div>
          <h2>{currentHex.situationTitle}</h2>
          <p>{currentHex.managementReading}</p>
        </article>
        <i>心理 →</i>
        <article className="inertia">
          <small>心理卦 · M₆₄</small>
          <div>
            <HexagramMark
              name={psychHex.to.name}
              upper={psychHex.to.upper.name}
              lower={psychHex.to.lower.name}
              code={psychHex.to.code}
            />
          </div>
          <h2>{psychHex.question}</h2>
          <p>{psychHex.reading}</p>
        </article>
        <i>目标 →</i>
        <article className="target">
          <small>目标卦 · M₆₄</small>
          <div>
            <HexagramMark
              name={targetHex.to.name}
              upper={targetHex.to.upper.name}
              lower={targetHex.to.lower.name}
              code={targetHex.to.code}
            />
          </div>
          <h2>{targetHex.question}</h2>
          <p>{targetHex.reading}</p>
        </article>
      </div>
      <div className="path-pick">
        <div>
          <p className="eyebrow">三条推荐路径 · M₆₄ P₄₀₉₆</p>
          <h2>从现状卦到目标卦，先动哪几爻？</h2>
        </div>
        <section>
          {targetPaths.map((p, i) => (
            <button
              className={i === path ? "selected" : ""}
              onClick={() => setPath(i)}
              key={p.tag}
            >
              <span>{p.tag}</span>
              <div>
                <b>{p.name}</b>
                <small>{p.cost}</small>
                <p>{p.desc}</p>
                <PathMetrics metrics={p.metrics} />
                <PathReason path={p} isDefault={i === 0} />
                <span className="weight-score">
                  变化爻{" "}
                  {p.changedLines.map((line) => `第${line}爻`).join("、")}
                </span>
                <ActionMapping actions={p.actions} />
                <em>{p.rationale}</em>
              </div>
              <i>{i === path ? "已选择" : "比较此路"}</i>
            </button>
          ))}
        </section>
        <PathFeedback path={chosen} />
      </div>
      <div className="roadbook">
        <aside>
          <p className="eyebrow">
            从 {currentHex.name} 到 {chosen.target.name}
          </p>
          <h2>14 天第一段路书 · {actionPlan.type}</h2>
          <p>
            针对“{topic}”，目标卦为「{chosen.target.name}」。
            {actionPlan.note}
          </p>
        </aside>
        <ol>
          {actionPlan.moves.map((x, i) => (
            <li key={x}>
              <span>0{i + 1}</span>
              <b>{x}</b>
              <small>{["今天", "7 天内", "14 天内"][i]}</small>
            </li>
          ))}
        </ol>
        <div className="gate">
          <small>收敛闸门</small>
          <span>
            <i />
            主诉变清楚
          </span>
          <span>
            <i />
            行动 ≤ 2 步
          </span>
          <span>
            <i />
            风险信号转弱
          </span>
        </div>
      </div>
      <ActionFeedback
        feedback={feedback}
        setFeedback={setFeedback}
        nextReview={nextReview}
      />
      <div className="mode">
        <div>
          <p className="eyebrow">控制权在你</p>
          <h2>下一次变化发生时，系统怎样陪你？</h2>
        </div>
        <div>
          {modes.map((m, i) => (
            <button
              className={mode === i ? "on" : ""}
              onClick={() => setMode(i)}
              key={m.name}
            >
              <b>{m.name}</b>
              <small>{m.desc}</small>
            </button>
          ))}
        </div>
        <button className="primary" onClick={save}>
          {saved ? "本次路径已存档 ✓" : "确认路径，进入第一次迭代"}
        </button>
      </div>
    </section>
  );
}
