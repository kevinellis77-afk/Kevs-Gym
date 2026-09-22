import { useState } from "react";
import { exportLatestSession } from "../utils/exportSession";
import { getLatestSession } from "../utils/dashboardStats";
import { getExerciseStats } from "../utils/exerciseStats";
import { getTrackingType } from "../utils/exerciseMeta";
import {
  attachedCardioMinutes,
  sessionTimeUnderLoad,
} from "../utils/volume";
import { CopyIcon, ArrowRightIcon } from "../components/icons";

type Props = {
  volume: number;
  exerciseCount: number;
  duration: number;
  onFinish: () => void;
};

function formatDate(dateValue: string) {
  const parsed = new Date(dateValue);

  if (isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed
    .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    .toUpperCase();
}

export default function WorkoutSummary({
  volume,
  exerciseCount,
  duration,
  onFinish,
}: Props) {
  const [copied, setCopied] = useState(false);

  // saveSession() already ran before this screen mounts, so the
  // session just completed is the latest one in storage.
  const latestSession = getLatestSession() as any;

  const handleCopy = async () => {
    const success = await exportLatestSession();

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // An exercise counts as a fresh PR this session if its current
  // all-time best weight was set on the date of this exact session -
  // using the bestDate tracking added to exerciseStats.ts.
  const prRows: {
    exercise: string;
    weight: number;
    reps: number;
    timed: boolean;
  }[] = [];

  if (latestSession?.exercises) {
    latestSession.exercises.forEach((exercise: any) => {
      const stats = getExerciseStats(exercise.name);

      if (stats && stats.bestDate === latestSession.date) {
        prRows.push({
          exercise: exercise.name,
          weight: stats.bestWeight,
          reps: stats.bestReps,
          timed: getTrackingType(exercise.name) === "duration",
        });
      }
    });
  }

  const cardioMinutes = attachedCardioMinutes(latestSession);
  const timeUnderLoad = sessionTimeUnderLoad(latestSession);

  const formatCardio = (block: any) =>
    `${block.cardioType} \u00b7 ${block.minutes} min \u00b7 Effort ${block.effort}/10`;

  return (
    <div className="app">
      <div className="poster poster-summary">
        <div className="poster-eyebrow">
          {latestSession?.workoutName || "Workout"}
          {latestSession?.date
            ? ` \u00b7 ${formatDate(latestSession.date)}`
            : ""}
        </div>

        <h1 className="poster-title-lg">Done</h1>
      </div>

      <div className="metric-grid-3">
        <div className="metric-cell">
          <span className="metric-label">Minutes</span>
          <div className="metric-value-md">
            {duration}
            {cardioMinutes > 0 && (
              <span className="metric-unit">+{cardioMinutes}</span>
            )}
          </div>
        </div>

        <div className="metric-cell">
          <span className="metric-label">Lifts</span>
          <div className="metric-value-md">{exerciseCount}</div>
        </div>

        <div className="metric-cell">
          <span className="metric-label">Volume</span>
          <div className="metric-value-md">
            {(volume / 1000).toFixed(1)}t
          </div>
        </div>
      </div>

      {(latestSession?.warmUp || latestSession?.coolDown) && (
        <>
          {latestSession.warmUp && (
            <div className="list-row">
              <span className="list-row-label">Warm-Up</span>
              <span className="set-log-value">
                {formatCardio(latestSession.warmUp)}
              </span>
            </div>
          )}

          {latestSession.coolDown && (
            <div className="list-row">
              <span className="list-row-label">Cool-Down</span>
              <span className="set-log-value">
                {formatCardio(latestSession.coolDown)}
              </span>
            </div>
          )}
        </>
      )}

      {timeUnderLoad.length > 0 && (
        <>
          <div className="list-header">
            <span className="list-header-label">Time Under Load</span>
            <span className="list-header-label">Not in tonnage</span>
          </div>

          {timeUnderLoad.map((row) => (
            <div key={row.name} className="list-row">
              <span className="list-row-label">{row.name}</span>
              <span className="set-log-value">
                {row.sets} &middot; {row.totalText}
              </span>
            </div>
          ))}
        </>
      )}

      {prRows.length > 0 && (
        <div className="pr-block">
          {prRows.map((pr) => (
            <div key={pr.exercise} className="pr-row">
              <span className="tag-ink">New PR</span>
              <span className="pr-row-text">
                {pr.exercise} &mdash; {pr.weight}kg{" "}
                {pr.timed ? `for ${pr.reps}s` : `\u00d7 ${pr.reps}`}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        className="btn-ghost btn-ghost-ruled"
        onClick={handleCopy}
      >
        {copied ? "Copied to Clipboard" : "Copy Session"}
        <CopyIcon size={18} />
      </button>

      <button className="btn-ink" onClick={onFinish}>
        Home
        <ArrowRightIcon />
      </button>
    </div>
  );
}
