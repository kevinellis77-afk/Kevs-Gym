import { useState } from "react";
import ExerciseLogger from "../components/ExerciseLogger";
import CardioBlockForm from "../components/CardioBlockForm";
import { saveSession } from "../utils/sessionStorage";
import { getSmartTargetForExercise } from "../utils/nextWorkoutTargets";
import { getSubstitutesFor } from "../utils/exerciseSubstitutions";
import { sessionTonnage } from "../utils/volume";
import { ArrowLeftIcon, ArrowRightIcon } from "../components/icons";
import type { WorkoutTemplate, WorkoutExercise } from "../data/workouts";
import type { CardioBlock, SetData, WorkoutSession } from "../types/session";

const FEELING_OPTIONS = [
  "Felt Good",
  "Manageable",
  "Struggled",
  "Something Hurt",
];

// warmup -> lifting -> cooldown -> saved. Warm-up and cool-down are
// both skippable; the lifting pager in between is unchanged.
type Phase = "warmup" | "lifting" | "cooldown";

type WorkoutProps = {
  workout: WorkoutTemplate;
  onComplete: (
    volume: number,
    exerciseCount: number,
    // Minutes actually spent lifting - excludes warm-up/cool-down,
    // which WorkoutSummary reads off the saved session itself.
    duration: number
  ) => void;
};

export default function Workout({
  workout,
  onComplete,
}: WorkoutProps) {
  const [notes, setNotes] = useState("");
  const [feeling, setFeeling] = useState<string | null>(null);

  const [exerciseData, setExerciseData] = useState<Record<string, SetData[]>>({});

  // Which exercises have had at least one set logged this session -
  // drives the segment bar. Set inside handleExerciseInteract, called
  // from ExerciseLogger only when LOG SET is actually tapped.
  const [touchedExercises, setTouchedExercises] = useState<Set<string>>(
    new Set()
  );

  const [index, setIndex] = useState(0);

  const [phase, setPhase] = useState<Phase>("warmup");
  const [warmUp, setWarmUp] = useState<CardioBlock | null>(null);

  // Lifting time is measured, not estimated: the clock starts when
  // the warm-up screen is left (saved or skipped) and stops when
  // Finish is tapped on the last lift. Going back from cool-down to
  // the lifts and finishing again moves the stop time on.
  const [liftStartedAt, setLiftStartedAt] = useState<number | null>(null);
  const [liftEndedAt, setLiftEndedAt] = useState<number | null>(null);

  // Mid-session exercise substitutions, keyed by the ORIGINAL
  // exercise's id (never the workout template itself - that stays
  // untouched, so the next time this workout comes round in
  // rotation it's back to its normal exercise list). A session that
  // substitutes Leg Press for Goblet Squat logs sets under "Goblet
  // Squat" in its own right, not folded into Leg Press's history -
  // they're genuinely different lifts with different capacities, so
  // that's what keeps PRs and progression targets honest for both.
  const [substitutions, setSubstitutions] = useState<Record<string, WorkoutExercise>>({});
  const handleExerciseChange = (
    exerciseName: string,
    sets: SetData[]
  ) => {
    setExerciseData((prev) => ({
      ...prev,
      [exerciseName]: sets,
    }));
  };

  const handleExerciseInteract = (exerciseName: string) => {
    setTouchedExercises((prev) => {
      if (prev.has(exerciseName)) return prev;
      const next = new Set(prev);
      next.add(exerciseName);
      return next;
    });
  };

  const liftingMinutes = (): number => {
    if (liftStartedAt === null) return workout.estimatedMinutes;

    const end = liftEndedAt ?? Date.now();
    return Math.max(1, Math.round((end - liftStartedAt) / 60000));
  };

  const handleSaveWorkout = (finalCoolDown: CardioBlock | null) => {
    const exercises = Object.entries(exerciseData).map(
      ([name, sets]) => ({
        name,
        sets,
      })
    );

    const duration = liftingMinutes();

    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      notes,
      duration,
      exercises,
      workoutId: workout.id,
      workoutName: workout.name,
      ...(feeling && { feeling }),
      ...(warmUp && { warmUp }),
      ...(finalCoolDown && { coolDown: finalCoolDown }),
    };

    saveSession(session);

    onComplete(sessionTonnage(session), exercises.length, duration);
  };

  const startLifting = (block: CardioBlock | null) => {
    setWarmUp(block);
    setLiftStartedAt(Date.now());
    setPhase("lifting");
  };

  const total = workout.exercises.length;
  const baseExercise = workout.exercises[index];
  const currentExercise = substitutions[baseExercise.id] ?? baseExercise;
  const isLast = index === total - 1;

  const substitutes = getSubstitutesFor(baseExercise.id);
  const isSubstituted = currentExercise.id !== baseExercise.id;

  const handleSubstitute = (exercise: WorkoutExercise | null) => {
    setSubstitutions((prev) => {
      const next = { ...prev };

      if (exercise) {
        next[baseExercise.id] = exercise;
      } else {
        delete next[baseExercise.id];
      }

      return next;
    });
  };

  // Smart, RPE-aware target for the exercise currently being logged -
  // falls back to the static exercise.targetWeight when there's not
  // yet enough history to compute one. Uses currentExercise (not
  // baseExercise) so a substitute gets its own real progression
  // target rather than one borrowed from the exercise it replaced.
  const smartTarget = getSmartTargetForExercise(currentExercise);
  const resolvedTarget = smartTarget
    ? smartTarget.targetWeight
    : currentExercise.targetWeight;

  const goPrev = () => {
    setIndex((i) => Math.max(0, i - 1));
  };

  const goNextOrFinish = () => {
    if (isLast) {
      setLiftEndedAt(Date.now());
      setPhase("cooldown");
    } else {
      setIndex((i) => Math.min(total - 1, i + 1));
    }
  };

  if (phase === "warmup") {
    return (
      <div className="app">
        <div className="pager-head">
          <span className="pager-head-title">{workout.name}</span>
          <span className="pager-head-count">Warm-Up</span>
        </div>

        <CardioBlockForm
          initial={warmUp}
          saveLabel="Start Lifting"
          onSave={(block) => startLifting(block)}
          onSkip={() => startLifting(null)}
          skipLabel="Skip Warm-Up"
        />
      </div>
    );
  }

  if (phase === "cooldown") {
    return (
      <div className="app">
        <div className="pager-head">
          <span className="pager-head-title">{workout.name}</span>
          <span className="pager-head-count">Cool-Down</span>
        </div>

        <CardioBlockForm
          saveLabel="Save Workout"
          onSave={(block) => handleSaveWorkout(block)}
          onSkip={() => handleSaveWorkout(null)}
          skipLabel="Skip & Save"
          onBack={() => setPhase("lifting")}
          backLabel="Back to Lifts"
        />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="pager-head">
        <span className="pager-head-title">{workout.name}</span>
        <span className="pager-head-count">
          {index + 1} / {total}
        </span>
      </div>

      <div
        className="seg-bar"
        style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}
      >
        {workout.exercises.map((exercise, i) => {
          const effectiveExercise = substitutions[exercise.id] ?? exercise;
          const done = touchedExercises.has(effectiveExercise.name);
          const isCurrent = i === index;

          return (
            <div
              key={exercise.id}
              className={
                "seg-cell" +
                (done
                  ? " seg-cell-done"
                  : isCurrent
                  ? " seg-cell-current"
                  : "")
              }
            />
          );
        })}
      </div>

      <ExerciseLogger
        key={currentExercise.id}
        name={currentExercise.name}
        targetWeight={resolvedTarget}
        trackingType={currentExercise.trackingType}
        unilateral={currentExercise.unilateral}
        sets={exerciseData[currentExercise.name] || []}
        onChange={handleExerciseChange}
        onInteract={handleExerciseInteract}
        originalName={baseExercise.name}
        substitutes={substitutes}
        isSubstituted={isSubstituted}
        onSubstitute={handleSubstitute}
      />

      {isLast && (
        <>
          <span className="field-block-label">How Did That Feel?</span>

          <div className="chip-row">
            {FEELING_OPTIONS.map((option) => (
              <button
                key={option}
                className={
                  "chip" + (feeling === option ? " chip-active" : "")
                }
                onClick={() =>
                  setFeeling(feeling === option ? null : option)
                }
              >
                {option}
              </button>
            ))}
          </div>

          <textarea
            className="input"
            style={{ margin: "16px", width: "calc(100% - 32px)" }}
            placeholder="How did today's workout feel?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </>
      )}

      <div className="pager-footer">
        <button
          className="pager-footer-btn pager-footer-prev"
          onClick={goPrev}
          disabled={index === 0}
        >
          <ArrowLeftIcon size={16} />
          Prev
        </button>

        <button
          className="pager-footer-btn pager-footer-next"
          onClick={goNextOrFinish}
        >
          {isLast ? "Cool-Down" : "Next Lift"}
          <ArrowRightIcon size={16} />
        </button>
      </div>
    </div>
  );
}