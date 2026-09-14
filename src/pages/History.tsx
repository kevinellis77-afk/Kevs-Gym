import { useRef, useState } from "react";
import { getSessions } from "../utils/sessionStorage";
import { getTrackingType } from "../utils/exerciseMeta";
import { sessionVolume } from "../utils/progressRollups";
import { downloadBackup, restoreBackup } from "../utils/dataBackup";
import { ChevronRightIcon } from "../components/icons";

function formatSessionDate(dateValue: string) {
  const parsed = new Date(dateValue);

  if (isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed
    .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    .toUpperCase();
}

export default function History() {
  const [sessions, setSessions] = useState(getSessions());

  const [expandedId, setExpandedId] = useState<string | null>(
    sessions.length > 0 ? sessions[0].id : null
  );

  const [backupMessage, setBackupMessage] = useState<string | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const result = restoreBackup(String(reader.result));

      if (result.success) {
        const refreshed = getSessions();
        setSessions(refreshed);
        setExpandedId(refreshed.length > 0 ? refreshed[0].id : null);

        setBackupMessage(
          `Restored ${result.sessionsAdded} session(s) and ${result.healthEntriesAdded} health entr${
            result.healthEntriesAdded === 1 ? "y" : "ies"
          }.`
        );
      } else {
        setBackupMessage(result.error || "Restore failed.");
      }
    };

    reader.readAsText(file);

    // Allow re-selecting the same file again later.
    e.target.value = "";
  };

  return (
    <div className="app">
      <div className="screen-head">
        <h1 className="screen-title">History</h1>
        <span className="screen-head-meta">
          {sessions.length} Sessions
        </span>
      </div>

      {sessions.length === 0 && (
        <p className="empty-state">No workouts saved yet.</p>
      )}

      {sessions.map((session: any) => {
        const isExpanded = session.id === expandedId;
        const volume = sessionVolume(session);
        const liftCount = session.exercises?.length || 0;

        if (isExpanded) {
          return (
            <div key={session.id} className="history-expanded">
              <div className="history-expanded-header">
                <div className="history-expanded-top">
                  <span className="history-expanded-date">
                    {formatSessionDate(session.date)}
                  </span>

                  {session.workoutName && (
                    <span className="tag-outline-ink">
                      {session.workoutName}
                    </span>
                  )}
                </div>

                <div className="history-expanded-meta">
                  {session.duration} MIN &middot; {liftCount} LIFTS
                  &middot; {(volume / 1000).toFixed(1)}t
                </div>
              </div>

              {session.exercises?.map(
                (exercise: any, index: number) => {
                  const trackingType = getTrackingType(exercise.name);

                  return (
                    <div key={index} className="list-row">
                      <span className="list-row-label">
                        {exercise.name}
                      </span>

                      <span className="set-log-value">
                        {(exercise.sets || [])
                          .map((set: any) =>
                            trackingType === "duration"
                              ? `${set.weight}kg for ${set.reps}s`
                              : `${set.weight}kg\u00d7${set.reps}`
                          )
                          .join(" \u00b7 ")}
                      </span>
                    </div>
                  );
                }
              )}

              {session.notes && (
                <p className="history-notes">
                  &ldquo;{session.notes}&rdquo;
                </p>
              )}
            </div>
          );
        }

        return (
          <button
            key={session.id}
            className="list-row-clickable"
            onClick={() => setExpandedId(session.id)}
          >
            <div>
              <div className="history-collapsed-date">
                {formatSessionDate(session.date)}
              </div>

              <div className="history-collapsed-meta">
                {session.workoutName
                  ? `${session.workoutName} \u00b7 `
                  : ""}
                {session.duration} MIN &middot;{" "}
                {(volume / 1000).toFixed(1)}t
              </div>
            </div>

            <ChevronRightIcon size={18} />
          </button>
        );
      })}

      <div className="btn-ghost-row">
        <button className="btn-ghost" onClick={downloadBackup}>
          Back Up
        </button>

        <button className="btn-ghost" onClick={handleRestoreClick}>
          Restore
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      {backupMessage && (
        <p className="field-hint">{backupMessage}</p>
      )}
    </div>
  );
}
