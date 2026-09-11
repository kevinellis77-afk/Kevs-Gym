import { useState } from "react";

import {
  saveHealthEntry,
  getHealthEntries,
} from "../utils/healthStorage";

import ProgressChart from "../components/ProgressChart";

type HealthProps = {
  onBack?: () => void;
};

export default function Health({
  onBack,
}: HealthProps) {
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [restingHr, setRestingHr] = useState("");

  const [entries, setEntries] = useState(getHealthEntries());

  const handleSave = () => {
    const newEntry = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString("en-GB"),
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

  const latestEntry = entries.length > 0 ? entries[0] : null;

  const weightTrendData = [...entries]
    .reverse()
    .map((entry: any) => ({
      date: entry.date,
      weight: entry.weight,
    }));

  const previousEntries = entries.slice(1, 6);

  return (
    <div className="app">
      <div className="page-header">
        <h1 className="page-title">Health Dashboard</h1>
      </div>

      {/* LATEST METRICS */}

      <div className="card">
        <h2 className="section-heading">Latest Metrics</h2>

        {!latestEntry && (
          <p className="empty-state">
            No measurements logged yet.
          </p>
        )}

        {latestEntry && (
          <div className="health-grid-display">
            <div className="health-metric">
              <span className="health-metric-label">Weight</span>
              <div className="health-metric-value">
                {latestEntry.weight}
                <span className="health-metric-unit">kg</span>
              </div>
            </div>

            <div className="health-metric">
              <span className="health-metric-label">Waist</span>
              <div className="health-metric-value">
                {latestEntry.waist}
                <span className="health-metric-unit">in</span>
              </div>
            </div>

            <div className="health-metric">
              <span className="health-metric-label">Blood Pressure</span>
              <div className="health-metric-value">
                {latestEntry.systolic}/{latestEntry.diastolic}
              </div>
            </div>

            <div className="health-metric">
              <span className="health-metric-label">Resting HR</span>
              <div className="health-metric-value">
                {latestEntry.restingHr}
                <span className="health-metric-unit">bpm</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD MEASUREMENT */}

      <div className="card">
        <h2 className="section-heading">Add Measurement</h2>

        <div className="health-input-grid">
          <div>
            <label className="field-label">Weight (kg)</label>
            <input
              className="field-input"
              type="number"
              inputMode="decimal"
              placeholder="0.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Waist (in)</label>
            <input
              className="field-input"
              type="number"
              inputMode="decimal"
              placeholder="0.0"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Systolic BP</label>
            <input
              className="field-input"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Diastolic BP</label>
            <input
              className="field-input"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Resting HR</label>
            <input
              className="field-input"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={restingHr}
              onChange={(e) => setRestingHr(e.target.value)}
            />
          </div>
        </div>

        <button className="finish-btn" onClick={handleSave}>
          Save Health Entry
        </button>
      </div>

      {/* HISTORICAL TREND */}

      <ProgressChart title="Weight Trend" data={weightTrendData} />

      {previousEntries.length > 0 && (
        <div className="card">
          <h2 className="section-heading">History</h2>

          {previousEntries.map((entry: any) => (
            <div key={entry.id} className="history-row">
              <span className="history-date">{entry.date}</span>

              <div className="history-metrics">
                <span>{entry.weight}kg</span>
                <span>
                  {entry.systolic}/{entry.diastolic}
                </span>
                <span>{entry.restingHr}bpm</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {onBack && (
        <button className="btn-secondary" onClick={onBack}>
          Back to Dashboard
        </button>
      )}
    </div>
  );
}
