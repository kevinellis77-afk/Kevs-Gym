import { getSessions } from "../utils/sessionStorage";
import { getExerciseStats } from "../utils/exerciseStats";
import { getExerciseHistory } from "../utils/progressChartData";
import { getTrackingType } from "../utils/exerciseMeta";
import { ArrowLeftIcon } from "../components/icons";

type Props = {
  name: string;
  origin?: "RECORDS" | "PROGRESS";
  onBack: () => void;
};

function formatSessionDate(dateValue: string) {
  const parsed = new Date(dateValue);

  if (isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed
    .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    .toUpperCase();
}

export default function ExerciseDetail({
  name,
  origin = "RECORDS",
  onBack,
}: Props) {
  const stats = getExerciseStats(name);
  const trackingType = getTrackingType(name);

  // Oldest -> newest, one point per session: {date, weight}
  const history = getExerciseHistory(name);

  const sessions = getSessions();

  const sessionRows = sessions
    .filter((session: any) =>
      session.exercises?.some((exercise: any) => exercise.name === name)
    )
    .map((session: any) => {
      const exercise = session.exercises.find(
        (e: any) => e.name === name
      );

      return {
        id: session.id,
        date: session.date,
        sets: exercise?.sets || [],
      };
    });

  const maxWeight = Math.max(...history.map((point) => point.weight), 1);

  return (
    <div className="app">
      <button className="back-bar" onClick={onBack}>
        <ArrowLeftIcon size={16} />
        <span>{origin}</span>
      </button>

      {!stats && (
        <p className="empty-state">
          No data logged for this exercise yet.
        </p>
      )}

      {stats && (
        <>
          <div className="detail-hero">
            <h2 className="exercise-poster-title">{name}</h2>

            <div className="detail-pr-row">
              <span className="detail-pr-value">{stats.bestWeight}</span>
              <span className="detail-pr-meta">
                {trackingType === "duration"
                  ? `for ${stats.bestReps}s`
                  : `kg \u00d7 ${stats.bestReps}`}
              </span>
            </div>

            <div className="detail-pr-caption">
              Personal Record
              {stats.bestDate
                ? ` \u00b7 ${formatSessionDate(stats.bestDate)}`
                : ""}
            </div>
          </div>

          <div className="metric-grid-3">
            <div className="metric-cell">
              <span className="metric-label">
                {trackingType === "duration" ? "Best Hold" : "Est. 1RM"}
              </span>
              <div className="metric-value-sm">
                {trackingType === "duration"
                  ? `${stats.bestReps}s`
                  : `${stats.estimated1RM}kg`}
              </div>
            </div>

            <div className="metric-cell">
              <span className="metric-label">Volume</span>
              <div className="metric-value-sm">
                {(stats.volume / 1000).toFixed(1)}t
              </div>
            </div>

            <div className="metric-cell">
              <span className="metric-label">Sessions</span>
              <div className="metric-value-sm">{stats.sessions}</div>
            </div>
          </div>

          <div className="bar-chart">
            {history.map((point, index) => {
              const isLatest = index === history.length - 1;
              const isPrevious = index === history.length - 2;

              const barClass = isLatest
                ? "bar-chart-bar bar-chart-bar-latest"
                : isPrevious
                ? "bar-chart-bar bar-chart-bar-previous"
                : "bar-chart-bar";

              const heightPct = Math.max(
                4,
                (point.weight / maxWeight) * 100
              );

              return (
                <div
                  key={index}
                  className={barClass}
                  style={{ height: `${heightPct}%` }}
                />
              );
            })}
          </div>

          <div
            className="bar-chart-labels"
            style={{
              gridTemplateColumns: `repeat(${history.length}, 1fr)`,
            }}
          >
            {history.map((point, index) => (
              <span key={index} className="bar-chart-label">
                {point.weight}
              </span>
            ))}
          </div>

          <div className="list-header">
            <span className="list-header-label">Set History</span>
          </div>

          {sessionRows.map((row) => (
            <div key={row.id} className="list-row">
              <span className="list-row-sub">
                {formatSessionDate(row.date)}
              </span>

              <span className="set-log-value">
                {row.sets
                  .map((set: any) =>
                    trackingType === "duration"
                      ? `${set.weight}kg for ${set.reps}s`
                      : `${set.weight}kg\u00d7${set.reps}`
                  )
                  .join(" \u00b7 ")}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
