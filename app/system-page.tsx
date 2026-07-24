"use client";

import { Fragment } from "react";
import {
  getTrigramState,
  hexagramStates,
  trigramStates,
} from "../lib/zhidao-model";

function Trigram({ code, name }: { code?: string; name?: string }) {
  const meta = getTrigramState(name);
  return (
    <span
      className="trigram trigram-verified"
      aria-label={`${meta.name} ${meta.symbol} ${meta.meaning} ${code || meta.code}`}
    >
      <b>{meta.symbol}</b>
      <em>{meta.name}</em>
      <span>
        {meta.lines.map((v, i) => (
          <i className={v} key={i} />
        ))}
      </span>
    </span>
  );
}

function TrigramAudit() {
  return (
    <div className="trigram-audit">
      <p className="eyebrow">八卦校验表 V0.1 · 完整匹配机制</p>
      <h2>卦名、符号、图形、管理含义同源显示。</h2>
      <div>
        {trigramStates.map((meta) => (
          <article key={meta.name}>
            <Trigram name={meta.name} />
            <b>{meta.name}</b>
            <small>
              {meta.symbol} · {meta.meaning} · S₈-{meta.id}
            </small>
          </article>
        ))}
      </div>
    </div>
  );
}
function HexagramAudit() {
  return (
    <div className="hexagram-audit">
      <p className="eyebrow">六十四卦状态表 V0.1 · M₆₄</p>
      <h2>由统一八卦表生成，上卦为参照，下卦为承接。</h2>
      <p>
        这一版先建立 8 × 8
        的可计算状态矩阵。后续六问诊断会把六个爻位写入这里，复诊则比较前后两个
        M₆₄ 状态。
      </p>
      <div className="hex-grid">
        <span className="corner">上 / 下</span>
        {trigramStates.map((upper) => (
          <b key={`h-${upper.name}`}>{upper.name}</b>
        ))}
        {trigramStates.map((lower) => (
          <Fragment key={`row-${lower.name}`}>
            <b>{lower.name}</b>
            {trigramStates.map((upper) => {
              const item = hexagramStates.find(
                (x) =>
                  x.upper.name === upper.name && x.lower.name === lower.name,
              )!;
              return (
                <article key={item.id}>
                  <small>M₆₄-{String(item.id).padStart(2, "0")}</small>
                  <strong>{item.name}</strong>
                  <em>
                    {upper.name}上{lower.name}下
                  </em>
                </article>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function SystemPage({ start }: { start: () => void }) {
  return (
    <section className="system">
      <div className="system-hero">
        <p className="eyebrow">知道管理 · 方案总览</p>
        <h1>
          以关系为体，
          <br />
          以管理实践为用。
        </h1>
        <p>
          这套方案把组织看作一个持续变化的关系网络。它的工作不是给复杂现实贴标签，而是把当下状态、默认趋势与可选目标放进同一个可计算、可讨论的框架。
        </p>
      </div>
      <div className="axioms">
        {[
          [
            "八卦",
            "八种基础处境",
            "三种正交的二相管理行为形成八种基础态，用作底层解释，而不是最终报告主卦。",
          ],
          [
            "六十四卦",
            "八种处境的上下复合",
            "六问把六个管理判断写入初、二、三、四、五、上六个爻位，生成 M₆₄ 主诊断。",
          ],
          [
            "4096 种变卦",
            "六十四卦之间的可达变化",
            "任一现状卦都可能转向任一目标卦，形成 64 × 64 = 4096 条演化关系。",
          ],
        ].map((v) => (
          <article key={v[0]}>
            <small>{v[0]}</small>
            <h2>{v[1]}</h2>
            <p>{v[2]}</p>
          </article>
        ))}
      </div>
      <TrigramAudit />
      <HexagramAudit />
      <div className="math-kernel">
        <aside>
          <p className="eyebrow">数学内核 · M-1.0</p>
          <h2>
            从可观测六问，
            <br />
            进入可计算演化。
          </h2>
          <p>
            以 FSKN
            数学体系为本体，把组织处境映射为离散状态空间、非交换演化和自适应控制问题。
          </p>
        </aside>
        <div>
          {[
            [
              "状态空间",
              "S₈",
              "三种正交的二相管理行为，组成八种基础组织状态。",
            ],
            ["映射空间", "M₆₄", "六问写入六爻，形成六十四种主诊断情境。"],
            [
              "演化空间",
              "P₄₀₉₆",
              "任一现状卦到任一目标卦皆为一条可比较的路径，支持代价、风险和中继点计算。",
            ],
            [
              "控制策略",
              "π*",
              "在惯性驱动力与干预控制力之间寻优，持续修正下一步动作。",
            ],
          ].map((v) => (
            <article key={v[0]}>
              <small>{v[0]}</small>
              <b>{v[1]}</b>
              <p>{v[2]}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="system-map">
        <aside>
          <p className="eyebrow">产品闭环</p>
          <h2>
            诊断不是终点，
            <br />
            而是进入深度内容与持续问答的入口。
          </h2>
        </aside>
        <div>
          {[
            ["诊断", "我现在在哪", "六问 → M₆₄ 主诊断"],
            ["议题", "为什么会这样", "六十四种情境 · 七层阅读"],
            ["问答", "下一步怎么走", "三锚点 · 200字行动指令"],
            ["迭代", "目标还对不对", "内层修路 · 外层换靶"],
          ].map((v, i) => (
            <article key={v[0]}>
              <span>0{i + 1}</span>
              <b>{v[0]}</b>
              <h3>{v[1]}</h3>
              <p>{v[2]}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="principles">
        <p className="eyebrow">三重承诺</p>
        <div>
          <article>
            <b>可解释</b>
            <p>每一个判断都能回到六问、六爻与路径代价。</p>
          </article>
          <article>
            <b>可选择</b>
            <p>系统给出多条路线，目标与陪伴模式由用户决定。</p>
          </article>
          <article>
            <b>可更新</b>
            <p>变化后重新计算，旧答案不会永久定义组织。</p>
          </article>
        </div>
      </div>
      <button className="primary center" onClick={start}>
        从六问进入系统 <span>↗</span>
      </button>
    </section>
  );
}
