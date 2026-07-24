"use client";
import { BrandMark } from "./brand-mark";
import { DiagnosisPage } from "./diagnosis-page";
import { HistoryPage } from "./history-page";
import { HomePage } from "./home-page";
import { ReportPage } from "./report-page";
import { SystemPage } from "./system-page";
import { useDiagnosisController } from "./use-diagnosis-controller";
export default function Home() {
  const {
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
  } = useDiagnosisController();
  return (
    <main>
      <header className="top">
        <button className="brand" onClick={() => nav("home")}>
          <BrandMark className="brand-symbol" />
          <span>
            <b>知道 · 管理</b>
            <small>林下问路｜网罟天下，以佃以渔</small>
          </span>
        </button>
        <nav>
          <button onClick={start}>处境诊断</button>
          <button onClick={() => nav("system")}>方法体系</button>
          <button onClick={() => nav("history")}>
            演化记录 <i>{records.length}</i>
          </button>
        </nav>
      </header>
      {screen !== "home" && (
        <>
          <div className="subnav">
            <button onClick={() => nav("home")}>← 林下入口</button>
            <ol>
              {["知境", "见势", "择路", "迭代"].map((x, i) => (
                <li
                  className={
                    (screen === "diagnose" && i <= 0) ||
                    (screen === "map" && i <= 2) ||
                    screen === "history"
                      ? "on"
                      : ""
                  }
                  key={x}
                >
                  <span>0{i + 1}</span>
                  {x}
                </li>
              ))}
            </ol>
            <b>FSKN / V6.0</b>
          </div>
          <div className="ui-legend">
            <span>
              <b>深色/箭头</b>可点击动作
            </span>
            <span>
              <b>浅色标签</b>诊断信息
            </span>
            <span>
              <b>边框卡片</b>解释内容
            </span>
          </div>
        </>
      )}

      {screen === "home" && (
        <HomePage start={start} openSystem={() => nav("system")} />
      )}

      {screen === "diagnose" && (
        <DiagnosisPage
          step={step}
          setStep={setStep}
          revisit={revisit}
          complaint={complaint}
          setComplaint={setComplaint}
          lens={lens}
          profile={profile}
          activeQuestions={activeQuestions}
          focusOptions={focusOptions}
          submitComplaint={submitComplaint}
          chooseFocus={chooseFocus}
          answer={answer}
        />
      )}

      {screen === "map" && (
        <ReportPage
          currentHex={currentHex}
          psychHex={psychHex}
          structHex={structHex}
          targetHex={targetHex}
          hex={hex}
          chosen={chosen}
          targetPaths={targetPaths}
          riskLevel={riskLevel}
          taskImpact={taskImpact}
          answers={answers}
          evidence={evidence}
          topic={topic}
          profile={profile}
          revisit={revisit}
          actionPlan={actionPlan}
          path={path}
          setPath={setPath}
          feedback={feedback}
          setFeedback={setFeedback}
          nextReview={nextReview}
          mode={mode}
          setMode={setMode}
          modes={modes}
          save={save}
          saved={saved}
        />
      )}

      {screen === "system" && <SystemPage start={start} />}

      {screen === "history" && (
        <HistoryPage
          records={records}
          setRecords={setRecords}
          taskStates={taskStates}
          setTaskStates={setTaskStates}
          startRevisit={startRevisit}
          start={start}
          emptyMark={<BrandMark className="empty-symbol" />}
        />
      )}
      <footer>
        <div>
          <BrandMark className="footer-symbol" />
          <span>
            <b>知道 · 管理</b>
            <small>林下问路</small>
          </span>
        </div>
        <p>网罟天下，以佃以渔</p>
        <span>知境，而后知道。</span>
      </footer>
    </main>
  );
}
