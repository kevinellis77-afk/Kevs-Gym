import { getSessions } from "../utils/sessionStorage";

type HistoryProps = {
  onBack?: () => void;
};

export default function History({
  onBack,
}: HistoryProps) {
  const sessions = getSessions();

  return (
    <div className="app">
      <h1>Workout History</h1>

      {sessions.length === 0 && (
        <p>No workouts saved yet.</p>
      )}

      {sessions.map((session: any) => (
        <div
          key={session.id}
          className="exercise-card"
          style={{ marginBottom: "20px" }}
        >
          <h3>{session.date}</h3>

          <p>
            Duration: {session.duration} mins
          </p>

          <p>
            Notes: {session.notes || "None"}
          </p>

          {session.exercises &&
            Object.entries(
              session.exercises
            ).map(
              ([key, exercise]: any) => (
                <div
                  key={key}
                  style={{
                    marginTop: "15px",
                  }}
                >
                  <strong>
                    {exercise.name}
                  </strong>

                  {exercise.sets &&
                    exercise.sets.map(
                      (
                        set: any,
                        index: number
                      ) => (
                        <div key={index}>
                          Set {index + 1}:{" "}
                          {set.weight || "-"}kg ×{" "}
                          {set.reps || "-"} reps
                          {" "}
                          (RPE{" "}
                          {set.rpe || "-"})
                        </div>
                      )
                    )}
                </div>
              )
            )}
        </div>
      ))}

      {onBack && (
        <button
          className="finish-btn"
          style={{ marginTop: "20px" }}
          onClick={onBack}
        >
          Back to Dashboard
        </button>
      )}
    </div>
  );
}
