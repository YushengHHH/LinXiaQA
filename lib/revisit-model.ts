export type RevisitEvidence = {
  action: string;
  support: string;
  counter: string;
  source: string;
  verifiability: "待核实" | "可复核" | "已验证";
};
export type ExperimentReview = {
  result: string;
  metricOutcome: string;
  stopTriggered: "未触发" | "已触发";
  verdict: "支持假设" | "部分支持" | "不支持假设";
};
export type ExperimentRetrospective = {
  decision: "巩固" | "校正" | "终止";
  lesson: string;
  nextReason: string;
};
export type ActionExperiment = {
  hypothesis: string;
  action: string;
  metric: string;
  stopLoss: string;
  reviewDate: string;
  status: "草拟" | "执行中" | "已复查";
  review?: ExperimentReview;
  retrospective?: ExperimentRetrospective;
};
export type RecordItem = {
  date: string;
  hex: string;
  target: string;
  mode: string;
  progress: number;
  topic?: string;
  state?: string;
  risk?: string;
  pathName?: string;
  summary?: string;
  action?: string;
  feedback?: string;
  nextReview?: string;
  closedLoop?: string;
  lineDiffs?: string[];
  recalcPath?: string;
  rewrittenActions?: string[];
  conclusionDiff?: string;
  trendVerdict?: string;
  trendBasis?: string;
  evidence?: RevisitEvidence;
  experiment?: ActionExperiment;
  nextExperimentDraft?: ActionExperiment;
};
export type TaskState = "未完成" | "已完成" | "有变化";

export function makeTrendVerdict(diffPair: RecordItem[]) {
  if (diffPair.length < 2)
    return {
      title: "等待成势",
      body: "还需要至少两次复诊摘要，才能判断趋势是在改善、反复、转向还是停滞。",
      focus: "下一次先补足行动反馈。",
      basis: [
        "复诊样本不足：目前少于两次带差异摘要的复诊。",
        "行动证据不足：还不能比较路径、风险和任务修正的连续变化。",
        "下一步依据：先补一次带反馈的复诊记录。",
      ],
    };
  const now = diffPair[0],
    prev = diffPair[1],
    nowText = now.conclusionDiff || "",
    pathChanged = now.pathName !== prev.pathName,
    riskChanged = now.risk !== prev.risk,
    taskUp = nowText.includes("任务修正：+"),
    taskDown = nowText.includes("任务修正：-"),
    feedbackClosed = !!now.feedback,
    basis = [
      `路径依据：${pathChanged ? `从「${prev.pathName || "未记录"}」变为「${now.pathName || "未记录"}」` : "最近两次路径名称未明显改变"}`,
      `风险依据：${riskChanged ? "风险描述发生变化" : "风险描述暂未明显变化"}`,
      `任务依据：${taskUp ? "任务修正上调，说明未完成或新变化增加阻力" : taskDown ? "任务修正下调，说明任务完成正在释放阻力" : "任务修正没有明显改变"}`,
      `反馈依据：${feedbackClosed ? "本次记录带有行动反馈，可进入闭环判断" : "本次未记录行动反馈，趋势判断仍偏保守"}`,
    ];
  if (pathChanged)
    return {
      title: "路已转向，先稳边界",
      body: "连续摘要显示路径发生变化，说明问题定义、目标边界或资源条件正在移动。此时不要急着扩大动作，先确认目标、授权和关键接口。",
      focus: "下一次复诊看目标边界是否更清楚。",
      basis,
    };
  if (taskUp)
    return {
      title: "风险未降，卡在任务闭环",
      body: "任务修正仍在上调复诊强度，说明未完成或新变化正在拖住风险下降。先收敛任务，再谈换路。",
      focus: "下一次复诊优先核对未完成任务。",
      basis,
    };
  if (taskDown)
    return {
      title: "阻滞松动，可以小步巩固",
      body: "任务状态开始降低原阻滞权重，说明至少一部分行动已经产生承接力。暂不必大改路径，先巩固有效动作。",
      focus: "下一次复诊看有效动作能否复制到第二个接口。",
      basis,
    };
  if (riskChanged)
    return {
      title: "风险在变，先看证据方向",
      body: "连续摘要显示风险口径变化，但路径还没有明显转向。现在关键不是加动作，而是确认风险是在下降，还是换了表现形式。",
      focus: "下一次复诊补一条正反证据。",
      basis,
    };
  return {
    title: "连续观察，仍需新证据",
    body: "连续摘要变化不大，说明系统暂未捕捉到明显转向。可能是局面稳定，也可能是复诊材料不够尖锐。",
    focus: "下一次复诊带一个反例或新变化。",
    basis,
  };
}
export function makeRevisitConfidence(diffPair: RecordItem[]) {
  const now = diffPair[0],
    prev = diffPair[1];
  const evidence = now?.evidence;
  const evidenceSides =
    Number(!!evidence?.support.trim()) + Number(!!evidence?.counter.trim());
  const dimensions = [
    {
      name: "连续样本",
      score: diffPair.length >= 2 ? 25 : diffPair.length ? 12 : 0,
      max: 25,
      note:
        diffPair.length >= 2 ? "已有两次可对比的复诊摘要" : "连续复诊样本不足",
    },
    {
      name: "行动事实",
      score: evidence?.action.trim() ? 25 : now?.feedback ? 15 : 0,
      max: 25,
      note: evidence?.action.trim()
        ? "已记录本轮实际动作"
        : now?.feedback
          ? "有反馈，尚未拆出行动事实"
          : "缺少行动结果记录",
    },
    {
      name: "正反证据",
      score:
        evidenceSides === 2
          ? 25
          : evidenceSides === 1
            ? 17
            : now?.lineDiffs?.length
              ? 10
              : 0,
      max: 25,
      note:
        evidenceSides === 2
          ? "支持与反例均已记录"
          : evidenceSides === 1
            ? "只有单侧证据，结论可能偏向"
            : now?.lineDiffs?.length
              ? "有爻位变化，尚缺事实证据"
              : "尚无可核对的事实证据",
    },
    {
      name: "来源核验",
      score: evidence?.source.trim()
        ? evidence.verifiability === "已验证"
          ? 25
          : evidence.verifiability === "可复核"
            ? 20
            : 12
        : 0,
      max: 25,
      note: evidence?.source.trim()
        ? `来源已记录 · ${evidence.verifiability}`
        : "证据来源尚未记录",
    },
  ];
  const score = dimensions.reduce((sum, item) => sum + item.score, 0);
  const level = score >= 80 ? "较高" : score >= 55 ? "中等" : "审慎";
  const conclusion =
    score >= 80
      ? "当前结论具备连续记录和多类证据支持，可用于决定下一段小步行动；仍不应把它当作确定性预测。"
      : score >= 55
        ? "当前结论可作为行动假设，但仍有证据缺口；建议先验证再扩大动作。"
        : "当前结论主要用于提出复查方向，不宜据此做高代价或不可逆决策。";
  const gap = dimensions
    .filter((item) => item.score < item.max)
    .sort((a, b) => a.score / a.max - b.score / b.max)[0];
  return {
    score,
    level,
    conclusion,
    dimensions,
    next: gap
      ? `优先补证：${gap.name}——${gap.note}。`
      : "继续保留反例，并在下一次复诊核对结论是否仍成立。",
  };
}
export function makeRevisitDecisionGate(
  confidence: ReturnType<typeof makeRevisitConfidence>,
  record?: RecordItem,
) {
  const highRisk = record?.risk?.includes("强烈预警") || false;
  const verified = record?.evidence?.verifiability === "已验证";
  if (confidence.score < 55)
    return {
      status: highRisk ? "止损观察" : "暂缓升级",
      tone: "hold",
      summary: highRisk
        ? "风险较高但证据不足：可以先做可逆止损，不能直接重构。"
        : "可信度不足以支持扩大行动，先补证和做低代价验证。",
      allowed: [
        "补充正反证据",
        "执行一个可撤回的小动作",
        highRisk ? "暂停正在放大损耗的动作" : "记录下一次可观察信号",
      ],
      blocked: ["目标重构", "扩大到多个接口", "不可逆的资源或人员调整"],
      target: "达到 55 分，并至少补齐一条正证据和一条反证据。",
    };
  if (confidence.score < 80)
    return {
      status: "局部试验",
      tone: "test",
      summary: "当前结论可以作为行动假设，但只适合单点、可复核的局部试验。",
      allowed: [
        "选择一个关键接口试验",
        "保留原路径并设置复查点",
        "7 天内核对行动结果",
      ],
      blocked: ["全面推广", "跨层级结构调整", "把阶段性信号当作确定结论"],
      target: "达到 80 分且证据可复核，再评估是否扩大行动。",
    };
  if (!verified)
    return {
      status: "待最终核验",
      tone: "test",
      summary:
        "证据结构已经较完整，但来源尚未标记为已验证；可以准备升级，暂不执行不可逆动作。",
      allowed: ["复核证据来源", "准备路径调整方案", "继续可逆的小范围试验"],
      blocked: ["不可逆结构干预", "未经复核的全面推广"],
      target: "把关键证据标记为“已验证”。",
    };
  return {
    status: "允许升级",
    tone: "go",
    summary:
      "连续记录、正反证据和来源核验已达到升级条件，可进入受控的路径调整。",
    allowed: ["调整当前路径", "扩大到第二个接口", "设置止损线后进行结构干预"],
    blocked: ["跳过复查点的一次性重构", "把本次结论视为永久判断"],
    target: "行动后保留反例，并按复查点再次复诊。",
  };
}
