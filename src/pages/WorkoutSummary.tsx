import { useState } from "react";
import { exportLatestSession } from "../utils/exportSession";

type Props = {
  volume: number;
  exerciseCount: number;
  duration: number;
  onFinish: () => void;
};

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="36"
      height="36"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12.5 11 15.5 16 9.5" />
    </svg>
  );
}

export default function WorkoutSummary({
  volume,
  exerciseCount,
  duration,
  onFinish,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await exportLatestSession();

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="app">
      <div className="summary-complete-card">
        <div className="summary-complete-icon">
          <CheckIcon />
        </div>

        <h1 className="summary-complete-title">Workout Complete</h1>

        <p className="summary-complete-subtitle">
          Nice work \u2014 logged and saved.
        </p>
      </div>

      <div className="card">
        <h2 className="section-heading">Session Summary</h2>

        <div className="progress-stat-grid-3">
          <div className="progress-stat">
            <span className="progress-stat-label">Duration</span>
            <div className="progress-stat-value">{duration} min</div>
          </div>

          <div className="progress-stat">
            <span className="progress-stat-label">Exercises</span>
            <div className="progress-stat-value">{exerciseCount}</div>
          </div>

          <div className="progress-stat">
            <span className="progress-stat-label">Volume</span>
            <div className="progress-stat-value">
              {volume.toLocaleString()}kg
            </div>
          </div>
        </div>
      </div>

      <button className="btn-secondary" onClick={handleCopy}>
        {copied ? "Copied to Clipboard" : "Copy Session for Review"}
      </button>

      <button className="finish-btn" onClick={onFinish}>
        Back to Dashboard
      </button>
    </div>
  );
}
