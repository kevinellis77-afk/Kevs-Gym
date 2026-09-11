import { createContext, useContext, useState, ReactNode } from "react";

export interface WorkoutEntry {
  exerciseId: string;
  set: number;
  weight: number;
  reps: number;
  rpe: number;
}

interface WorkoutContextType {
  entries: WorkoutEntry[];
  saveEntry: (entry: WorkoutEntry) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [entries, setEntries] = useState<WorkoutEntry[]>(() => {
    const saved = localStorage.getItem("workoutEntries");
    return saved ? JSON.parse(saved) : [];
  });

  const saveEntry = (entry: WorkoutEntry) => {
    const updated = [...entries, entry];

    setEntries(updated);

    localStorage.setItem(
      "workoutEntries",
      JSON.stringify(updated)
    );
  };

  return (
    <WorkoutContext.Provider
      value={{ entries, saveEntry }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);

  if (!context) {
    throw new Error(
      "useWorkout must be used inside WorkoutProvider"
    );
  }

  return context;
}