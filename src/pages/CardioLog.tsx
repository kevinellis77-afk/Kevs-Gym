import { useState } from "react";
import { saveSession } from "../utils/sessionStorage";
import { CheckIcon } from "../components/icons";

type Props = {
  onFinish: () => void;
};

const CARDIO_TYPES = ["Walking", "Cycling", "Rowing", "Intervals"];
const EFFORT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Cardio sessions are just another WorkoutSession (see types/session.ts)
 * with type: "cardio" - no exercises/workoutId/workoutName, and
 * `duration` doubles as the actual logged minutes rather than a
 * lifting workout's estimated length. That's what lets History,
 * the weekly rollups, and the dashboard's session count all pick
 * these up for free.
 */
export default function CardioLog({ onFinish }: Props) {
  const [cardioType, setCardioType] = useState<string | null>(null);
  const [minutes, setMinutes] = useState("");
  const [cardioRpe, setCardioRpe] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const hasMinutes = minutes.trim() !== "" && Number(minutes) > 0;
  const isValid = cardioType !== null && hasMinutes && cardioRpe !== null;

  const handleSave = () => {
    if (!isValid) return;

    saveSession({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      notes,
      duration: Number(minutes),
      type: "cardio",
      cardioType: cardioType as string,
      cardioRpe: cardioRpe as number,
    });

    onFinish();
  };

  return (
    <div className="app">
      <div className="screen-head">
        <h1 className="screen-title">Log Cardio</h1>
      </div>

      <span className="field-block-label">Type</span>

      <div className="chip-row">
        {CARDIO_TYPES.map((option) => (
          <button
            key={option}
            className={
              "chip" + (cardioType === option ? " chip-active" : "")
            }
            onClick={() =>
              setCardioType(cardioType === option ? null : option)
            }
          >
            {option}
          </button>
        ))}
      </div>

      <div className="field-grid">
        <div>
          <label className="field-label">Minutes</label>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </div>
      </div>

      <span className="rpe-block-label">Effort</span>

      <div className="rpe-grid-5">
        {EFFORT_OPTIONS.map((value) => (
          <button
            key={value}
            className={
              "rpe-btn" + (cardioRpe === value ? " rpe-btn-active" : "")
            }
            onClick={() =>
              setCardioRpe(cardioRpe === value ? null : value)
            }
          >
            {value}
          </button>
        ))}
      </div>

      <textarea
        className="input"
        style={{ margin: "16px", width: "calc(100% - 32px)" }}
        placeholder="Any notes on this session?"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
      />

      <button
        className="btn-primary"
        onClick={handleSave}
        disabled={!isValid}
      >
        Save
        <CheckIcon />
      </button>
    </div>
  );
}