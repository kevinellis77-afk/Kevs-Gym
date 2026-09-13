import { useRef, useState } from "react";
import { getSessions } from "../utils/sessionStorage";
import { getTrackingType } from "../utils/exerciseMeta";
import { exportSession } from "../utils/exportSession";
import { downloadBackup, restoreBackup } from "../utils/dataBackup";

type HistoryProps = {
  onBack?: () => void;
};

function formatSessionDate(dateValue: string) {
  const parsed = new Date(dateValue);

  if (isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function History({
  onBack,
}: HistoryProps) {
  const [sessions, setSessions] = useState(getSessions());

  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(
    null
  );

  const [backupMessage, setBackupMessage] = useState<string | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopySession = async (session: any) => {
    const success = await exportSession(session);

    if (success) {
      setCopiedSessionId(session.id);
      setTimeout(() => setCopiedSessionId(null), 2000);
    }
  };

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
        setSessions(getSessions());

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
      <div className="page-header">
        <h1 className="page-title">Workout History</h1>
      </div>

      {sessions.length === 0 && (
        <div className="card">
          <p className="empty-state">No workouts saved yet.</p>
        </div>
      )}

      {sessions.map((session: any) => (
        <div key={session.id} className="card">
          <div className="history-entry-header">
            <span className="history-entry-date">
              {formatSessionDate(session.date)}
            </span>

            {session.workoutName && (
              <span className="workout-badge">
                {session.workoutName}
              </span>
            )}
          </div>

          <p className="history-entry-meta">
            {session.duration} min
            {session.notes ? ` \u00b7 ${session.notes}` : ""}
          </p>

          {session.exercises &&
            session.exercises.map((exercise: any, index: number) => {
              const trackingType = getTrackingType(exercise.name);

              return (
                <div key={index} className="history-exercise">
                  <div className="history-exercise-name">
                    {exercise.name}
                  </div>

                  {exercise.sets &&
                    exercise.sets.map((set: any, setIndex: number) => (
                      <div key={setIndex} className="history-set-line">
                        Set {setIndex + 1}:{" "}
                        {trackingType === "duration"
                          ? `${set.weight || "-"}kg for ${set.reps || "-"}s`
                          : `${set.weight || "-"}kg \u00d7 ${set.reps || "-"} reps`}{" "}
                        (RPE {set.rpe || "-"})
                      </div>
                    ))}
                </div>
              );
            })}

          <button
            className="copy-btn"
            onClick={() => handleCopySession(session)}
          >
            {copiedSessionId === session.id
              ? "Copied"
              : "Copy for Review"}
          </button>
        </div>
      ))}

      <div className="card">
        <h2 className="section-heading">Backup &amp; Restore</h2>

        <p className="section-subheading">
          Download everything as a file, or restore from one.
        </p>

        <div className="button-row">
          <button className="btn-secondary" onClick={downloadBackup}>
            Download Backup
          </button>

          <button className="btn-secondary" onClick={handleRestoreClick}>
            Restore from File
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

      {onBack && (
        <button className="btn-secondary" onClick={onBack}>
          Back to Dashboard
        </button>
      )}
    </div>
  );
}
