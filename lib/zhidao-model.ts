export type Binary = 0 | 1;
export type Generator = 1 | 2 | 3 | 4;
export type LineKind = "yang" | "yin";
export type TrigramName = "乾" | "兑" | "离" | "震" | "巽" | "坎" | "艮" | "坤";
export type AnswerValue = { tau?: Binary; phase?: Binary; delta?: Binary; weight?: number; bias?: 0 | 1 | 2 };
export type DiagnosisAnswer = AnswerValue | undefined;

export type TrigramState = {
  id: number;
  name: TrigramName;
  code: `${Binary}${Binary}${Binary}`;
  symbol: string;
  lines: [LineKind, LineKind, LineKind];
  meaning: string;
  tau: Binary;
  g: Generator;
  delta: Binary;
  managementName: string;
  managementMeaning: string;
};

export type QuestionOption = {
  text: string;
  value: AnswerValue;
  evidence: string;
};

export type DiagnosisQuestion = {
  key: "tau" | "phase" | "delta";
  label: string;
  title: string;
  note: string;
  axis: string;
  options: QuestionOption[];
};

export type ZhiDaoState = {
  id: number;
  name: string;
  code: string;
  tau: Binary;
  g: Generator;
  delta: Binary;
  title: string;
  symptom: string;
  explanation: string;
  inertiaId: number;
  inertiaTitle: string;
  warning: string;
  targetIds: [number, number, number];
  patterns: string[];
  misread: string;
  avoid: string;
  firstAction: string;
};

export type StrategyPath = {
  tag: string;
  name: string;
  target: string;
  targetCode: string;
  cost: string;
  desc: string;
  rationale: string;
  metrics: { cost: number; resistance: number; speed: number; risk: number };
  recommendation: string;
  notFirst: string;
  prerequisite: string;
  moves: string[];
};

export const trigramStates: TrigramState[] = [
  { id: 0, name: "乾", code: "000", symbol: "☰", lines: ["yang", "yang", "yang"], meaning: "三阳", tau: 0, g: 1, delta: 0, managementName: "方向明确，执行受阻", managementMeaning: "中心意志强，但承接接口和反馈节奏偏弱。" },
  { id: 1, name: "兑", code: "001", symbol: "☱", lines: ["yin", "yang", "yang"], meaning: "上缺", tau: 0, g: 1, delta: 1, managementName: "创新上行受阻", managementMeaning: "一线信号活跃，但没有进入资源配置与共同决策。" },
  { id: 2, name: "离", code: "010", symbol: "☲", lines: ["yang", "yin", "yang"], meaning: "中虚", tau: 0, g: 4, delta: 0, managementName: "资源充沛，方向模糊", managementMeaning: "机会与资源很多，但共同取舍标准尚未收束。" },
  { id: 3, name: "震", code: "011", symbol: "☳", lines: ["yin", "yin", "yang"], meaning: "下动", tau: 0, g: 4, delta: 1, managementName: "基层活力与战略脱节", managementMeaning: "局部动能真实存在，但缺少组织级转译接口。" },
  { id: 4, name: "巽", code: "100", symbol: "☴", lines: ["yang", "yang", "yin"], meaning: "下入", tau: 1, g: 2, delta: 0, managementName: "外部压力下的内部混乱", managementMeaning: "外部变化被内部结构放大，需要统一解释口径和响应边界。" },
  { id: 5, name: "坎", code: "101", symbol: "☵", lines: ["yin", "yang", "yin"], meaning: "中实", tau: 1, g: 2, delta: 1, managementName: "底层动荡向上传导", managementMeaning: "真实现场信号正在上涌，系统需要恢复可听见性。" },
  { id: 6, name: "艮", code: "110", symbol: "☶", lines: ["yang", "yin", "yin"], meaning: "上止", tau: 1, g: 3, delta: 0, managementName: "规则僵化，创新窒息", managementMeaning: "稳定机制压住试错空间，规则完整但判断变钝。" },
  { id: 7, name: "坤", code: "111", symbol: "☷", lines: ["yin", "yin", "yin"], meaning: "三阴", tau: 1, g: 3, delta: 1, managementName: "隐性消耗，表面平静", managementMeaning: "表面柔顺，真实责任和判断正在下沉。" }
];

const trigramByName = new Map<TrigramName, TrigramState>(trigramStates.map(state => [state.name, state]));
const trigramById = new Map<number, TrigramState>(trigramStates.map(state => [state.id, state]));

export function getTrigramState(name?: string) {
  return trigramByName.get(name as TrigramName) || trigramByName.get("乾")!;
}

export function getTrigramStateById(id: number) {
  return trigramById.get(id) || trigramById.get(0)!;
}

export function validateTrigramStates() {
  const errors: string[] = [];
  const unique = <T>(items: T[]) => new Set(items).size === items.length;
  if (trigramStates.length !== 8) errors.push(`八卦状态数量应为 8，当前为 ${trigramStates.length}`);
  if (!unique(trigramStates.map(item => item.id))) errors.push("八卦 id 存在重复");
  if (!unique(trigramStates.map(item => item.name))) errors.push("八卦名称存在重复");
  if (!unique(trigramStates.map(item => item.symbol))) errors.push("八卦符号存在重复");
  if (!unique(trigramStates.map(item => item.lines.join("")))) errors.push("八卦爻象存在重复");
  trigramStates.forEach(item => {
    const phase = item.g === 1 || item.g === 2 ? 0 : 1;
    const expectedId = item.tau * 4 + phase * 2 + item.delta;
    const expectedCode = `${item.tau}${phase}${item.delta}`;
    if (item.id !== expectedId) errors.push(`${item.name} 的 id 与 tau/g/delta 不一致`);
    if (item.code !== expectedCode) errors.push(`${item.name} 的 code 与 tau/g/delta 不一致`);
  });
  return { ok: errors.length === 0, errors };
}

export const diagnosisQuestions: DiagnosisQuestion[] = [
  {
    key: "tau",
    label: "第一问 · 先做什么",
    title: "这件事现在更该先补动力，还是先清障碍？",
    note: "判断管理动作的优先级：先补目标、资源和共识，还是先处理旧承诺、责任不清和内耗。",
    axis: "管理取向：补动力 / 清障碍",
    options: [
      { text: "先搭共识与目标，让大家重新看见方向", value: { tau: 0, weight: 1, bias: 0 }, evidence: "优先生发，说明系统还保有可被组织起来的动能。" },
      { text: "先补资源与能力，否则目标只是口号", value: { tau: 0, weight: 2, bias: 1 }, evidence: "优先建设，说明主要矛盾在供给不足。" },
      { text: "先清掉旧承诺和模糊责任，不然越推越乱", value: { tau: 1, weight: 2, bias: 1 }, evidence: "优先清理，说明系统阻滞已经压过新增动能。" },
      { text: "先处理内耗和冲突，否则任何新动作都会变形", value: { tau: 1, weight: 3, bias: 2 }, evidence: "优先破阻，说明克制关系需要先被显化。" }
    ]
  },
  {
    key: "phase",
    label: "第二问 · 卡在哪里",
    title: "主要卡在流程交接，还是卡在跨部门/跨层级协同？",
    note: "判断问题发生的位置：是上下游交接、目标到执行接不上，还是多个部门、多个层级彼此牵制。",
    axis: "问题位置：流程交接 / 跨界协同",
    options: [
      { text: "上下游衔接断裂，事情常卡在交接处", value: { phase: 0, weight: 1, bias: 0 }, evidence: "邻位生发受阻，适合从接口和节奏入手。" },
      { text: "目标到执行之间掉链子，层层理解不一致", value: { phase: 0, weight: 2, bias: 0 }, evidence: "邻位传递失真，说明构型仍在连续链路内。" },
      { text: "跨部门互相牵制，资源和判断无法对齐", value: { phase: 1, weight: 2, bias: 1 }, evidence: "隔位克制增强，说明系统已出现结构性拉扯。" },
      { text: "表面都同意，真正关键处却彼此绕开", value: { phase: 1, weight: 3, bias: 2 }, evidence: "隔位关系隐性化，说明需要处理被遮蔽的制约。" }
    ]
  },
  {
    key: "delta",
    label: "第三问 · 信息从哪来",
    title: "真实判断现在主要靠上级拍板，还是靠一线反馈修正？",
    note: "判断信息流向：是上级定方向、团队等待执行，还是一线事实正在反过来改变判断。",
    axis: "判断来源：上级拍板 / 一线反馈",
    options: [
      { text: "主要由高层判断，团队等待明确指令", value: { delta: 0, weight: 1, bias: 0 }, evidence: "顺向传导占主导，组织需要检查执行承接。" },
      { text: "方向很清楚，但反馈常常来得太晚", value: { delta: 0, weight: 2, bias: 1 }, evidence: "顺向路径较强，逆向校正不足。" },
      { text: "一线信号很多，但很难进入真正决策", value: { delta: 1, weight: 2, bias: 0 }, evidence: "逆向信号存在，系统需要建立上行接口。" },
      { text: "基层已经在自发调整，高层还没完全感知", value: { delta: 1, weight: 3, bias: 2 }, evidence: "逆向变化正在发生，目标可能需要重新校准。" }
    ]
  }
];

export const zhiDaoStates: ZhiDaoState[] = [
  { id: 0, name: "乾", code: "000", tau: 0, g: 1, delta: 0, title: "方向明确，执行受阻", symptom: "战略清晰，但团队并未真正跟进。", explanation: "建设优先、邻位链路、顺向传导同时出现，说明中心意志强，但承接机制偏弱。", inertiaId: 2, inertiaTitle: "依附增强，核心命脉变弱", warning: "继续靠中心推动，会用更大的声量换来更深的等待。", targetIds: [7, 4, 5], patterns: ["目标反复宣讲，实际动作仍停在原处", "会议里都认可，交付时各自等待", "核心人物越忙，外围越不敢判断"], misread: "容易被误判为执行力差，其实常是承接接口和反馈节奏没有被设计。", avoid: "不要继续加口号、加压力、加检查频次。", firstAction: "选一个最小交付接口，明确谁接、何时回、用什么证据证明已接住。" },
  { id: 1, name: "兑", code: "001", tau: 0, g: 1, delta: 1, title: "创新上行受阻", symptom: "一线有想法，却无法进入共同决策。", explanation: "建设意愿仍在，基层信号也活跃，但组织接口没有把新判断接入决策。", inertiaId: 6, inertiaTitle: "表达增加，真实改变减少", warning: "意见看似充分，关键资源仍不会流向新尝试。", targetIds: [5, 7, 3], patterns: ["一线不断提出改法，却总停在讨论层", "试点很多，授权和资源跟不上", "大家愿意说，但不知道谁能拍板"], misread: "容易被误判为想法太散，其实关键是上行信号没有进入资源配置。", avoid: "不要再开一轮泛泛征集意见。", firstAction: "把一个一线建议变成可决策提案：边界、资源、风险、7天证据一次写清。" },
  { id: 2, name: "离", code: "010", tau: 0, g: 4, delta: 0, title: "资源充沛，方向模糊", symptom: "有人、有资源，却不知道该往哪里集中。", explanation: "建设优先但构型转入隔位，说明机会很多，取舍标准尚未收束。", inertiaId: 7, inertiaTitle: "项目漂移，资源持续分散", warning: "继续追加机会，会让组织失去共同的取舍标准。", targetIds: [0, 5, 4], patterns: ["项目同时推进，但彼此不形成合力", "资源看似够用，关键结果却没有聚焦", "每个机会都有道理，取舍越来越困难"], misread: "容易被误判为资源不足，其实更像缺少共同排序标准。", avoid: "不要用新增项目来证明组织还在前进。", firstAction: "列出三个正在争夺资源的事项，只保留一个两周内可验证的主目标。" },
  { id: 3, name: "震", code: "011", tau: 0, g: 4, delta: 1, title: "基层活力与战略脱节", symptom: "成员有劲，却不知道如何接入整体方向。", explanation: "生发、隔位、上行同时出现，说明局部动能真实存在，但缺少组织级转译。", inertiaId: 4, inertiaTitle: "局部追热点，整体失节奏", warning: "活力若没有接口，会迅速变成各自为战。", targetIds: [1, 5, 7], patterns: ["局部团队很活跃，整体节奏却越来越乱", "好点子不断冒出，但难以形成组织动作", "基层在自救，高层看到的是噪声"], misread: "容易被误判为基层不服从，其实是局部动能没有被翻译成共同路径。", avoid: "不要急着把所有自发动作收编成统一指令。", firstAction: "选一个最有生命力的局部动作，帮它补上目标接口和复盘节奏。" },
  { id: 4, name: "巽", code: "100", tau: 1, g: 2, delta: 0, title: "外部压力下的内部混乱", symptom: "市场变化很快，组织解释彼此冲突。", explanation: "清理优先、隔位牵制、顺向下达叠加，说明外部压力被内部结构放大。", inertiaId: 6, inertiaTitle: "共识涣散，反应越来越碎", warning: "若每个部门独自解释环境，变化只会放大内耗。", targetIds: [2, 0, 5], patterns: ["外部一变，内部就出现多套解释", "部门各自应急，彼此认为对方拖后腿", "领导越要求快，组织越碎片化"], misread: "容易被误判为环境太难，其实是内部解释权和响应边界不清。", avoid: "不要让每个部门独立制定一套应急方案。", firstAction: "先统一一个外部变化的解释口径，再确定唯一的跨部门响应责任人。" },
  { id: 5, name: "坎", code: "101", tau: 1, g: 2, delta: 1, title: "底层动荡向上传导", symptom: "基层持续不稳，高层得到的仍是过滤后的信息。", explanation: "阻滞已经显化，真实信号从下方上涌，系统需要先恢复可听见性。", inertiaId: 6, inertiaTitle: "风险堆积，行动处处受阻", warning: "真实信号越晚上行，调整成本就越高。", targetIds: [1, 3, 7], patterns: ["一线反复报问题，但越往上越被润色", "小风险不断累积，却迟迟不能成为议题", "真正知道现场的人不在决策桌旁"], misread: "容易被误判为基层情绪化，其实是风险传导链条失真。", avoid: "不要先追责谁没有执行好。", firstAction: "开一条不处罚的事实通道，只收集三个最具体的现场阻滞证据。" },
  { id: 6, name: "艮", code: "110", tau: 1, g: 3, delta: 0, title: "规则僵化，创新窒息", symptom: "流程完善，却没有人愿意率先突破。", explanation: "清理逻辑占据上风，顺向规则压住试错空间，系统稳定但变钝。", inertiaId: 7, inertiaTitle: "能力脱落，只剩形式完整", warning: "继续加规则，会把最后的判断空间也一并收走。", targetIds: [4, 1, 0], patterns: ["流程越来越完整，判断越来越保守", "每个人都能说明为什么不能做", "试错被要求先证明绝对安全"], misread: "容易被误判为大家缺乏创新意识，其实是规则吞掉了试错空间。", avoid: "不要再为例外情况新增审批层。", firstAction: "划出一个低风险例外区，允许一次小试错，并提前约定停止条件。" },
  { id: 7, name: "坤", code: "111", tau: 1, g: 3, delta: 1, title: "隐性消耗，表面平静", symptom: "一切看似正常，组织却迟迟没有生长。", explanation: "清理、隔位、上行都处在隐性状态，组织表面柔顺，真实责任正在下沉。", inertiaId: 6, inertiaTitle: "上下不交，系统进入停滞", warning: "不说破的体谅，正在变成无人负责的默认。", targetIds: [5, 1, 0], patterns: ["没有明显冲突，但事情总是慢慢变轻", "大家都很配合，却没有真正承担", "问题被体谅、被绕开、被延期"], misread: "容易被误判为氛围稳定，其实是责任和判断正在隐性流失。", avoid: "不要继续用和气掩盖没有人负责。", firstAction: "点名一个被长期体谅的问题，定义一个不伤人的责任归口。" }
];

export function resolveDiagnosis(answers: DiagnosisAnswer[]) {
  const tau = answers.find(a => a?.tau !== undefined)?.tau ?? 0;
  const phase = answers.find(a => a?.phase !== undefined)?.phase ?? 0;
  const delta = answers.find(a => a?.delta !== undefined)?.delta ?? 0;
  const g = (tau === 0 ? (phase === 0 ? 1 : 4) : (phase === 0 ? 2 : 3)) as Generator;
  const id = tau * 4 + phase * 2 + delta;
  return zhiDaoStates[id] || zhiDaoStates[0];
}

export function getState(id: number) {
  return zhiDaoStates[id] || zhiDaoStates[0];
}

export function buildStrategyPaths(state: ZhiDaoState): StrategyPath[] {
  const names = ["顺势微调", "重构跃迁", "理想靶心"] as const;
  const costs = ["低代价", "中代价", "高代价"] as const;
  const verbs = ["先动一个接口", "重画一段结构", "切换目标构型"] as const;
  const recommendations = [
    "默认先推荐这条：它不要求组织立刻大改结构，能用最小动作验证局面是否真的可动。",
    "当问题已经不是接口摩擦，而是责任、资源和判断边界互相缠住时，再优先考虑这条。",
    "只有当现有目标本身已经失效，且关键人愿意承受重配代价时，才适合直接选择这条。"
  ] as const;
  const notFirst = [
    "它可能太温和；如果阻滞已经结构化，单点微调只能暴露问题，不能完成重构。",
    "它暂不作为默认起点，因为阻力和协调成本较高，若证据不足，容易变成新一轮拉扯。",
    "它暂不优先，因为代价、阻力和风险都高；若没有共同承诺，容易把目标切换成口号。"
  ] as const;
  const prerequisites = [
    "只需确定一个可观察接口，并约定两周内看一次证据。",
    "需要至少一个关键责任人愿意重画边界，并暂停一项低效旧承诺。",
    "需要先确认不可让渡的目标内核，以及谁拥有重新分配判断权的授权。"
  ] as const;
  const metrics = [
    { cost: 1, resistance: 2, speed: 5, risk: 2 },
    { cost: 3, resistance: 4, speed: 3, risk: 3 },
    { cost: 5, resistance: 5, speed: 2, risk: 4 }
  ] as const;
  return state.targetIds.map((targetId, index) => {
    const target = getState(targetId);
    return {
      tag: String.fromCharCode(65 + index),
      name: names[index],
      target: target.name,
      targetCode: target.code,
      cost: costs[index],
      desc: `从“${state.title}”转向“${target.title}”，${verbs[index]}。`,
      rationale: `匹配 ${state.name} → ${target.name} 的可达路径，先降低${index === 0 ? "执行摩擦" : index === 1 ? "结构牵制" : "目标漂移"}。`,
      metrics: metrics[index],
      recommendation: recommendations[index],
      notFirst: notFirst[index],
      prerequisite: prerequisites[index],
      moves: [
        index === 0 ? "选一个最小可验证接口" : index === 1 ? "停止一项失效承诺" : "确认不可让渡的目标内核",
        index === 0 ? "建立一次双向反馈" : index === 1 ? "重画责任与资源边界" : "重配关键判断权",
        index === 0 ? "用两周证据决定是否推进" : index === 1 ? "围绕同一结果重新协作" : "建立新的演化节奏"
      ]
    };
  });
}
