"use client";

import { useEffect, useMemo, useState } from "react";
import {
  makeTrendVerdict,
  type RecordItem,
  type TaskState,
} from "../lib/revisit-model";
import {
  buildM64StrategyPaths,
  derivePsychologicalHexagram,
  deriveStructuralHexagram,
  deriveTargetHexagram,
  getState,
  hexagramStates,
  lineActionMap,
  resolveDiagnosis,
  resolveHexagramDiagnosis,
  sixDiagnosisQuestions,
  type AnswerValue,
} from "../lib/zhidao-model";

type Screen = "home" | "diagnose" | "map" | "system" | "history";
const modes = [
  { name: "自动驾驶", desc: "系统在每个节点自动重新寻优" },
  { name: "半自动", desc: "目标变化时先请你确认" },
  { name: "手动锁定", desc: "终点不变，只重算路径" },
  { name: "静默陪伴", desc: "不主动打扰，打开时再更新" },
];
const focusOptions = [
  {
    id: "people",
    label: "人不动",
    desc: "方向知道，但相关人没有真正开始行动。",
    profile: { action: "推进受阻", relation: "目标-执行", risk: "停滞" },
  },
  {
    id: "resource",
    label: "资源不够",
    desc: "不是不想做，而是人手、时间、能力或预算撑不住。",
    profile: { action: "资源错配", relation: "目标-资源", risk: "失焦" },
  },
  {
    id: "judgment",
    label: "判断不清",
    desc: "大家对什么最重要、谁来拍板、下一步看什么没有共识。",
    profile: { action: "信息失真", relation: "上下传导", risk: "失真" },
  },
  {
    id: "relation",
    label: "关系卡住",
    desc: "跨部门、上下级或责任边界让事情绕来绕去。",
    profile: { action: "责任悬置", relation: "横向协作", risk: "内耗" },
  },
];
const lenses = [
  {
    id: "execution",
    name: "执行推进",
    keys: ["执行", "推进", "推不动", "落地", "交付", "目标", "进度"],
    hint: "这像是目标与行动之间的断点。",
  },
  {
    id: "resource",
    name: "资源能力",
    keys: ["资源", "人手", "能力", "预算", "时间", "支持", "忙"],
    hint: "这像是供给、负荷与优先级之间的错位。",
  },
  {
    id: "relation",
    name: "协作关系",
    keys: ["部门", "协作", "沟通", "扯皮", "配合", "对齐", "责任"],
    hint: "这像是关系接口和责任边界出现了摩擦。",
  },
  {
    id: "decision",
    name: "判断决策",
    keys: ["决策", "拍板", "高层", "反馈", "一线", "基层", "信息"],
    hint: "这像是判断权与真实信息之间的传导问题。",
  },
  {
    id: "rule",
    name: "规则流程",
    keys: ["流程", "规则", "审批", "制度", "合规", "创新", "试错"],
    hint: "这像是稳定机制压住了变化空间。",
  },
];

function getRiskLevel(answers: (AnswerValue | undefined)[]) {
  const total = answers.reduce((sum, a) => sum + (a?.weight || 0), 0);
  return total >= 8
    ? {
        key: "high",
        label: "强烈预警",
        total,
        tone: "这个风险已经不只是倾向，而是正在变成组织默认路径。",
      }
    : total >= 5
      ? {
          key: "mid",
          label: "中度预警",
          total,
          tone: "这个风险正在积累，需要尽快用一个小动作打断惯性。",
        }
      : {
          key: "low",
          label: "轻度提醒",
          total,
          tone: "这个风险还处在可观察阶段，先用低代价动作验证即可。",
        };
}
function buildActionPlan(
  hex: { firstAction: string },
  path: { name: string; moves: string[] },
  risk: { key: string; label: string },
) {
  const firstMove = path.moves[0] || hex.firstAction,
    secondMove = path.moves[1] || "复核行动后的反馈",
    thirdMove = path.moves[2] || "决定是否扩大动作";
  const plans = {
    low: {
      type: "观察动作",
      headline: "先观察一个可验证信号",
      first: `围绕「${path.name}」先记录一个最小事实：${hex.firstAction}`,
      note: "轻度提醒阶段先不要扩大动作，用一次观察确认局面是否真的如此。",
      moves: [
        `观察：${firstMove}`,
        `复核：${secondMove}`,
        `决定：${thirdMove}`,
      ],
    },
    mid: {
      type: "干预动作",
      headline: "先打断一个正在积累的惯性",
      first: `围绕「${path.name}」立刻安排一次小干预：${hex.firstAction}`,
      note: "中度预警阶段不要只观察，要用一个低风险动作改变反馈节奏。",
      moves: [
        `干预：${firstMove}`,
        `对齐：${secondMove}`,
        `复盘：${thirdMove}`,
      ],
    },
    high: {
      type: "止损/止血动作",
      headline: "先止住一个会继续放大的损耗",
      first: `围绕「${path.name}」先暂停一个会放大风险的动作，再执行：${hex.firstAction}`,
      note: "强烈预警阶段先止血，再优化；不要让组织继续沿惯性滑行。",
      moves: [
        "止血：暂停一个正在放大风险的动作",
        `重置：${firstMove}`,
        `收敛：${thirdMove}`,
      ],
    },
  };
  return plans[risk.key as "low" | "mid" | "high"] || plans.low;
}
function getComplaintLens(topic: string) {
  return (
    lenses.find((l) => l.keys.some((k) => topic.includes(k))) || {
      id: "general",
      name: "组织困惑",
      hint: "先把这件事放进组织关系里看。",
    }
  );
}
function pickTag(topic: string, pairs: [string, string[]][], fallback: string) {
  return (
    pairs.find(([, keys]) => keys.some((k) => topic.includes(k)))?.[0] ||
    fallback
  );
}
function buildComplaintProfile(topic: string, focusId?: string) {
  const lens = getComplaintLens(topic);
  const focus = focusOptions.find((item) => item.id === focusId);
  return {
    lens,
    object: pickTag(
      topic,
      [
        ["高层/决策层", ["高层", "老板", "领导", "决策", "拍板"]],
        ["一线/基层", ["一线", "基层", "员工", "现场"]],
        ["跨部门协作", ["部门", "跨部门", "协作", "配合"]],
        ["团队整体", ["团队", "组织", "大家", "成员"]],
      ],
      "相关人群",
    ),
    action:
      focus?.profile.action ||
      pickTag(
        topic,
        [
          ["推进受阻", ["推不动", "推进", "落地", "执行", "进度"]],
          ["责任悬置", ["负责", "责任", "没人", "归口"]],
          ["信息失真", ["反馈", "信息", "沟通", "说不清"]],
          ["资源错配", ["资源", "人手", "预算", "时间", "忙"]],
          ["规则压制", ["流程", "审批", "规则", "制度"]],
        ],
        "问题动作",
      ),
    relation:
      focus?.profile.relation ||
      pickTag(
        topic,
        [
          ["上下传导", ["高层", "基层", "一线", "反馈", "下达"]],
          ["横向协作", ["部门", "协作", "配合", "对齐", "扯皮"]],
          ["目标-执行", ["目标", "执行", "落地", "交付"]],
          ["规则-创新", ["规则", "流程", "创新", "试错"]],
        ],
        "组织关系",
      ),
    risk:
      focus?.profile.risk ||
      pickTag(
        topic,
        [
          ["停滞", ["推不动", "停", "拖", "慢"]],
          ["内耗", ["内耗", "冲突", "扯皮", "争"]],
          ["失焦", ["模糊", "混乱", "散", "不清楚"]],
          ["失真", ["反馈", "信息", "过滤", "感知"]],
          ["僵化", ["规则", "流程", "审批"]],
        ],
        "待观察风险",
      ),
    focus: focus?.label || "未补充",
  };
}
function tailorQuestions(topic: string) {
  const lens = getComplaintLens(topic),
    short = topic.length > 22 ? topic.slice(0, 22) + "…" : topic;
  return sixDiagnosisQuestions.map((q, index) => {
    if (index === 0)
      return {
        ...q,
        title: `“${short}”到了执行现场，最像哪一种情况？`,
        note: `${lens.hint} 第一问不问理论，只看目标有没有变成清楚的任务、节奏和交付责任。`,
        options: [
          {
            ...q.options[0],
            text: `大家知道“${short}”要做什么，也知道先交付哪一步`,
          },
          {
            ...q.options[1],
            text: `方向大致明白，但“${short}”的任务拆分和交付节奏还不够清楚`,
          },
          {
            ...q.options[2],
            text: `会议上都同意“${short}”，真正推进时就开始等待、拖延或反复解释`,
          },
          {
            ...q.options[3],
            text: `“${short}”在现场已经明显推不动，继续压任务只会带来应付和内耗`,
          },
        ],
      };
    if (index === 1)
      return {
        ...q,
        title: `为了推进“${short}”，资源和承压现在到什么程度？`,
        note: `第二问看资源：不是问资源多不多，而是看人、时间、能力和预算能不能承接这个目标。`,
        options: [
          {
            ...q.options[0],
            text: `人手、时间和能力基本够，只要排清优先级就能动`,
          },
          {
            ...q.options[1],
            text: `资源有点紧，但停掉一两件低优先级的事还能撑住`,
          },
          {
            ...q.options[2],
            text: `关键人、时间或能力明显缺口，推进时总有人被挤爆`,
          },
          {
            ...q.options[3],
            text: `现在主要靠硬扛和加班在撑，继续做会伤到关键人或基本盘`,
          },
        ],
      };
    if (index === 2)
      return {
        ...q,
        title: `真正做“${short}”的人，现在是什么状态？`,
        note: `第三问看一线：他们是在主动试着解决，还是只是在反馈困难、等待指令，甚至开始自保。`,
        options: [
          {
            ...q.options[0],
            text: `他们愿意试，也愿意承担一小步结果，只需要明确入口`,
          },
          { ...q.options[1], text: `他们想配合，但不知道怎样做才算真正帮上忙` },
          {
            ...q.options[2],
            text: `他们反馈很多困难，像是在提醒风险或请求支援`,
          },
          {
            ...q.options[3],
            text: `他们已经少说、少动、少担责，开始用沉默或绕开来自保`,
          },
        ],
      };
    if (index === 3)
      return {
        ...q,
        title: `推进“${short}”时，管理接口现在顺不顺？`,
        note: `第四问看接口：谁决策、谁协调、谁接下一棒、问题怎么上来，这几件事是否接得住。`,
        options: [
          { ...q.options[0], text: `关键接口有人接，问题出现后也能及时拉齐` },
          { ...q.options[1], text: `接口有摩擦，但找到责任人后还能坐下来调整` },
          { ...q.options[2], text: `经常卡在交接处：上游说交了，下游说没法接` },
          {
            ...q.options[3],
            text: `关键接口已经变成内耗点，大家都想让别人先接锅`,
          },
        ],
      };
    if (index === 4)
      return {
        ...q,
        title: `围绕“${short}”，关键决策现在清楚吗？`,
        note: `第五问看决策：不是问领导有没有想法，而是看目标、优先级、资源和拍板权是否真的落地。`,
        options: [
          {
            ...q.options[0],
            text: `目标、优先级和拍板人都清楚，资源也能跟着目标走`,
          },
          {
            ...q.options[1],
            text: `大方向清楚，但哪些事该停、哪些事该保还没说透`,
          },
          {
            ...q.options[2],
            text: `每件事都说重要，资源被分散，团队不知道该先保哪一个`,
          },
          {
            ...q.options[3],
            text: `大家都在等最后拍板，关键资源迟迟不敢投、不敢停、不敢换`,
          },
        ],
      };
    return {
      ...q,
      title: `“${short}”面对的外部变化，现在压力有多大？`,
      note: `第六问看外部：客户、市场、政策、竞争、上级要求，是否已经改变原来的判断前提。`,
      options: [
        {
          ...q.options[0],
          text: `外部要求和变化基本清楚，按原计划推进问题不大`,
        },
        { ...q.options[1], text: `外部有扰动，但还看得懂，暂时只需要调整节奏` },
        {
          ...q.options[2],
          text: `外部变化已经打乱原来的假设，内部需要重新对齐判断`,
        },
        {
          ...q.options[3],
          text: `外部已经明显变局，继续按原计划走可能会把风险放大`,
        },
      ],
    };
  });
}

export function useDiagnosisController() {
  const [screen, setScreen] = useState<Screen>("home"),
    [step, setStep] = useState(-1),
    [complaint, setComplaint] = useState(""),
    [focus, setFocus] = useState(""),
    [answers, setAnswers] = useState<(AnswerValue | undefined)[]>([]),
    [path, setPath] = useState(0),
    [mode, setMode] = useState(1),
    [records, setRecords] = useState<RecordItem[]>([]),
    [saved, setSaved] = useState(false),
    [revisit, setRevisit] = useState<RecordItem | null>(null),
    [feedback, setFeedback] = useState(""),
    [taskStates, setTaskStates] = useState<Record<string, TaskState>>({});
  useEffect(() => {
    try {
      setRecords(
        JSON.parse(localStorage.getItem("linxia-fskn-records") || "[]"),
      );
      setTaskStates(
        JSON.parse(localStorage.getItem("linxia-fskn-task-states") || "{}"),
      );
    } catch {}
  }, []);
  const hex = useMemo(() => resolveDiagnosis(answers), [answers]);
  const currentHex = useMemo(
    () => resolveHexagramDiagnosis(answers),
    [answers],
  );
  const psychHex = useMemo(
    () => derivePsychologicalHexagram(currentHex, answers),
    [currentHex, answers],
  );
  const structHex = useMemo(
    () => deriveStructuralHexagram(currentHex, answers),
    [currentHex, answers],
  );
  const inertia = getState(hex.inertiaId);
  const targetHex = useMemo(
    () => deriveTargetHexagram(currentHex, answers),
    [currentHex, answers],
  );
  const targetPaths = useMemo(
    () => buildM64StrategyPaths(currentHex, targetHex.to),
    [currentHex, targetHex],
  );
  const chosen = targetPaths[path] || targetPaths[0];
  const riskLevel = useMemo(() => getRiskLevel(answers), [answers]);
  const actionPlan = useMemo(
    () => buildActionPlan(hex, chosen, riskLevel),
    [hex, chosen, riskLevel],
  );
  const nextReview = useMemo(
    () =>
      chosen.actions?.[0]?.checkpoint ||
      "7 天后复诊：看第一动作是否让局面出现可验证变化。",
    [chosen],
  );
  const topic = complaint.trim() || "这件说不清的组织困惑";
  const lens = getComplaintLens(topic);
  const profile = buildComplaintProfile(topic, focus);
  const activeQuestions = useMemo(() => tailorQuestions(topic), [topic]);
  const evidence = activeQuestions.map((question, index) => {
    const selected = answers[index];
    const option = question.options.find((item) => {
      if (!selected) return false;
      if (item.value.line !== undefined)
        return (
          selected.line === item.value.line &&
          selected.lineValue === item.value.lineValue &&
          selected.weight === item.value.weight
        );
      if (item.value.tau !== undefined) return selected.tau === item.value.tau;
      if (item.value.phase !== undefined)
        return selected.phase === item.value.phase;
      return selected.delta === item.value.delta;
    });
    return { question, option };
  });
  const latestRecord = records[0];
  const revisitTasks = [
    {
      title: "补写一次真实行动结果",
      why: "让系统区分判断变化和行动变化。",
      when: "下一次复诊前",
    },
    {
      title: "确认当前路径是否仍然有效",
      why: `当前路径为「${latestRecord?.pathName || latestRecord?.mode || "未记录"}」，需要用事实校验。`,
      when: "复诊开始时",
    },
    {
      title: "准备一个反例或新证据",
      why: "避免轨迹只沿着上次结论惯性延伸。",
      when: "六问前",
    },
  ];
  const taskImpact = revisitTasks.reduce(
    (acc, task) => {
      const state = taskStates[task.title] || "未完成";
      if (state === "已完成") {
        acc.delta -= 1;
        acc.notes.push(`已完成：${task.title}，原阻滞权重 -1`);
      } else if (state === "有变化") {
        acc.delta += 2;
        acc.notes.push(`有变化：${task.title}，变化敏感度 +2`);
      } else {
        acc.delta += 1;
        acc.notes.push(`未完成：${task.title}，执行阻滞权重 +1`);
      }
      return acc;
    },
    { delta: 0, notes: [] as string[] },
  );
  const nav = (s: Screen) => {
    setScreen(s);
    scrollTo(0, 0);
  };
  function start() {
    setStep(-1);
    setFocus("");
    setAnswers([]);
    setPath(0);
    setSaved(false);
    setRevisit(null);
    setFeedback("");
    nav("diagnose");
  }
  function submitComplaint() {
    setComplaint(topic);
    setStep(-2);
  }
  function startRevisit(r: RecordItem) {
    const taskBrief = revisitTasks
      .map(
        (task, i) =>
          `${i + 1}. ${task.title}｜状态：${taskStates[task.title] || "未完成"}｜依据：${task.why}`,
      )
      .join("\n");
    setRevisit(r);
    setComplaint(
      `复诊：${r.topic || r.target}\n\n上次行动：${r.action || r.summary || "尚未记录"}\n上次反馈：${r.feedback || "尚未填写"}\n\n复诊任务状态：\n${taskBrief || "暂无任务状态"}\n\n这 7/14 天的新变化：`,
    );
    setFocus("");
    setAnswers([]);
    setPath(0);
    setSaved(false);
    setFeedback("");
    setStep(-1);
    nav("diagnose");
  }
  function chooseFocus(id: string) {
    setFocus(id);
    setStep(0);
  }
  function answer(value: AnswerValue) {
    let next = [...answers];
    next[step] = value;
    setAnswers(next);
    if (step < activeQuestions.length - 1) setStep(step + 1);
    else nav("map");
  }
  function save() {
    if (saved) return;
    const oldHex = (revisit?.hex || revisit?.state || "").split(" · ")[0];
    const oldState = hexagramStates.find((item) => item.name === oldHex);
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
    const weaker = diffs.filter((item) => item.to === "yin").length,
      stronger = diffs.filter((item) => item.to === "yang").length;
    const recalc =
      riskLevel.key === "high" || weaker >= 2
        ? "目标重构"
        : weaker === 1
          ? "重点校正"
          : stronger > 0
            ? "顺势微调"
            : revisit?.pathName || chosen.name;
    const pivot = diffs[0]?.action;
    const rewritten =
      recalc === "目标重构"
        ? [
            "今天：暂停一个会继续放大风险的旧动作",
            "7 天内：重新确认目标、授权和资源取舍",
            "14 天内：只保留一条可验证的新路径",
          ]
        : recalc === "重点校正"
          ? [
              `今天：围绕「${pivot?.name || "关键卡点"}」补一次事实取证`,
              "7 天内：联动一个相邻管理层面，明确责任接口",
              "14 天内：复盘新证据，决定是否继续换路",
            ]
          : recalc === "顺势微调"
            ? [
                "今天：保留已经有效的小动作，不急着扩大",
                "7 天内：补一条验证证据",
                "14 天内：若信号稳定，再扩大到第二个接口",
              ]
            : actionPlan.moves;
    const conclusionDiff = revisit
      ? `${oldHex || "上次状态"} → ${currentHex.name}；风险：${revisit.risk?.match(/风险强度：([^。]+)/)?.[1] || "未记录"} → ${riskLevel.label}；路径：${revisit.pathName || "未记录"} → ${recalc}；任务修正：${taskImpact.delta > 0 ? `+${taskImpact.delta}` : taskImpact.delta}`
      : undefined;
    const riskText = `心理卦：${psychHex.to.name}；事理卦：${structHex.to.name}；风险强度：${riskLevel.label}。`;
    const archivedTrend =
      revisit && conclusionDiff
        ? makeTrendVerdict([
            {
              date: new Date().toLocaleDateString("zh-CN"),
              hex: currentHex.name + " · " + currentHex.situationTitle,
              target: chosen.target.name + " · " + chosen.name + " · " + topic,
              mode: modes[mode].name,
              progress: feedback.trim() ? 66 : 33,
              risk: riskText,
              pathName: chosen.name,
              feedback: feedback.trim(),
              conclusionDiff,
            },
            ...records.filter((r) => r.conclusionDiff).slice(0, 1),
          ])
        : undefined;
    const item = {
      date: new Date().toLocaleDateString("zh-CN"),
      hex: currentHex.name + " · " + currentHex.situationTitle,
      target: chosen.target.name + " · " + chosen.name + " · " + topic,
      mode: modes[mode].name,
      progress: feedback.trim() ? 66 : 33,
      topic,
      state: `当前主诊断：${currentHex.name} · ${currentHex.situationTitle}。${currentHex.managementReading}`,
      risk: riskText,
      pathName: chosen.name,
      summary: `建议先走「${chosen.name}」：${chosen.recommendation}`,
      action: `${actionPlan.type}：${actionPlan.first}`,
      feedback: feedback.trim(),
      nextReview,
      closedLoop: feedback.trim()
        ? `已记录反馈，下一次复诊重点：${nextReview}`
        : `尚未记录行动反馈，下一次可补写执行证据。`,
      lineDiffs: diffs.map(
        (item) =>
          `第${item.line}爻 · ${item.action.name}：${item.from === "yin" ? "偏弱" : "可承接"}→${item.to === "yin" ? "偏弱" : "可承接"}`,
      ),
      recalcPath: revisit
        ? `${revisit.pathName || "未记录"} → ${recalc}`
        : undefined,
      rewrittenActions: revisit ? rewritten : undefined,
      conclusionDiff,
      trendVerdict: archivedTrend
        ? `${archivedTrend.title}｜${archivedTrend.body}｜${archivedTrend.focus}`
        : undefined,
      trendBasis: archivedTrend?.basis.join("｜"),
      experiment: revisit?.nextExperimentDraft,
    };
    let next = [item, ...records].slice(0, 12);
    setRecords(next);
    setSaved(true);
    localStorage.setItem("linxia-fskn-records", JSON.stringify(next));
  }
  return {
    screen,
    nav,
    start,
    records,
    setRecords,
    taskStates,
    setTaskStates,
    step,
    setStep,
    revisit,
    complaint,
    setComplaint,
    lens,
    profile,
    activeQuestions,
    focusOptions,
    submitComplaint,
    chooseFocus,
    answer,
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
    startRevisit,
  };
}
