export type Binary = 0 | 1;
export type Generator = 1 | 2 | 3 | 4;
export type AnswerValue = { tau?: Binary; phase?: Binary; delta?: Binary };
export type DiagnosisAnswer = AnswerValue | undefined;

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
};

export type StrategyPath = {
  tag: string;
  name: string;
  target: string;
  targetCode: string;
  cost: string;
  desc: string;
  rationale: string;
  moves: string[];
};

export const diagnosisQuestions: DiagnosisQuestion[] = [
  {
    key: "tau",
    label: "第一变 · 时序",
    title: "此刻更像先建设，还是先清理？",
    note: "辨认组织能量的先后次序：先把生发机制立起来，还是先处理阻滞与冲突。",
    axis: "二相行为 A：建设 / 清理",
    options: [
      { text: "先搭共识与目标，让大家重新看见方向", value: { tau: 0 }, evidence: "优先生发，说明系统还保有可被组织起来的动能。" },
      { text: "先补资源与能力，否则目标只是口号", value: { tau: 0 }, evidence: "优先建设，说明主要矛盾在供给不足。" },
      { text: "先清掉旧承诺和模糊责任，不然越推越乱", value: { tau: 1 }, evidence: "优先清理，说明系统阻滞已经压过新增动能。" },
      { text: "先处理内耗和冲突，否则任何新动作都会变形", value: { tau: 1 }, evidence: "优先破阻，说明克制关系需要先被显化。" }
    ]
  },
  {
    key: "phase",
    label: "第二变 · 构型",
    title: "组织现在更卡在邻位，还是隔位？",
    note: "辨认关系构型：问题是在相邻环节接不上，还是跨层、跨部门之间互相牵制。",
    axis: "二相行为 B：邻位 / 隔位",
    options: [
      { text: "上下游衔接断裂，事情常卡在交接处", value: { phase: 0 }, evidence: "邻位生发受阻，适合从接口和节奏入手。" },
      { text: "目标到执行之间掉链子，层层理解不一致", value: { phase: 0 }, evidence: "邻位传递失真，说明构型仍在连续链路内。" },
      { text: "跨部门互相牵制，资源和判断无法对齐", value: { phase: 1 }, evidence: "隔位克制增强，说明系统已出现结构性拉扯。" },
      { text: "表面都同意，真正关键处却彼此绕开", value: { phase: 1 }, evidence: "隔位关系隐性化，说明需要处理被遮蔽的制约。" }
    ]
  },
  {
    key: "delta",
    label: "第三变 · 方向",
    title: "真实判断主要从上往下，还是从下往上？",
    note: "辨认传导方向：决策是单向下达，还是基层信号能够反向改变判断。",
    axis: "二相行为 C：下达 / 上行",
    options: [
      { text: "主要由高层判断，团队等待明确指令", value: { delta: 0 }, evidence: "顺向传导占主导，组织需要检查执行承接。" },
      { text: "方向很清楚，但反馈常常来得太晚", value: { delta: 0 }, evidence: "顺向路径较强，逆向校正不足。" },
      { text: "一线信号很多，但很难进入真正决策", value: { delta: 1 }, evidence: "逆向信号存在，系统需要建立上行接口。" },
      { text: "基层已经在自发调整，高层还没完全感知", value: { delta: 1 }, evidence: "逆向变化正在发生，目标可能需要重新校准。" }
    ]
  }
];

export const zhiDaoStates: ZhiDaoState[] = [
  { id: 0, name: "乾", code: "000", tau: 0, g: 1, delta: 0, title: "方向明确，执行受阻", symptom: "战略清晰，但团队并未真正跟进。", explanation: "建设优先、邻位链路、顺向传导同时出现，说明中心意志强，但承接机制偏弱。", inertiaId: 2, inertiaTitle: "依附增强，核心命脉变弱", warning: "继续靠中心推动，会用更大的声量换来更深的等待。", targetIds: [7, 4, 5] },
  { id: 1, name: "兑", code: "001", tau: 0, g: 1, delta: 1, title: "创新上行受阻", symptom: "一线有想法，却无法进入共同决策。", explanation: "建设意愿仍在，基层信号也活跃，但组织接口没有把新判断接入决策。", inertiaId: 6, inertiaTitle: "表达增加，真实改变减少", warning: "意见看似充分，关键资源仍不会流向新尝试。", targetIds: [5, 7, 3] },
  { id: 2, name: "离", code: "010", tau: 0, g: 4, delta: 0, title: "资源充沛，方向模糊", symptom: "有人、有资源，却不知道该往哪里集中。", explanation: "建设优先但构型转入隔位，说明机会很多，取舍标准尚未收束。", inertiaId: 7, inertiaTitle: "项目漂移，资源持续分散", warning: "继续追加机会，会让组织失去共同的取舍标准。", targetIds: [0, 5, 4] },
  { id: 3, name: "震", code: "011", tau: 0, g: 4, delta: 1, title: "基层活力与战略脱节", symptom: "成员有劲，却不知道如何接入整体方向。", explanation: "生发、隔位、上行同时出现，说明局部动能真实存在，但缺少组织级转译。", inertiaId: 4, inertiaTitle: "局部追热点，整体失节奏", warning: "活力若没有接口，会迅速变成各自为战。", targetIds: [1, 5, 7] },
  { id: 4, name: "巽", code: "100", tau: 1, g: 2, delta: 0, title: "外部压力下的内部混乱", symptom: "市场变化很快，组织解释彼此冲突。", explanation: "清理优先、隔位牵制、顺向下达叠加，说明外部压力被内部结构放大。", inertiaId: 6, inertiaTitle: "共识涣散，反应越来越碎", warning: "若每个部门独自解释环境，变化只会放大内耗。", targetIds: [2, 0, 5] },
  { id: 5, name: "坎", code: "101", tau: 1, g: 2, delta: 1, title: "底层动荡向上传导", symptom: "基层持续不稳，高层得到的仍是过滤后的信息。", explanation: "阻滞已经显化，真实信号从下方上涌，系统需要先恢复可听见性。", inertiaId: 6, inertiaTitle: "风险堆积，行动处处受阻", warning: "真实信号越晚上行，调整成本就越高。", targetIds: [1, 3, 7] },
  { id: 6, name: "艮", code: "110", tau: 1, g: 3, delta: 0, title: "规则僵化，创新窒息", symptom: "流程完善，却没有人愿意率先突破。", explanation: "清理逻辑占据上风，顺向规则压住试错空间，系统稳定但变钝。", inertiaId: 7, inertiaTitle: "能力脱落，只剩形式完整", warning: "继续加规则，会把最后的判断空间也一并收走。", targetIds: [4, 1, 0] },
  { id: 7, name: "坤", code: "111", tau: 1, g: 3, delta: 1, title: "隐性消耗，表面平静", symptom: "一切看似正常，组织却迟迟没有生长。", explanation: "清理、隔位、上行都处在隐性状态，组织表面柔顺，真实责任正在下沉。", inertiaId: 6, inertiaTitle: "上下不交，系统进入停滞", warning: "不说破的体谅，正在变成无人负责的默认。", targetIds: [5, 1, 0] }
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
      moves: [
        index === 0 ? "选一个最小可验证接口" : index === 1 ? "停止一项失效承诺" : "确认不可让渡的目标内核",
        index === 0 ? "建立一次双向反馈" : index === 1 ? "重画责任与资源边界" : "重配关键判断权",
        index === 0 ? "用两周证据决定是否推进" : index === 1 ? "围绕同一结果重新协作" : "建立新的演化节奏"
      ]
    };
  });
}
