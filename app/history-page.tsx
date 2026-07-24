"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { RevisitWorkspace } from "./revisit-workspace";
import {
  makeRevisitConfidence,
  makeRevisitDecisionGate,
  makeTrendVerdict,
  type ActionExperiment,
  type ExperimentReview,
  type RecordItem,
  type RevisitEvidence,
  type TaskState,
} from "../lib/revisit-model";

type Props = {
  records: RecordItem[];
  setRecords: Dispatch<SetStateAction<RecordItem[]>>;
  taskStates: Record<string, TaskState>;
  setTaskStates: Dispatch<SetStateAction<Record<string, TaskState>>>;
  startRevisit: (record: RecordItem) => void;
  start: () => void;
  emptyMark: ReactNode;
};

export function HistoryPage({
  records,
  setRecords,
  taskStates,
  setTaskStates,
  startRevisit,
  start,
  emptyMark,
}: Props) {
  function updateTaskState(title: string, state: TaskState) {
    const next = { ...taskStates, [title]: state };
    setTaskStates(next);
    localStorage.setItem("linxia-fskn-task-states", JSON.stringify(next));
  }
  function updateRevisitEvidence(field: keyof RevisitEvidence, value: string) {
    const target = diffPair[0];
    if (!target) return;
    const evidence: RevisitEvidence = {
      action: "",
      support: "",
      counter: "",
      source: "",
      verifiability: "待核实",
      ...target.evidence,
      [field]: value,
    };
    const index = records.indexOf(target);
    if (index < 0) return;
    const next = records.map((record, i) =>
      i === index ? { ...record, evidence } : record,
    );
    setRecords(next);
    localStorage.setItem("linxia-fskn-records", JSON.stringify(next));
  }
  function updateActionExperiment(
    field: keyof ActionExperiment,
    value: string,
  ) {
    const target = diffPair[0];
    if (!target) return;
    const experiment = {
      hypothesis: "",
      action: "",
      metric: "",
      stopLoss: "",
      reviewDate: "",
      status: "草拟",
      ...target.experiment,
      [field]: value,
    } as ActionExperiment;
    const index = records.indexOf(target);
    if (index < 0) return;
    const next = records.map((record, i) =>
      i === index ? { ...record, experiment } : record,
    );
    setRecords(next);
    localStorage.setItem("linxia-fskn-records", JSON.stringify(next));
  }
  function updateExperimentReview(
    field: keyof ExperimentReview,
    value: string,
  ) {
    const target = diffPair[0];
    if (!target?.experiment) return;
    const review = {
      result: "",
      metricOutcome: "",
      stopTriggered: "未触发",
      verdict: "部分支持",
      ...target.experiment.review,
      [field]: value,
    } as ExperimentReview;
    const index = records.indexOf(target);
    if (index < 0) return;
    const next = records.map((record, i) =>
      i === index
        ? { ...record, experiment: { ...target.experiment!, review } }
        : record,
    );
    setRecords(next);
    localStorage.setItem("linxia-fskn-records", JSON.stringify(next));
  }
  function completeExperimentReview() {
    const target = diffPair[0],
      review = target?.experiment?.review;
    if (
      !target?.experiment ||
      !review?.result.trim() ||
      !review.metricOutcome.trim()
    )
      return;
    const supports = review.verdict !== "不支持假设",
      counters =
        review.verdict !== "支持假设" || review.stopTriggered === "已触发";
    const evidence: RevisitEvidence = {
      action: target.experiment.action,
      support: supports
        ? `实验结果：${review.result}；指标：${review.metricOutcome}`
        : "",
      counter: counters
        ? `实验反证：${review.result}；${review.stopTriggered === "已触发" ? `触发止损线：${target.experiment.stopLoss}` : "结果未支持原假设"}`
        : "",
      source: `行动实验复查 · ${target.experiment.reviewDate}`,
      verifiability: "可复核",
    };
    const decision: ExperimentRetrospective["decision"] =
      review.stopTriggered === "已触发" || review.verdict === "不支持假设"
        ? "终止"
        : review.verdict === "支持假设"
          ? "巩固"
          : "校正";
    const retrospective: ExperimentRetrospective = {
      decision,
      lesson: `原假设「${target.experiment.hypothesis}」得到${review.verdict}；实际指标表现为：${review.metricOutcome}。`,
      nextReason:
        decision === "巩固"
          ? "保留有效动作，只扩大到一个相邻接口。"
          : decision === "校正"
            ? "保留有效部分，改写动作或指标后再做一次低代价验证。"
            : "停止当前动作，回到证据与问题定义重新选路。",
    };
    const nextExperimentDraft: ActionExperiment = {
      hypothesis:
        decision === "巩固"
          ? `若把「${target.experiment.action}」扩展到一个相邻接口，指标仍会保持改善。`
          : decision === "校正"
            ? `若根据复查结果缩小并改写「${target.experiment.action}」，可以获得更清晰的指标变化。`
            : `若暂停「${target.experiment.action}」并重新补证，可以识别新的关键卡点。`,
      action:
        decision === "巩固"
          ? `将有效动作扩展到一个相邻接口：${target.experiment.action}`
          : decision === "校正"
            ? `缩小并校正原动作：${target.experiment.action}`
            : `停止原动作并围绕反证重新取证`,
      metric: target.experiment.metric,
      stopLoss: target.experiment.stopLoss,
      reviewDate: "",
      status: "草拟",
    };
    const index = records.indexOf(target);
    if (index < 0) return;
    const next = records.map((record, i) =>
      i === index
        ? {
            ...record,
            evidence,
            nextExperimentDraft,
            experiment: {
              ...target.experiment!,
              status: "已复查" as const,
              retrospective,
            },
          }
        : record,
    );
    setRecords(next);
    localStorage.setItem("linxia-fskn-records", JSON.stringify(next));
  }
  const timeline = [...records].reverse(),
    latest = records[0],
    first = timeline[0],
    changedCount = records.filter(
      (r) => r.lineDiffs?.length || r.recalcPath,
    ).length,
    feedbackCount = records.filter((r) => r.feedback).length;
  const trajectoryInsight = (() => {
    if (!records.length) return null;
    const feedbackRate = feedbackCount / records.length,
      last = records[0],
      lastChange = last?.lineDiffs?.length || 0,
      pathShift = records.filter((r) => r.recalcPath).length;
    if (records.length === 1)
      return {
        tone: "起步建档",
        title: "已经形成第一张组织处境底片。",
        body: "当前还不能判断趋势，先用一次行动反馈来验证这张现状卦是否抓住了主要矛盾。",
        evidence: [
          "已有 1 次诊断记录",
          "尚未形成连续复诊样本",
          `当前路径：${last?.pathName || last?.mode}`,
        ],
        next: "建议完成一次行动后，从当前节点发起复诊。",
      };
    if (feedbackRate < 0.5)
      return {
        tone: "执行停滞",
        title: "记录在增加，但反馈闭环偏少。",
        body: "系统能看到诊断和路径，但还缺少足够行动结果。此时不宜继续扩大方案，先补足事实反馈。",
        evidence: [
          `反馈闭环 ${feedbackCount}/${records.length}`,
          `路径/爻位变化 ${changedCount} 次`,
          `当前卦：${last?.hex?.split(" · ")[0] || "未记录"}`,
        ],
        next: "下一步先补写一次真实执行结果，再判断是否换路。",
      };
    if (pathShift >= 2)
      return {
        tone: "目标漂移",
        title: "路径多次重算，说明目标或约束正在移动。",
        body: "这不一定是坏事，但意味着原先的问题定义可能正在变化。需要先确认目标边界，再继续推进动作。",
        evidence: [
          `路径重算 ${pathShift} 次`,
          `反馈闭环 ${feedbackCount}/${records.length}`,
          `最新路径：${last?.pathName || last?.mode}`,
        ],
        next: "下一次复诊重点放在目标、授权和资源取舍是否一致。",
      };
    if (lastChange >= 3)
      return {
        tone: "剧烈震荡",
        title: "最新复诊出现多处爻位变化。",
        body: "组织处境正在快速变动，短期内不适合一次性下重手。更稳的做法是缩小动作，先抓一个关键接口验证。",
        evidence: [
          `最新变化 ${lastChange} 个爻位`,
          `路径/爻位变化 ${changedCount} 次`,
          `当前卦：${last?.hex?.split(" · ")[0] || "未记录"}`,
        ],
        next: "下一步只保留一个最小动作，3 到 7 天内复查。",
      };
    return {
      tone: "稳步改善",
      title: "轨迹开始形成可跟踪的修正节奏。",
      body: "诊断、反馈和路径调整之间已经连起来。可以继续用小步复诊保持方向感，而不是追求一次判断到位。",
      evidence: [
        `反馈闭环 ${feedbackCount}/${records.length}`,
        `路径/爻位变化 ${changedCount} 次`,
        `当前路径：${last?.pathName || last?.mode}`,
      ],
      next: "下一次复诊重点看当前路径是否产生可验证的小成果。",
    };
  })();
  const trajectoryWarnings = (() => {
    if (!records.length) return [];
    const last = records[0],
      lastChange = last?.lineDiffs?.length || 0,
      pathShift = records.filter((r) => r.recalcPath).length,
      feedbackRate = feedbackCount / records.length;
    return [
      feedbackRate < 0.5 && {
        level: "高",
        title: "反馈不足",
        reason: `只有 ${feedbackCount}/${records.length} 次记录带有行动反馈。`,
        risk: "继续诊断会越来越像讨论观点，而不是检验行动结果。",
        action: "先补一次真实执行反馈，再决定是否继续重算路径。",
      },
      pathShift >= 2 && {
        level: "中",
        title: "路径频繁重算",
        reason: `已有 ${pathShift} 次路径重算。`,
        risk: "目标、授权或资源条件可能在移动，容易一边行动一边改题。",
        action: "下一次复诊先确认目标边界，再进入行动改写。",
      },
      lastChange >= 3 && {
        level: "中",
        title: "最新变化过大",
        reason: `最新节点出现 ${lastChange} 个爻位变化。`,
        risk: "局面波动较大，此时动作过多会放大组织噪声。",
        action: "收敛到一个关键接口，3 到 7 天后短复诊。",
      },
      records.length >= 3 &&
        changedCount === 0 && {
          level: "低",
          title: "轨迹过于平直",
          reason: "多次记录中未出现路径或爻位变化。",
          risk: "可能是局面真的稳定，也可能是提问和反馈没有捕捉到真实变化。",
          action: "下次复诊补写一个反例：哪件事和预期不一样？",
        },
    ]
      .filter(Boolean)
      .slice(0, 3) as {
      level: string;
      title: string;
      reason: string;
      risk: string;
      action: string;
    }[];
  })();
  const revisitTasks = (
    trajectoryWarnings.length
      ? trajectoryWarnings.map((w, i) => ({
          title: w.action,
          why: w.title + "：" + w.reason,
          when: i === 0 ? "复诊前先完成" : "下次复诊时核对",
        }))
      : [
          {
            title: "补写一次真实行动结果",
            why: "让系统区分“判断变化”和“行动变化”。",
            when: "下一次复诊前",
          },
          {
            title: "确认当前路径是否仍然有效",
            why: `当前路径为「${latest?.pathName || latest?.mode || "未记录"}」，需要用事实校验。`,
            when: "复诊开始时",
          },
          {
            title: "准备一个反例或新证据",
            why: "避免轨迹只沿着上次结论惯性延伸。",
            when: "六问前",
          },
        ]
  ).slice(0, 3);
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
  const diffPair = records.filter((r) => r.conclusionDiff).slice(0, 2),
    diffTrend =
      diffPair.length < 2
        ? "等待下一次复诊形成对比"
        : diffPair[0].pathName !== diffPair[1].pathName
          ? "路径转向"
          : diffPair[0].risk !== diffPair[1].risk
            ? "风险变化"
            : "连续观察";
  const revisitConfidence = makeRevisitConfidence(diffPair);
  const revisitDecisionGate = makeRevisitDecisionGate(
    revisitConfidence,
    diffPair[0],
  );
  const experiment = diffPair[0]?.experiment;
  const experimentFields = [
    experiment?.hypothesis,
    experiment?.action,
    experiment?.metric,
    experiment?.stopLoss,
    experiment?.reviewDate,
  ];
  const experimentComplete = experimentFields.filter((value) =>
    value?.trim(),
  ).length;
  const experimentCanStart =
    experimentComplete === 5 && revisitDecisionGate.tone !== "hold";
  const experimentReviewComplete =
    !!experiment?.review?.result.trim() &&
    !!experiment?.review?.metricOutcome.trim();
  const trendVerdict = makeTrendVerdict(diffPair);
  return (
    <section className="history timeline-view">
      <div className="section-title">
        <p className="eyebrow">M₆₄ 演化轨迹 · 仅保存在此设备</p>
        <h1>
          把每次复诊，
          <br />
          连成一条路。
        </h1>
        <p>
          时间线会把现状卦、路径重算、爻级变化和行动反馈串起来。它不是给组织贴永久标签，而是看清：哪里正在变，哪里还没动，下一次该复查什么。
        </p>
      </div>
      {records.length ? (
        <>
          <div className="timeline-summary">
            <article>
              <small>起点</small>
              <b>{first?.hex?.split(" · ")[0] || "未记录"}</b>
              <span>{first?.pathName || first?.mode}</span>
            </article>
            <article>
              <small>当前</small>
              <b>{latest?.hex?.split(" · ")[0] || "未记录"}</b>
              <span>{latest?.pathName || latest?.mode}</span>
            </article>
            <article>
              <small>复诊变化</small>
              <b>{changedCount}</b>
              <span>次路径或爻位发生更新</span>
            </article>
            <article>
              <small>反馈闭环</small>
              <b>
                {feedbackCount}/{records.length}
              </b>
              <span>次记录带有行动反馈</span>
            </article>
          </div>
          {diffPair.length > 0 && (
            <div className="diff-compare">
              <header>
                <small>M₆₄ 复诊摘要对比视图 V0.1</small>
                <b>{diffTrend}</b>
                <p>
                  把最近两次复诊摘要并排看：重点不是单次结论，而是判断为什么连续变化。
                </p>
              </header>
              <div>
                {diffPair.map((r, i) => (
                  <article key={`${r.date}-${i}`}>
                    <small>
                      {i === 0 ? "最新复诊" : "上次复诊"} · {r.date}
                    </small>
                    <b>{r.hex?.split(" · ")[0] || "未记录"}</b>
                    <p>{r.conclusionDiff}</p>
                    <em>{r.pathName || r.mode}</em>
                  </article>
                ))}
              </div>
              <section className="trend-verdict">
                <small>M₆₄ 趋势判词可解释依据 V0.1</small>
                <b>{trendVerdict.title}</b>
                <p>{trendVerdict.body}</p>
                <ul>
                  {trendVerdict.basis.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <em>{trendVerdict.focus}</em>
              </section>
              +{" "}
              <RevisitWorkspace
                diffPair={diffPair}
                revisitConfidence={revisitConfidence}
                revisitDecisionGate={revisitDecisionGate}
                experiment={experiment}
                experimentComplete={experimentComplete}
                experimentCanStart={experimentCanStart}
                experimentReviewComplete={experimentReviewComplete}
                updateRevisitEvidence={updateRevisitEvidence}
                updateActionExperiment={updateActionExperiment}
                updateExperimentReview={updateExperimentReview}
                completeExperimentReview={completeExperimentReview}
              />
            </div>
          )}
          {trajectoryInsight && (
            <div className="trajectory-insight">
              <aside>
                <small>轨迹洞察 V0.1</small>
                <b>{trajectoryInsight.tone}</b>
                <p>{trajectoryInsight.title}</p>
              </aside>
              <section>
                <p>{trajectoryInsight.body}</p>
                <div>
                  {trajectoryInsight.evidence.map((x) => (
                    <span key={x}>{x}</span>
                  ))}
                </div>
                <em>{trajectoryInsight.next}</em>
              </section>
            </div>
          )}
          {trajectoryWarnings.length > 0 && (
            <div className="trajectory-warnings">
              <header>
                <small>M₆₄ 轨迹预警 V0.1</small>
                <b>请先收敛这几个信号</b>
                <p>预警不是否定路径，而是提醒哪些地方暂时不要继续放大。</p>
              </header>
              <div>
                {trajectoryWarnings.map((w) => (
                  <article key={w.title} className={`warn-${w.level}`}>
                    <span>{w.level}</span>
                    <div>
                      <b>{w.title}</b>
                      <p>{w.reason}</p>
                      <small>{w.risk}</small>
                      <em>{w.action}</em>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
          {revisitTasks.length > 0 && (
            <div className="revisit-tasks">
              <header>
                <small>M₆₄ 复诊任务清单 V0.1</small>
                <b>下次复诊前，先做这三件事</b>
                <p>把预警转成可执行的复诊准备，让系统下次重算时有事实依据。</p>
              </header>
              <ol>
                {revisitTasks.map((task, i) => {
                  const state = taskStates[task.title] || "未完成";
                  return (
                    <li key={task.title} className={`task-${state}`}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <b>{task.title}</b>
                        <p>{task.why}</p>
                        <em>{task.when}</em>
                        <div className="task-state">
                          <small>当前状态：{state}</small>
                          {(["未完成", "已完成", "有变化"] as TaskState[]).map(
                            (x) => (
                              <button
                                key={x}
                                className={state === x ? "on" : ""}
                                onClick={() => updateTaskState(task.title, x)}
                              >
                                {x}
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
          <div className="evolution-timeline">
            {timeline.map((r, i) => (
              <article
                key={`${r.date}-${i}`}
                className={i === timeline.length - 1 ? "current" : ""}
              >
                <div className="timeline-stem">
                  <i />
                  <span>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="timeline-card">
                  <header>
                    <time>{r.date}</time>
                    <em>
                      {i === 0
                        ? "起点"
                        : i === timeline.length - 1
                          ? "当前"
                          : "复诊"}
                    </em>
                  </header>
                  <div className="timeline-main">
                    <div>
                      <small>主诊断</small>
                      <b>{r.hex}</b>
                      <p>{r.topic || "早期诊断记录"}</p>
                    </div>
                    <div>
                      <small>路径</small>
                      <b>{r.pathName || r.mode}</b>
                      <p>{r.recalcPath || r.summary || r.target}</p>
                    </div>
                    <div>
                      <small>反馈</small>
                      <b>{r.feedback ? "已闭环" : "待反馈"}</b>
                      <p>
                        {r.feedback ||
                          r.closedLoop ||
                          "下一次记录行动结果后，时间线会继续更新。"}
                      </p>
                    </div>
                  </div>
                  {r.conclusionDiff && (
                    <div className="timeline-conclusion">
                      <b>复诊差异摘要</b>
                      <p>{r.conclusionDiff}</p>
                    </div>
                  )}
                  {r.trendVerdict && (
                    <div className="timeline-verdict">
                      <b>入档趋势判词</b>
                      <p>{r.trendVerdict.split("｜")[0]}</p>
                      <span>{r.trendVerdict.split("｜")[1]}</span>
                      <em>{r.trendVerdict.split("｜")[2]}</em>
                      {r.trendBasis && (
                        <ul>
                          {r.trendBasis.split("｜").map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  {r.lineDiffs?.length && (
                    <div className="timeline-diffs">
                      {r.lineDiffs.slice(0, 3).map((x) => (
                        <span key={x}>{x}</span>
                      ))}
                      {r.lineDiffs.length > 3 && (
                        <span>另有 {r.lineDiffs.length - 3} 个爻位变化</span>
                      )}
                    </div>
                  )}
                  {r.rewrittenActions?.length && (
                    <ol className="timeline-actions">
                      {r.rewrittenActions.slice(0, 3).map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ol>
                  )}
                  <button
                    className="revisit-start"
                    onClick={() => startRevisit(r)}
                  >
                    从此节点复诊 →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="empty">
          {emptyMark}
          <h2>尚未开始第一次演化</h2>
          <p>完成六问并选择一条目标路径后，本次判断会留在这里。</p>
          <button className="primary" onClick={start}>
            开始六问诊断
          </button>
        </div>
      )}
    </section>
  );
}
