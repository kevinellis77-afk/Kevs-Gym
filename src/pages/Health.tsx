import { useState } from "react";

import {
  saveHealthEntry,
  getHealthEntries,
} from "../utils/healthStorage";

type HealthProps = {
  onBack?: () => void;
};

export default function Health({
  onBack,
}: HealthProps) {
  const [weight, setWeight] =
    useState("");

  const [waist, setWaist] =
    useState("");

  const [systolic, setSystolic] =
    useState("");

  const [diastolic, setDiastolic] =
    useState("");

  const [restingHr, setRestingHr] =
    useState("");

  const [entries, setEntries] =
    useState(getHealthEntries());

  const handleSave = () => {
    const newEntry = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString(
        "en-GB"
      ),
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

    alert("Health entry saved");
  };

  const latestEntry =
    entries.length > 0
      ? entries[0]
      : null;

  return (
    <div className="app">
      <h1>Health Tracker</h1>

      <div className="health-grid">
        <input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) =>
            setWeight(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Waist (inches)"
          value={waist}
          onChange={(e) =>
            setWaist(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Systolic BP"
          value={systolic}
          onChange={(e) =>
            setSystolic(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Diastolic BP"
          value={diastolic}
          onChange={(e) =>
            setDiastolic(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Resting HR"
          value={restingHr}
          onChange={(e) =>
            setRestingHr(e.target.value)
          }
        />
      </div>

      <button
        className="finish-btn"
        onClick={handleSave}
      >
        Save Health Entry
      </button>

      <h2
        style={{
          marginTop: "30px",
        }}
      >
        Latest Entry
      </h2>

      {latestEntry && (
        <div className="exercise-card">
          <p>
            <strong>Date:</strong>{" "}
            {latestEntry.date}
          </p>

          <p>
            <strong>Weight:</strong>{" "}
            {latestEntry.weight} kg
          </p>

          <p>
            <strong>Waist:</strong>{" "}
            {latestEntry.waist}"
          </p>

          <p>
            <strong>Blood Pressure:</strong>{" "}
            {latestEntry.systolic}/
            {latestEntry.diastolic}
          </p>

          <p>
            <strong>Resting HR:</strong>{" "}
            {latestEntry.restingHr} bpm
          </p>
        </div>
      )}

      {onBack && (
        <button
          className="finish-btn"
          style={{
            marginTop: "20px",
          }}
          onClick={onBack}
        >
          Back to Dashboard
        </button>
      )}
    </div>
  );
}