import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "./icons";
import type { CardioBlock } from "../types/session";

const CARDIO_TYPES = ["Walking", "Cycling", "Rowing", "Intervals"];
const EFFORT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type Props = {
  // Values to pre-fill with - e.g. coming back to the cool-down
  // screen after popping back to the last lift. Cycling is
  // preselected otherwise, since that's what it nearly always is.
  initial?: CardioBlock | null;
  // Right-hand footer button: "Start Lifting" for warm-up, "Save
  // Workout" for cool-down. Records this cardio, then carries on.
  saveLabel: string;
  onSave: (block: CardioBlock) => void;
  // Left-hand footer button - carries on without recording anything.
  onSkip: () => void;
  skipLabel?: string;
  // Optional extra way out, e.g. cool-down's "Back to Lifts".
  onBack?: () => void;
  backLabel?: string;
};

/**
 * The warm-up / cool-down step inside the active workout (see
 * pages/Workout.tsx). Same three inputs as the standalone Cardio Log
 * screen - type, minutes, effort - and the same layout, so it reads
 * as part of the same system. Saving needs all three; skipping needs
 * none.
 */
export default function CardioBlockForm({
  initial,
  saveLabel,
  onSave,
  onSkip,
  skipLabel = "Skip",
  onBack,
  backLabel = "Back",
}: Props) {
  const [cardioType, setCardioType] = useState<string | null>(
    initial?.cardioType ?? "Cycling"
  );
  const [minutes, setMinutes] = useState(
    initial?.minutes ? String(initial.minutes) : ""
  );
  const [effort, setEffort] = useState<number | null>(initial?.effort ?? null);

  const hasMinutes = minutes.trim() !== "" && Number(minutes) > 0;
  const isValid = cardioType !== null && hasMinutes && effort !== null;

  const handleSave = () => {
    if (!isValid) return;

    onSave({
      cardioType: cardioType as string,
      minutes: Number(minutes),
      effort: effort as number,
    });
  };

  return (
    <>
      <span className="field-block-label">Type</span>

      <div className="chip-row">
        {CARDIO_TYPES.map((option) => (
          <button
            key={option}
            className={"chip" + (cardioType === option ? " chip-active" : "")}
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
            className={"rpe-btn" + (effort === value ? " rpe-btn-active" : "")}
            onClick={() => setEffort(effort === value ? null : value)}
          >
            {value}
          </button>
        ))}
      </div>

      {!isValid && (
        <p className="field-hint">
          Pick a type, minutes and effort to record it - or skip.
        </p>
      )}

      {onBack && (
        <button className="btn-ghost btn-ghost-ruled" onClick={onBack}>
          <ArrowLeftIcon size={16} />
          {backLabel}
        </button>
      )}

      <div className="pager-footer">
        <button
          className="pager-footer-btn pager-footer-prev"
          onClick={onSkip}
        >
          {skipLabel}
        </button>

        <button
          className="pager-footer-btn pager-footer-next"
          onClick={handleSave}
          disabled={!isValid}
        >
          {saveLabel}
          {saveLabel.toLowerCase().includes("save") ? (
            <CheckIcon size={16} />
          ) : (
            <ArrowRightIcon size={16} />
          )}
        </button>
      </div>
    </>
  );
}
