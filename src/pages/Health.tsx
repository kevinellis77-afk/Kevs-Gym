import { useState } from "react";

import {
  saveHealthEntry,
  getHealthEntries,
} from "../utils/healthStorage";

import { getHealthDelta } from "../utils/healthDeltas";
import { parseHealthDate } from "../utils/parseHealthDate";
import ProgressChart from "../components/ProgressChart";
import BPChart from "../components/BPChart";
import { CheckIcon } from "../components/icons";

// 15st 7lb, converted to kg. Update this if the goal changes.
const WEIGHT_GOAL_KG = 98.4;

const TWELVE_WEEKS_MS = 12 * 7 * 24 * 60 * 60 * 1000;

function formatShortDate(dateValue: string) {
  const parsed = parseHealthDate(dateValue);

  if (isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed
    .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    .toUpperCase();
}

function formatDeltaText(
  value: number | null,
  suffix: string
): string | null {
  if (value === null) return null;
  if (value === 0) return "No Change";

  const sign = value > 0 ? "+" : "";
  return `${sign}${value}${suffix} in 4 Weeks`;
}

export default function Health() {
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [restingHr, setRestingHr] = useState("");

  const [entries, setEntries] = useState(getHealthEntries());

  const isValid =
    weight.trim() !== "" &&
    Number(weight) > 0 &&
    waist.trim() !== "" &&
    Number(waist) > 0 &&
    systolic.trim() !== "" &&
    Number(systolic) > 0 &&
    diastolic.trim() !== "" &&
    Number(diastolic) > 0 &&
    restingHr.trim() !== "" &&
    Number(restingHr) > 0;

  const handleSave = () => {
    if (!isValid) return;

    const newEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      weight: Number(weight),
      waist: Number(waist),
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      restingHr: Number(restingHr),
    };

    saveHealthEntry(newEntry);

    setEntries(getHealthEntries());

    setWeight("");
    setWaist("");
    setSystolic("");
    setDiastolic("");
    setRestingHr("");
  };

  const latestEntry = entries.length > 0 ? (entries[0] as any) : null;
  const previousEntries = entries.slice(1, 6);

  const cutoff = Date.now() - TWELVE_WEEKS_MS;
  const recentEntries = [...entries]
    .filter((entry: any) => {
      const entryTime = parseHealthDate(entry.date).getTime();
      return !isNaN(entryTime) && entryTime >= cutoff;
    })
    .reverse();

  const weightTrendData = recentEntries.map((entry: any) => ({
    date: entry.date,
    weight: entry.weight,
  }));

  const bpTrendData = recentEntries.map((entry: any) => ({
    date: entry.date,
    systolic: entry.systolic,
    diastolic: entry.diastolic,
  }));

  const weightDelta = formatDeltaText(getHealthDelta("weight"), "");
  const waistDelta = formatDeltaText(getHealthDelta("waist"), "");
  const hrDelta = formatDeltaText(getHealthDelta("restingHr"), "");

  const sysDelta = getHealthDelta("systolic");
  const diaDelta = getHealthDelta("diastolic");
  let bpDeltaText: string | null = null;
  let bpDeltaFlat = true;

  if (sysDelta !== null && diaDelta !== null) {
    if (sysDelta === 0 && diaDelta === 0) {
      bpDeltaText = "No Change";
      bpDeltaFlat = true;
    } else {
      const sysText = `${sysDelta > 0 ? "+" : ""}${sysDelta}`;
      const diaText = `${diaDelta > 0 ? "+" : ""}${diaDelta}`;
      bpDeltaText = `${sysText}/${diaText} in 4 Weeks`;
      bpDeltaFlat = false;
    }
  }

  return (
    <div className="app">
      <div className="screen-head">
        <h1 className="screen-title">Health</h1>
        <span className="screen-head-meta">
          {latestEntry ? formatShortDate(latestEntry.date) : "--"}
        </span>
      </div>

      <div className="metric-grid">
        <div className="metric-cell">
          <span className="metric-label">Weight</span>
          <div className="metric-value-lg">
            {latestEntry ? latestEntry.weight : "--"}
            {latestEntry && <span className="metric-unit">kg</span>}
          </div>
          {weightDelta && (
            <span
              className={
                "metric-delta" +
                (weightDelta === "No Change" ? " metric-delta-muted" : "")
              }
            >
              {weightDelta}
            </span>
          )}
        </div>

        <div className="metric-cell">
          <span className="metric-label">Waist</span>
          <div className="metric-value-lg">
            {latestEntry ? latestEntry.waist : "--"}
            {latestEntry && <span className="metric-unit">in</span>}
          </div>
          {waistDelta && (
            <span
              className={
                "metric-delta" +
                (waistDelta === "No Change" ? " metric-delta-muted" : "")
              }
            >
              {waistDelta}
            </span>
          )}
        </div>

        <div className="metric-cell">
          <span className="metric-label">Blood Pressure</span>
          <div className="metric-value-lg">
            {latestEntry
              ? `${latestEntry.systolic}/${latestEntry.diastolic}`
              : "--"}
          </div>
          {bpDeltaText && (
            <span
              className={
                "metric-delta" + (bpDeltaFlat ? " metric-delta-muted" : "")
              }
            >
              {bpDeltaText}
            </span>
          )}
        </div>

        <div className="metric-cell">
          <span className="metric-label">Resting HR</span>
          <div className="metric-value-lg">
            {latestEntry ? latestEntry.restingHr : "--"}
            {latestEntry && <span className="metric-unit">bpm</span>}
          </div>
          {hrDelta && (
            <span
              className={
                "metric-delta" +
                (hrDelta === "No Change" ? " metric-delta-muted" : "")
              }
            >
              {hrDelta}
            </span>
          )}
        </div>
      </div>

      <div className="chart-block">
        <div className="chart-head">
          <span className="chart-label">Weight &middot; 12 Weeks</span>
        </div>

        <ProgressChart
          data={weightTrendData}
          height={100}
          goalValue={WEIGHT_GOAL_KG}
          goalLabel={`Goal ${WEIGHT_GOAL_KG}kg`}
        />

        {weightTrendData.length > 0 && (
          <div className="chart-axis-labels">
            <span>{formatShortDate(weightTrendData[0].date)}</span>
            <span>
              {formatShortDate(
                weightTrendData[weightTrendData.length - 1].date
              )}
            </span>
          </div>
        )}
      </div>

      <div className="chart-block">
        <div className="chart-head">
          <span className="chart-label">
            Blood Pressure &middot; 12 Weeks
          </span>
        </div>

        <BPChart data={bpTrendData} height={100} />

        {bpTrendData.length > 0 && (
          <div className="chart-axis-labels">
            <span>{formatShortDate(bpTrendData[0].date)}</span>
            <span>
              {formatShortDate(bpTrendData[bpTrendData.length - 1].date)}
            </span>
          </div>
        )}
      </div>

      <span className="field-block-label">Log Today</span>

      <div className="field-grid">
        <div>
          <label className="field-label">Weight KG</label>
          <input
            className="input"
            type="number"
            inputMode="decimal"
            placeholder={
              latestEntry ? String(latestEntry.weight) : "0.0"
            }
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label">Waist IN</label>
          <input
            className="input"
            type="number"
            inputMode="decimal"
            placeholder={latestEntry ? String(latestEntry.waist) : "0.0"}
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label">BP Sys / Dia</label>
          <div className="bp-input-pair">
            <input
              className="input"
              type="number"
              inputMode="numeric"
              placeholder={
                latestEntry ? String(latestEntry.systolic) : "0"
              }
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
            />
            <span className="bp-input-divider">/</span>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              placeholder={
                latestEntry ? String(latestEntry.diastolic) : "0"
              }
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="field-label">Resting HR</label>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            placeholder={
              latestEntry ? String(latestEntry.restingHr) : "0"
            }
            value={restingHr}
            onChange={(e) => setRestingHr(e.target.value)}
          />
        </div>
      </div>

      <button
        className="btn-primary"
        onClick={handleSave}
        disabled={!isValid}
      >
        Save
        <CheckIcon />
      </button>

      {previousEntries.length > 0 && (
        <>
          <div className="list-header">
            <span className="list-header-label">History</span>
          </div>

          {previousEntries.map((entry: any) => (
            <div key={entry.id} className="list-row">
              <span className="list-row-sub">
                {formatShortDate(entry.date)}
              </span>

              <span className="health-history-value">
                {entry.weight}kg &middot; {entry.systolic}/
                {entry.diastolic} &middot; {entry.restingHr}bpm
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
