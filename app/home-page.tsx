"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "./brand-mark";

const guaNames = [
  "坤",
  "剥",
  "比",
  "观",
  "豫",
  "晋",
  "萃",
  "否",
  "谦",
  "艮",
  "蹇",
  "渐",
  "小过",
  "旅",
  "咸",
  "遁",
  "师",
  "蒙",
  "坎",
  "涣",
  "解",
  "未济",
  "困",
  "讼",
  "升",
  "蛊",
  "井",
  "巽",
  "恒",
  "鼎",
  "大过",
  "姤",
  "复",
  "颐",
  "屯",
  "益",
  "震",
  "噬嗑",
  "随",
  "无妄",
  "明夷",
  "贲",
  "既济",
  "家人",
  "丰",
  "离",
  "革",
  "同人",
  "临",
  "损",
  "节",
  "中孚",
  "归妹",
  "睽",
  "兑",
  "履",
  "泰",
  "大畜",
  "需",
  "小畜",
  "大壮",
  "大有",
  "夬",
  "乾",
];
function makeChangeScene() {
  const fromCode = Math.floor(Math.random() * 64),
    moving = Math.floor(Math.random() * 6),
    toCode = fromCode ^ (1 << moving),
    toLines = Array.from({ length: 6 }, (_, i) => (toCode >> i) & 1);
  return { from: guaNames[fromCode], to: guaNames[toCode], moving, toLines };
}
function DynamicChange() {
  const [scene, setScene] = useState({
    from: "乾",
    to: "履",
    moving: 2,
    toLines: [1, 1, 0, 1, 1, 1],
  });
  useEffect(() => {
    setScene(makeChangeScene());
    const timer = setInterval(() => setScene(makeChangeScene()), 4200);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="change-stage" aria-label="动态变卦演示">
      <div className="change-meta">
        <span>动态变卦 · 随机一爻</span>
        <b>
          {scene.from}之{scene.to}
        </b>
        <small>一次变卦，多种可能</small>
      </div>
      <div className="six-lines">
        {scene.toLines.map((v, i) => (
          <i
            className={`${v ? "yang" : "yin"} ${i === scene.moving ? "moving" : ""}`}
            key={`${scene.from}-${scene.to}-${i}`}
          >
            <span />
            <span />
          </i>
        ))}
      </div>
      <em className="change-word change">变易</em>
      <em className="change-word constant">不易</em>
      <em className="change-word simple">简易</em>
      <div className="change-caption">
        <span>本卦 · {scene.from}</span>
        <i>第 {scene.moving + 1} 爻变</i>
        <span>之卦 · {scene.to}</span>
      </div>
    </div>
  );
}

export function HomePage({
  start,
  openSystem,
}: {
  start: () => void;
  openSystem: () => void;
}) {
  return (
    <>
      <section className="hero">
        <div className="hero-left">
          <div className="hero-brand">
            <BrandMark className="hero-symbol" />
            <div>
              <b>林下问路</b>
              <small>ZHIDAO MANAGEMENT</small>
            </div>
          </div>
          <p className="eyebrow">林下问路 · 组织处境诊断与动态推演</p>
          <h1>
            知境，
            <br />
            <em>而后知道。</em>
          </h1>
          <p className="lead">
            以关系结构为镜，以管理实践为用。
            <br />
            看见现在在哪里，不改变会去哪里，以及下一爻可以怎样动。
          </p>
          <div className="actions">
            <button className="primary" onClick={start}>
              开始六问诊断 <span>↗</span>
            </button>
            <button className="link" onClick={() => openSystem()}>
              先了解方法体系
            </button>
          </div>
          <div className="promise">
            <span>01 六问成卦</span>
            <span>02 动态变卦</span>
            <span>03 三路寻优</span>
          </div>
        </div>
        <DynamicChange />
      </section>
      <section className="triple">
        <div className="section-title">
          <p className="eyebrow">六问路径沙盘</p>
          <h2>
            不是一条静态路线，
            <br />
            而是持续修正的航向。
          </h2>
        </div>
        {[
          ["现状之卦", "六问成卦", "把六个管理判断写入六爻，生成 M₆₄ 主诊断"],
          ["心理/事理", "双重惯性", "从六爻现状卦推演主观趋避与客观滑向"],
          ["目标路径", "差异爻寻优", "生成目标卦，并比较先动哪几爻"],
        ].map((v, i) => (
          <article key={v[0]}>
            <span>0{i + 1}</span>
            <h3>{v[0]}</h3>
            <b>{v[1]}</b>
            <p>{v[2]}</p>
            <i />
          </article>
        ))}
      </section>
      <section className="engine">
        <aside>
          <p className="eyebrow">四层策略引擎</p>
          <h2>
            古典意象在表，
            <br />
            离散结构在里。
          </h2>
          <p>
            从五行的关系空间，到八卦的瞬时处境、六十四卦的情境议题，再到易林的演化建议。用户不必理解数学，也能获得可解释的判断。
          </p>
          <button className="light" onClick={() => openSystem()}>
            查看完整映射 →
          </button>
        </aside>
        <div>
          {[
            ["0", "五行", "管理的基本关系"],
            ["1", "八卦", "八种基础处境"],
            ["2", "六十四卦", "六十四种情境议题"],
            ["3", "易林", "变化中的操作线索"],
          ].map((v) => (
            <article key={v[0]}>
              <small>LEVEL {v[0]}</small>
              <b>{v[1]}</b>
              <p>{v[2]}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
