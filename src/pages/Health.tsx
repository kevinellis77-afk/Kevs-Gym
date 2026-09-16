import { useState } from "react";

import {
  saveHealthEntry,
  getHealthEntries,
  getLatestEntryWithField,
} from "../utils/healthStorage";

import { getHealthDelta } from "../utils/healthDeltas";
import { parseHealthDate } from "../utils/parseHealthDate";
import ProgressChart from "../components/ProgressChart";
import BPChart from "../components/BPChart";
import SleepChart from "../components/SleepChart";
import { CheckIcon } from "../components/icons";

// 15st 7lb, converted to kg. Update this if the goal changes.
const WEIGHT_GOAL_KG = 98.4;

const TWELVE_WEEKS_MS = 12 * 7 * 24 * 60 * 60 * 1000;

const SLEEP_OPTIONS = [1, 2, 3, 4, 5];

function formatShortDate(dateValue: string) {
  const parsed = parseHealthDate(dateValue);

  if (isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed
    .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    .toUpperCase();
}

// Entries can be partial now, so build the history line from
// whichever parts this entry actually has (weight was already the
// only weight-like group shown here; sleep is included since a
// sleep-only entry would otherwise render as blank).
function formatHistoryValue(entry: any): string {
  const parts: string[] = [];

  if (entry.weight !== undefined) parts.push(`${entry.weight}kg`);
  if (entry.systolic !== undefined && entry.diastolic !== undefined) {
    parts.push(`${entry.systolic}/${entry.diastolic}`);
  }
  if (entry.restingHr !== undefined) parts.push(`${entry.restingHr}bpm`);
  if (entry.sleepQuality !== undefined) {
    parts.push(`Sleep ${entry.sleepQuality}/5`);
  }

  return parts.length > 0 ? parts.join(" \u00b7 ") : "--";
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
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);

  const [entries, setEntries] = useState(getHealthEntries());

  // Each metric can now be logged on its own - you don't need all
  // five to save an entry. BP is the one exception: systolic and
  // diastolic are only meaningful as a pair, so both or neither.
  const hasWeight = weight.trim() !== "" && Number(weight) > 0;
  const hasWaist = waist.trim() !== "" && Number(waist) > 0;
  const hasSystolic = systolic.trim() !== "" && Number(systolic) > 0;
  const hasDiastolic = diastolic.trim() !== "" && Number(diastolic) > 0;
  const hasBp = hasSystolic && hasDiastolic;
  const bpIncomplete = (hasSystolic || hasDiastolic) && !hasBp;
  const hasRestingHr = restingHr.trim() !== "" && Number(restingHr) > 0;
  const hasSleepQuality = sleepQuality !== null;

  const isValid =
    (hasWeight || hasWaist || hasBp || hasRestingHr || hasSleepQuality) &&
    !bpIncomplete;

  const handleSave = () => {
    if (!isValid) return;

    const newEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ...(hasWeight && { weight: Number(weight) }),
      ...(hasWaist && { waist: Number(waist) }),
      ...(hasBp && {
        systolic: Number(systolic),
        diastolic: Number(diastolic),
      }),
      ...(hasRestingHr && { restingHr: Number(restingHr) }),
      ...(hasSleepQuality && { sleepQuality: sleepQuality as number }),
    };

    saveHealthEntry(newEntry);

    setEntries(getHealthEntries());

    setWeight("");
    setWaist("");
    setSystolic("");
    setDiastolic("");
    setRestingHr("");
    setSleepQuality(null);
  };

  // "Latest" is now per-metric, not one shared entry - a weight-only
  // entry logged today shouldn't blank out last week's BP reading.
  const latestEntry = entries.length > 0 ? (entries[0] as any) : null;
  const latestWeightEntry = getLatestEntryWithField("weight");
  const latestWaistEntry = getLatestEntryWithField("waist");
  const latestBpEntry = getLatestEntryWithField("systolic");
  const latestHrEntry = getLatestEntryWithField("restingHr");
  const latestSleepEntry = getLatestEntryWithField("sleepQuality");

  const previousEntries = entries.slice(1, 6);

  const cutoff = Date.now() - TWELVE_WEEKS_MS;
  const recentEntries = [...entries]
    .filter((entry: any) => {
      const entryTime = parseHealthDate(entry.date).getTime();
      return !isNaN(entryTime) && entryTime >= cutoff;
    })
    .reverse();

  // Each chart only plots entries that actually logged that metric -
  // a waist-only entry shouldn't put a gap or a zero in the weight
  // line.
  const weightTrendData = recentEntries
    .filter((entry: any) => entry.weight !== undefined)
    .map((entry: any) => ({
      date: entry.date,
      weight: entry.weight,
    }));

  const bpTrendData = recentEntries
    .filter(
      (entry: any) =>
        entry.systolic !== undefined && entry.diastolic !== undefined
    )
    .map((entry: any) => ({
      date: entry.date,
      systolic: entry.systolic,
      diastolic: entry.diastolic,
    }));

  const sleepTrendData = recentEntries
    .filter((entry: any) => entry.sleepQuality !== undefined)
    .map((entry: any) => ({
      date: entry.date,
      sleepQuality: entry.sleepQuality,
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
            {latestWeightEntry ? latestWeightEntry.weight : "--"}
            {latestWeightEntry && <span className="metric-unit">kg</span>}
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
            {latestWaistEntry ? latestWaistEntry.waist : "--"}
            {latestWaistEntry && <span className="metric-unit">in</span>}
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
            {latestBpEntry
              ? `${latestBpEntry.systolic}/${latestBpEntry.diastolic}`
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
            {latestHrEntry ? latestHrEntry.restingHr : "--"}
            {latestHrEntry && <span className="metric-unit">bpm</span>}
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

      <div className="chart-block">
        <div className="chart-head">
          <span className="chart-label">
            Sleep Quality &middot; 12 Weeks
          </span>

          {latestSleepEntry && (
            <span className="chart-delta">
              Last {latestSleepEntry.sleepQuality}/5
            </span>
          )}
        </div>

        <SleepChart data={sleepTrendData} height={64} />

        {sleepTrendData.length > 0 && (
          <div className="chart-axis-labels">
            <span>{formatShortDate(sleepTrendData[0].date)}</span>
            <span>
              {formatShortDate(
                sleepTrendData[sleepTrendData.length - 1].date
              )}
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
              latestWeightEntry ? String(latestWeightEntry.weight) : "0.0"
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
            placeholder={
              latestWaistEntry ? String(latestWaistEntry.waist) : "0.0"
            }
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
                latestBpEntry ? String(latestBpEntry.systolic) : "0"
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
                latestBpEntry ? String(latestBpEntry.diastolic) : "0"
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
              latestHrEntry ? String(latestHrEntry.restingHr) : "0"
            }
            value={restingHr}
            onChange={(e) => setRestingHr(e.target.value)}
          />
        </div>
      </div>

      <span className="rpe-block-label">Sleep Quality</span>

      <div className="rpe-grid-5">
        {SLEEP_OPTIONS.map((value) => (
          <button
            key={value}
            className={
              "rpe-btn" +
              (sleepQuality === value ? " rpe-btn-active" : "")
            }
            onClick={() =>
              setSleepQuality(sleepQuality === value ? null : value)
            }
          >
            {value}
          </button>
        ))}
      </div>

      <p className="field-hint">1 Poor &middot; 5 Great</p>

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
                {formatHistoryValue(entry)}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}