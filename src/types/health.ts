export interface HealthEntry {
  id: string;
  date: string;
  // All metric fields are optional - an entry can log any subset of
  // them (e.g. just weight on a day you skip BP). Systolic and
  // diastolic are still always saved as a pair, never one without
  // the other.
  weight?: number;
  waist?: number;
  systolic?: number;
  diastolic?: number;
  restingHr?: number;
  // Simple daily readiness rating, 1 (poor) - 5 (great).
  sleepQuality?: number;
}