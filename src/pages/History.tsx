import { useRef, useState } from "react";
import { getSessions } from "../utils/sessionStorage";
import { formatExerciseSets } from "../utils/setFormat";
import {
  attachedCardioMinutes,
  sessionTonnage,
  sessionTimeUnderLoad,
} from "../utils/volume";
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

  const formatCardio = (block: any) =>
    `${block.cardioType} \u00b7 ${block.minutes} min \u00b7 Effort ${block.effort}/10`;

  // "65 MIN" or "65 MIN + 15 MIN CARDIO" for a lifting session.
  const formatLiftDuration = (session: any) => {
    const cardio = attachedCardioMinutes(session);
    return cardio > 0
      ? `${session.duration} MIN + ${cardio} MIN CARDIO`
      : `${session.duration} MIN`;
  };

  return (
    <div className="app">
      <div className="screen-head">
        <h1 className="screen-title">History</h1>
        {/* One per saved entry: every lifting workout plus any
            cardio-only day. Warm-ups/cool-downs live inside their
            workout, so they never add to this. */}
        <span className="screen-head-meta">
          {sessions.length} Sessions
        </span>
      </div>

      {sessions.length === 0 && (
        <p className="empty-state">No workouts saved yet.</p>
      )}

      {sessions.map((session: any) => {
        const isExpanded = session.id === expandedId;
        const isCardio = session.type === "cardio";
        const volume = sessionTonnage(session);
        const timeUnderLoad = isCardio ? [] : sessionTimeUnderLoad(session);
        const liftCount = session.exercises?.length || 0;

        if (isExpanded) {
          return (
            <div key={session.id} className="history-expanded">
              <div className="history-expanded-header">
                <div className="history-expanded-top">
                  <span className="history-expanded-date">
                    {formatSessionDate(session.date)}
                  </span>

                  <div style={{ display: "flex", gap: "6px" }}>
                    {session.workoutName && (
                      <span className="tag-outline-ink">
                        {session.workoutName}
                      </span>
                    )}

                    {isCardio && session.cardioType && (
                      <span className="tag-outline-ink">
                        {session.cardioType}
                      </span>
                    )}

                    {session.feeling && (
                      <span
                        className={
                          session.feeling === "Something Hurt"
                            ? "tag-accent"
                            : "tag-outline-ink"
                        }
                      >
                        {session.feeling}
                      </span>
                    )}
                  </div>
                </div>

                <div className="history-expanded-meta">
                  {isCardio ? (
                    <>
                      {session.duration} MIN
                      {session.cardioRpe && (
                        <>&middot; Effort {session.cardioRpe}/10</>
                      )}
                    </>
                  ) : (
                    <>
                      {formatLiftDuration(session)} &middot; {liftCount} LIFTS
                      &middot; {(volume / 1000).toFixed(1)}t
                    </>
                  )}
                </div>
              </div>

              {!isCardio && session.warmUp && (
                <div className="list-row">
                  <span className="list-row-label">Warm-Up</span>
                  <span className="set-log-value">
                    {formatCardio(session.warmUp)}
                  </span>
                </div>
              )}

              {!isCardio &&
                session.exercises?.map(
                (exercise: any, index: number) => (
                  <div key={index} className="list-row">
                    <span className="list-row-label">
                      {exercise.name}
                    </span>

                    <span className="set-log-value">
                      {formatExerciseSets(exercise.name, exercise.sets || [])}
                    </span>
                  </div>
                )
              )}

              {!isCardio && session.coolDown && (
                <div className="list-row">
                  <span className="list-row-label">Cool-Down</span>
                  <span className="set-log-value">
                    {formatCardio(session.coolDown)}
                  </span>
                </div>
              )}

              {timeUnderLoad.length > 0 && (
                <div className="list-row">
                  <span className="list-row-label">Time Under Load</span>
                  <span className="set-log-value">
                    {timeUnderLoad
                      .map((row) => `${row.name} ${row.totalText}`)
                      .join(" \u00b7 ")}
                  </span>
                </div>
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
                {isCardio ? (
                  <>
                    {session.cardioType
                      ? `${session.cardioType} \u00b7 `
                      : ""}
                    {session.duration} MIN
                    {session.cardioRpe
                      ? ` \u00b7 Effort ${session.cardioRpe}/10`
                      : ""}
                  </>
                ) : (
                  <>
                    {session.workoutName
                      ? `${session.workoutName} \u00b7 `
                      : ""}
                    {formatLiftDuration(session)} &middot;{" "}
                    {(volume / 1000).toFixed(1)}t
                  </>
                )}
              </div>

              {session.feeling === "Something Hurt" && (
                <span
                  className="tag-accent"
                  style={{ marginTop: "6px" }}
                >
                  Something Hurt
                </span>
              )}
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