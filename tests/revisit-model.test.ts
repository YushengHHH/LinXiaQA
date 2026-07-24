import assert from "node:assert/strict";
import test from "node:test";
import {
  makeRevisitConfidence,
  makeRevisitDecisionGate,
  makeTrendVerdict,
  type RecordItem,
} from "../lib/revisit-model.ts";

function record(overrides: Partial<RecordItem> = {}): RecordItem {
  return {
    date: "2026/7/24",
    hex: "乾 · 测试",
    target: "目标",
    mode: "半自动",
    progress: 50,
    conclusionDiff: "风险：轻度提醒 → 中度预警",
    ...overrides,
  };
}

test("confidence stays cautious when a revisit has no evidence", () => {
  const result = makeRevisitConfidence([record()]);
  assert.equal(result.score, 12);
  assert.equal(result.level, "审慎");
  assert.match(result.next, /优先补证/);
});

test("confidence reaches 100 with continuous, balanced, verified evidence", () => {
  const current = record({
    feedback: "已执行",
    evidence: {
      action: "暂停旧会议",
      support: "责任确认更快",
      counter: "资源冲突仍在",
      source: "项目数据与会议记录",
      verifiability: "已验证",
    },
  });
  const result = makeRevisitConfidence([
    current,
    record({ feedback: "已执行" }),
  ]);
  assert.equal(result.score, 100);
  assert.equal(result.level, "较高");
});

test("decision gate allows only reversible loss control under high risk and low confidence", () => {
  const confidence = makeRevisitConfidence([
    record({ risk: "风险强度：强烈预警。" }),
  ]);
  const gate = makeRevisitDecisionGate(
    confidence,
    record({ risk: "风险强度：强烈预警。" }),
  );
  assert.equal(gate.status, "止损观察");
  assert.ok(gate.allowed.some((item) => item.includes("暂停")));
  assert.ok(gate.blocked.includes("目标重构"));
});

test("decision gate permits controlled escalation only after verified evidence", () => {
  const current = record({
    evidence: {
      action: "小范围试验",
      support: "指标改善",
      counter: "一个接口无变化",
      source: "业务数据",
      verifiability: "已验证",
    },
  });
  const confidence = makeRevisitConfidence([current, record()]);
  const gate = makeRevisitDecisionGate(confidence, current);
  assert.equal(gate.status, "允许升级");
  assert.ok(gate.blocked.some((item) => item.includes("永久判断")));
});

test("trend verdict explains a path change", () => {
  const result = makeTrendVerdict([
    record({ pathName: "重点校正" }),
    record({ pathName: "顺势微调" }),
  ]);
  assert.equal(result.title, "路已转向，先稳边界");
  assert.ok(result.basis.some((item) => item.startsWith("路径依据：")));
});
