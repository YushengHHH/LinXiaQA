"use client";

import {
  makeRevisitConfidence,
  makeRevisitDecisionGate,
  type ActionExperiment,
  type ExperimentReview,
  type RecordItem,
  type RevisitEvidence,
} from "../lib/revisit-model";

type Props = {
  diffPair: RecordItem[];
  revisitConfidence: ReturnType<typeof makeRevisitConfidence>;
  revisitDecisionGate: ReturnType<typeof makeRevisitDecisionGate>;
  experiment?: ActionExperiment;
  experimentComplete: number;
  experimentCanStart: boolean;
  experimentReviewComplete: boolean;
  updateRevisitEvidence: (field: keyof RevisitEvidence, value: string) => void;
  updateActionExperiment: (
    field: keyof ActionExperiment,
    value: string,
  ) => void;
  updateExperimentReview: (
    field: keyof ExperimentReview,
    value: string,
  ) => void;
  completeExperimentReview: () => void;
};

export function RevisitWorkspace({
  diffPair,
  revisitConfidence,
  revisitDecisionGate,
  experiment,
  experimentComplete,
  experimentCanStart,
  experimentReviewComplete,
  updateRevisitEvidence,
  updateActionExperiment,
  updateExperimentReview,
  completeExperimentReview,
}: Props) {
  return (
    <>
      <section
        className={`revisit-confidence confidence-${revisitConfidence.level}`}
      >
        <header>
          <div>
            <small>M₆₄ 复诊结论可信度 V0.1</small>
            <b>{revisitConfidence.level}可信</b>
            <p>{revisitConfidence.conclusion}</p>
          </div>
          <strong>
            <span>{revisitConfidence.score}</span>
            <i>/ 100</i>
          </strong>
        </header>
        <div className="confidence-dimensions">
          {revisitConfidence.dimensions.map((item) => (
            <article key={item.name}>
              <span>
                <b>{item.name}</b>
                <em>
                  {item.score} / {item.max}
                </em>
              </span>
              <i>
                <u
                  style={{
                    width: `${(item.score / item.max) * 100}%`,
                  }}
                />
              </i>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
        <footer>{revisitConfidence.next}</footer>
      </section>
      <section className="evidence-collector">
        <header>
          <div>
            <small>M₆₄ 复诊证据采集 V0.1</small>
            <b>让结论同时经得起支持与反例。</b>
            <p>证据只保存在此设备，并即时参与上方可信度重算。</p>
          </div>
          <span>{diffPair[0].evidence?.verifiability || "待核实"}</span>
        </header>
        <div className="evidence-fields">
          <label>
            <b>实际做了什么</b>
            <textarea
              value={diffPair[0].evidence?.action || ""}
              onChange={(e) => updateRevisitEvidence("action", e.target.value)}
              placeholder="只写可观察的动作，不写评价。"
            />
          </label>
          <label>
            <b>支持当前结论的证据</b>
            <textarea
              value={diffPair[0].evidence?.support || ""}
              onChange={(e) => updateRevisitEvidence("support", e.target.value)}
              placeholder="什么事实说明判断可能成立？"
            />
          </label>
          <label>
            <b>与当前结论矛盾的反证据</b>
            <textarea
              value={diffPair[0].evidence?.counter || ""}
              onChange={(e) => updateRevisitEvidence("counter", e.target.value)}
              placeholder="什么事实不符合预期，或支持另一种解释？"
            />
          </label>
          <label>
            <b>证据来源</b>
            <input
              value={diffPair[0].evidence?.source || ""}
              onChange={(e) => updateRevisitEvidence("source", e.target.value)}
              placeholder="例如：项目数据、会议记录、两位一线访谈"
            />
            <small>来源越具体，后续越容易复核。</small>
          </label>
        </div>
        <div className="evidence-verification">
          <b>可验证程度</b>
          {(
            ["待核实", "可复核", "已验证"] as RevisitEvidence["verifiability"][]
          ).map((level) => (
            <button
              key={level}
              className={
                (diffPair[0].evidence?.verifiability || "待核实") === level
                  ? "on"
                  : ""
              }
              onClick={() => updateRevisitEvidence("verifiability", level)}
            >
              {level}
            </button>
          ))}
        </div>
      </section>
      <section className={`decision-gate gate-${revisitDecisionGate.tone}`}>
        <header>
          <div>
            <small>M₆₄ 复诊行动决策闸门 V0.1</small>
            <b>{revisitDecisionGate.status}</b>
            <p>{revisitDecisionGate.summary}</p>
          </div>
          <span>
            {revisitConfidence.score}
            <i>/100</i>
          </span>
        </header>
        <div className="gate-decisions">
          <article>
            <b>现在可以做</b>
            <ul>
              {revisitDecisionGate.allowed.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <b>目前暂缓</b>
            <ul>
              {revisitDecisionGate.blocked.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
        <footer>
          <b>下一道放行条件</b>
          <span>{revisitDecisionGate.target}</span>
        </footer>
      </section>
      <section className="experiment-sheet">
        <header>
          <div>
            <small>M₆₄ 行动实验单 V0.1</small>
            <b>把判断变成一次可复查的小实验。</b>
            <p>
              先写清假设、指标和止损线，再进入执行；实验结果会成为下一次复诊证据。
            </p>
          </div>
          <span>{experimentComplete}/5 已完整</span>
        </header>
        <div className="experiment-fields">
          <label>
            <b>行动假设</b>
            <textarea
              value={experiment?.hypothesis || ""}
              onChange={(e) =>
                updateActionExperiment("hypothesis", e.target.value)
              }
              placeholder="如果我们做什么，预计哪个组织信号会怎样变化？"
            />
          </label>
          <label>
            <b>最小行动</b>
            <textarea
              value={experiment?.action || ""}
              onChange={(e) => updateActionExperiment("action", e.target.value)}
              placeholder="只写一个可撤回、可观察的动作。"
            />
            <button
              type="button"
              onClick={() =>
                updateActionExperiment("action", revisitDecisionGate.allowed[0])
              }
            >
              采用闸门建议：{revisitDecisionGate.allowed[0]}
            </button>
          </label>
          <label>
            <b>观察指标</b>
            <input
              value={experiment?.metric || ""}
              onChange={(e) => updateActionExperiment("metric", e.target.value)}
              placeholder="例如：责任人确认时间缩短至 24 小时"
            />
          </label>
          <label>
            <b>止损线</b>
            <input
              value={experiment?.stopLoss || ""}
              onChange={(e) =>
                updateActionExperiment("stopLoss", e.target.value)
              }
              placeholder="出现什么情况必须暂停或撤回？"
            />
          </label>
          <label>
            <b>复查日期</b>
            <input
              type="date"
              value={experiment?.reviewDate || ""}
              onChange={(e) =>
                updateActionExperiment("reviewDate", e.target.value)
              }
            />
          </label>
        </div>
        <div className="experiment-control">
          <div>
            <b>实验状态</b>
            <p>
              {revisitDecisionGate.tone === "hold"
                ? "闸门尚未放行：可以保存草稿，不能进入执行。"
                : experimentComplete < 5
                  ? "补齐五项实验条件后即可进入执行。"
                  : "条件已完整，可以开始小范围实验。"}
            </p>
          </div>
          {(["草拟", "执行中", "已复查"] as ActionExperiment["status"][]).map(
            (status) => (
              <button
                key={status}
                className={
                  (experiment?.status || "草拟") === status ? "on" : ""
                }
                disabled={
                  (status === "执行中" && !experimentCanStart) ||
                  status === "已复查"
                }
                onClick={() => updateActionExperiment("status", status)}
              >
                {status}
              </button>
            ),
          )}
        </div>
      </section>
      {experiment && experiment.status !== "草拟" && (
        <section className={`experiment-review review-${experiment.status}`}>
          <header>
            <div>
              <small>M₆₄ 行动实验复查 V0.1</small>
              <b>
                {experiment.status === "已复查"
                  ? "实验已入证"
                  : "到复查点，只记录实际发生的事。"}
              </b>
              <p>复查结果会自动写回正反证据，并触发可信度与决策闸门重算。</p>
            </div>
            <span>{experimentReviewComplete ? "材料完整" : "待补结果"}</span>
          </header>
          <div className="review-fields">
            <label>
              <b>实际结果</b>
              <textarea
                value={experiment.review?.result || ""}
                disabled={experiment.status === "已复查"}
                onChange={(e) =>
                  updateExperimentReview("result", e.target.value)
                }
                placeholder="发生了什么？不要先解释原因。"
              />
            </label>
            <label>
              <b>指标变化</b>
              <textarea
                value={experiment.review?.metricOutcome || ""}
                disabled={experiment.status === "已复查"}
                onChange={(e) =>
                  updateExperimentReview("metricOutcome", e.target.value)
                }
                placeholder={`原观察指标：${experiment.metric}`}
              />
            </label>
          </div>
          <div className="review-choices">
            <section>
              <b>是否触发止损线</b>
              {(
                ["未触发", "已触发"] as ExperimentReview["stopTriggered"][]
              ).map((value) => (
                <button
                  key={value}
                  disabled={experiment.status === "已复查"}
                  className={
                    (experiment.review?.stopTriggered || "未触发") === value
                      ? "on"
                      : ""
                  }
                  onClick={() => updateExperimentReview("stopTriggered", value)}
                >
                  {value}
                </button>
              ))}
            </section>
            <section>
              <b>对原假设的判定</b>
              {(
                [
                  "支持假设",
                  "部分支持",
                  "不支持假设",
                ] as ExperimentReview["verdict"][]
              ).map((value) => (
                <button
                  key={value}
                  disabled={experiment.status === "已复查"}
                  className={
                    (experiment.review?.verdict || "部分支持") === value
                      ? "on"
                      : ""
                  }
                  onClick={() => updateExperimentReview("verdict", value)}
                >
                  {value}
                </button>
              ))}
            </section>
          </div>
          <footer>
            <div>
              <b>原止损线</b>
              <span>{experiment.stopLoss}</span>
            </div>
            <button
              disabled={
                !experimentReviewComplete || experiment.status === "已复查"
              }
              onClick={completeExperimentReview}
            >
              {experiment.status === "已复查"
                ? "已写入复诊证据 ✓"
                : "完成复查并写入证据"}
            </button>
          </footer>
        </section>
      )}
      {experiment?.retrospective && diffPair[0].nextExperimentDraft && (
        <section
          className={`experiment-retrospective retro-${experiment.retrospective.decision}`}
        >
          <header>
            <div>
              <small>M₆₄ 实验复盘与下一步生成 V0.1</small>
              <b>{experiment.retrospective.decision}</b>
              <p>{experiment.retrospective.lesson}</p>
            </div>
            <span>{experiment.retrospective.decision}</span>
          </header>
          <div className="retro-body">
            <article>
              <b>为什么这样判断</b>
              <p>{experiment.retrospective.nextReason}</p>
            </article>
            <article>
              <b>下一轮假设</b>
              <p>{diffPair[0].nextExperimentDraft.hypothesis}</p>
            </article>
            <article>
              <b>下一轮最小行动</b>
              <p>{diffPair[0].nextExperimentDraft.action}</p>
            </article>
            <article>
              <b>继续观察</b>
              <p>{diffPair[0].nextExperimentDraft.metric}</p>
            </article>
          </div>
          <footer>
            草案已保存；从此节点发起下一次复诊并存档后，将自动带入新的行动实验单。
          </footer>
        </section>
      )}
    </>
  );
}
