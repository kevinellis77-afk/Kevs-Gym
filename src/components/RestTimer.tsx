import { useEffect, useState } from "react";
import {
  getRestDuration,
  setRestDuration,
} from "../utils/restTimerPreference";

type Props = {
  onDone?: () => void;
};

const ADJUST_STEP = 15;
const MIN_DURATION = 15;

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Countdown shown after logging a set - parent gives it a fresh
 * `key` per set (see ExerciseLogger), so each new set starts a new
 * timer automatically rather than needing manual reset logic here.
 *
 * Duration starts from the saved default (getRestDuration) and is
 * adjustable in place with +/-15s: adjusting changes what's left
 * AND saves as the new default, so dialling it in once during a
 * session is all "customizable" takes - there's no separate
 * settings screen.
 */
export default function RestTimer({ onDone }: Props) {
  const [duration, setDuration] = useState(() => getRestDuration());
  const [remaining, setRemaining] = useState(duration);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finished) return;

    if (remaining <= 0) {
      setFinished(true);
      // A quick buzz in case the phone's face-down or out of sight -
      // no-ops silently on browsers/devices without vibration. Only
      // fires when the countdown actually reaches zero, not on Skip.
      navigator.vibrate?.(200);
      onDone?.();
      return;
    }

    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
    // onDone intentionally excluded - it's a fresh closure from the
    // parent each render, and including it would reset the 1s timer
    // early any time the parent re-renders for an unrelated reason
    // (e.g. adjusting weight/reps while resting).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, finished]);

  const adjust = (delta: number) => {
    const next = Math.max(MIN_DURATION, duration + delta);
    setDuration(next);
    setRestDuration(next);
    setRemaining((r) => Math.max(0, r + delta));
  };

  const handleSkip = () => {
    setFinished(true);
    setRemaining(0);
    onDone?.();
  };

  const pct =
    duration > 0 ? Math.max(0, Math.min(100, (remaining / duration) * 100)) : 0;

  return (
    <div className="rest-timer">
      <span className="field-block-label">Rest</span>

      <div className="rest-timer-value">{formatTime(remaining)}</div>

      <div className="rest-timer-track">
        <div className="rest-timer-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="chip-row">
        <button className="chip" onClick={() => adjust(-ADJUST_STEP)}>
          &minus;15s
        </button>

        <button className="chip" onClick={() => adjust(ADJUST_STEP)}>
          +15s
        </button>
      </div>

      <button className="btn-ghost btn-ghost-ruled" onClick={handleSkip}>
        Skip Rest
      </button>
    </div>
  );
}