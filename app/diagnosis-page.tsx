"use client";

import type { DiagnosisQuestion } from "../lib/zhidao-model";
import type { RecordItem } from "../lib/revisit-model";

type Props = {
  step: number;
  setStep: (value: number) => void;
  revisit: RecordItem | null;
  complaint: string;
  setComplaint: (value: string) => void;
  lens: { name: string };
  profile: { object: string; action: string; relation: string; risk: string };
  activeQuestions: DiagnosisQuestion[];
  focusOptions: { id: string; label: string; desc: string }[];
  submitComplaint: () => void;
  chooseFocus: (id: string) => void;
  answer: (value: DiagnosisQuestion["options"][number]["value"]) => void;
};

export function DiagnosisPage({
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
}: Props) {
  return (
    <section className="diagnose">
      <aside>
        <p className="eyebrow">
          {step === -1
            ? "第零问 · 主诉"
            : step === -2
              ? "补一问 · 校准"
              : "六问成卦"}
        </p>
        <h1>
          {revisit ? (
            <>
              <span>带着上次判断，</span>
              <br />
              <span>再问一次路。</span>
            </>
          ) : (
            <>
              <span>先把困惑放下，</span>
              <br />
              <span>再一起问路。</span>
            </>
          )}
        </h1>
        <p>
          {revisit
            ? "复诊不是推翻上次判断，而是把新变化写入系统：哪里变清楚了，哪里仍在滑向惯性，下一步是否需要换路。"
            : step === -1
              ? "不必完整描述背景。只要写下此刻最卡住、最反复、最说不清的一件事。"
              : step === -2
                ? "先补一个最小判断：这不是正式诊断，只是帮系统把主诉画像校准一点。"
                : `系统已识别为「${lens.name}」语境，六问会围绕你的主诉展开，并写入六个爻位生成 M₆₄ 现状卦。`}
        </p>
        {step >= -2 && step !== -1 && (
          <div className="profile-mini">
            <small>主诉画像标签</small>
            <span>
              <b>对象</b>
              {profile.object}
            </span>
            <span>
              <b>动作</b>
              {profile.action}
            </span>
            <span>
              <b>关系</b>
              {profile.relation}
            </span>
            <span>
              <b>风险</b>
              {profile.risk}
            </span>
          </div>
        )}
        {revisit && (
          <div className="revisit-card">
            <small>复诊来源</small>
            <b>{revisit.topic || "早期诊断记录"}</b>
            <p>{revisit.summary || revisit.target}</p>
            <em>{revisit.action || revisit.risk}</em>
          </div>
        )}
        <div className="progress">
          <span
            style={{
              width: `${step === -1 ? 10 : step === -2 ? 20 : ((step + 1) / activeQuestions.length) * 100}%`,
            }}
          />
        </div>
        <small>
          {step === -1
            ? "0 / 6"
            : step === -2
              ? "校准 / 6"
              : `${step + 1} / ${activeQuestions.length}`}
        </small>
      </aside>
      {step === -1 ? (
        <div className="question complaint">
          <p className="eyebrow">主诉 · 围绕真实问题诊断</p>
          <h2>
            {revisit
              ? "这次复诊，发生了哪些新变化？"
              : "此刻最困扰你的组织问题是什么？"}
          </h2>
          <textarea
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder={
              revisit
                ? "例如：上次建议先止住跨部门扯皮；这两周我暂停了一个会议，但资源争夺还在，团队对责任边界更清楚了一点。"
                : "例如：目标很清楚，但团队总是推不动；几个部门都很忙，却没人愿意真正负责；我感觉组织哪里不对，但说不清。"
            }
            autoFocus
          />
          <div className="complaint-tips">
            <span>{revisit ? "写变化即可" : "一句话即可"}</span>
            <span>{revisit ? "可写行动结果" : "可以很模糊"}</span>
            <span>{revisit ? "系统会重新六问" : "后面六问会帮你定位"}</span>
          </div>
          <button className="primary" onClick={submitComplaint}>
            {revisit ? "带着变化进入复诊六问" : "先补一问，再进入六问"}{" "}
            <span>↗</span>
          </button>
        </div>
      ) : step === -2 ? (
        <div className="question followup">
          <p className="eyebrow">主诉画像 · 快速校准</p>
          <h2>这件事最先卡住的是哪里？</h2>
          <p>
            选择一个最接近的入口即可。选错也没关系，后面的六问会继续修正判断。
          </p>
          <div className="options">
            {focusOptions.map((x, i) => (
              <button onClick={() => chooseFocus(x.id)} key={x.id}>
                <span>{String.fromCharCode(65 + i)}</span>
                <b>{x.label}</b>
                <small>{x.desc}</small>
                <i>校准画像 →</i>
              </button>
            ))}
          </div>
          <button className="back" onClick={() => setStep(-1)}>
            ← 修改主诉
          </button>
        </div>
      ) : (
        <div className="question">
          <p className="eyebrow">
            {activeQuestions[step].label} · {lens.name}
          </p>
          <h2>{activeQuestions[step].title}</h2>
          <p>{activeQuestions[step].note}</p>
          <small className="axis">{activeQuestions[step].axis}</small>
          <div className="options">
            {activeQuestions[step].options.map((x, i) => (
              <button onClick={() => answer(x.value)} key={x.text}>
                <span>{String.fromCharCode(65 + i)}</span>
                <b>{x.text}</b>
                <small>{x.evidence}</small>
                <i>写入第 {x.value.line || step + 1} 爻 →</i>
              </button>
            ))}
          </div>
          {step > 0 && (
            <button className="back" onClick={() => setStep(step - 1)}>
              ← 返回上一问
            </button>
          )}
          {step === 0 && (
            <button className="back" onClick={() => setStep(-2)}>
              ← 返回补一问
            </button>
          )}
        </div>
      )}
    </section>
  );
}
