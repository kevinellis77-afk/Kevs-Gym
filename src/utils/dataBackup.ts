import { getSessions, saveSession } from "./sessionStorage";
import { getHealthEntries, saveHealthEntry } from "./healthStorage";

type BackupFile = {
  version: 1;
  exportedAt: string;
  sessions: any[];
  healthEntries: any[];
};

/**
 * Downloads every saved session and health entry as a single JSON
 * file. Doesn't touch localStorage - purely a snapshot.
 */
export function downloadBackup() {
  const backup: BackupFile = {
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions: getSessions(),
    healthEntries: getHealthEntries(),
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;

  const dateStamp = new Date().toISOString().slice(0, 10);
  link.download = `kevs-gym-backup-${dateStamp}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export type RestoreResult = {
  success: boolean;
  sessionsAdded: number;
  healthEntriesAdded: number;
  error?: string;
};

/**
 * Restores from a backup file's raw text content. Merges by id
 * rather than overwriting - anything already present locally is
 * left alone, so importing the same backup twice is harmless.
 */
export function restoreBackup(fileContent: string): RestoreResult {
  let parsed: any;

  try {
    parsed = JSON.parse(fileContent);
  } catch {
    return {
      success: false,
      sessionsAdded: 0,
      healthEntriesAdded: 0,
      error: "That file isn't valid JSON.",
    };
  }

  if (
    !parsed ||
    !Array.isArray(parsed.sessions) ||
    !Array.isArray(parsed.healthEntries)
  ) {
    return {
      success: false,
      sessionsAdded: 0,
      healthEntriesAdded: 0,
      error: "That doesn't look like a Kev's Gym backup file.",
    };
  }

  const existingSessions = getSessions();
  const existingSessionIds = new Set(
    existingSessions.map((session: any) => session.id)
  );

  let sessionsAdded = 0;

  // Process oldest-first so saveSession's unshift-to-front behaviour
  // leaves everything in the right newest-first order once done.
  [...parsed.sessions].reverse().forEach((session: any) => {
    if (session?.id && !existingSessionIds.has(session.id)) {
      saveSession(session);
      existingSessionIds.add(session.id);
      sessionsAdded++;
    }
  });

  const existingHealthEntries = getHealthEntries();
  const existingHealthIds = new Set(
    existingHealthEntries.map((entry: any) => entry.id)
  );

  let healthEntriesAdded = 0;

  [...parsed.healthEntries].reverse().forEach((entry: any) => {
    if (entry?.id && !existingHealthIds.has(entry.id)) {
      saveHealthEntry(entry);
      existingHealthIds.add(entry.id);
      healthEntriesAdded++;
    }
  });

  return { success: true, sessionsAdded, healthEntriesAdded };
}