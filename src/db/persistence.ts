import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DB_STORE_PATH = path.resolve(__dirname, 'careersphere_data.json');

export interface PersistedDatabaseSchema {
  version: number;
  lastPersistedAt: string;
  users?: any[];
  companies?: any[];
  jobs?: any[];
  applications?: any[];
  resumes?: any[];
  interviews?: any[];
  candidateProfiles?: [string, any][];
  recruiterSettingsStore?: Record<string, any>;
  candidateSettingsStore?: Record<string, any>;
  candidateNotifications?: any[];
  recruiterNotifications?: any[];
  jobOffers?: any[];
  auditLogs?: any[];
}

let saveTimer: NodeJS.Timeout | null = null;

export function saveStateToDisk(getStateFn: () => PersistedDatabaseSchema) {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(() => {
    try {
      const state = getStateFn();
      const tmpPath = `${DB_STORE_PATH}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8');
      fs.renameSync(tmpPath, DB_STORE_PATH);
    } catch (err) {
      console.warn('[Persistence] Error saving state to disk:', err);
    }
  }, 150);
}

export function saveStateSync(state: PersistedDatabaseSchema) {
  try {
    const tmpPath = `${DB_STORE_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tmpPath, DB_STORE_PATH);
  } catch (err) {
    console.warn('[Persistence] Error saving sync state to disk:', err);
  }
}

export function loadStateFromDisk(): PersistedDatabaseSchema | null {
  try {
    if (fs.existsSync(DB_STORE_PATH)) {
      const raw = fs.readFileSync(DB_STORE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Persistence] Error reading state from disk:', err);
  }
  return null;
}
