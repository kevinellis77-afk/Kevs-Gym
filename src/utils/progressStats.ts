export function estimate1RM(
    weight: number,
    reps: number
  ) {
    return Math.round(
      weight * (1 + reps / 30)
    );
  }
  
  export function calculateVolume(
    sets: any[]
  ) {
    return sets.reduce(
      (total, set) =>
        total +
        Number(set.weight || 0) *
          Number(set.reps || 0),
      0
    );
  }