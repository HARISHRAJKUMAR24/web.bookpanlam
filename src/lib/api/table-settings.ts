import { apiUrl } from "@/config";

export interface Table {
  id?: number;
  tableNumber: string;
  seats: number;
  eatingTime: number;
}

export interface Timing {
  startTime: string;
  startMeridiem: "AM" | "PM";
  endTime: string;
  endMeridiem: "AM" | "PM";
  breakStart?: string;
  breakEnd?: string;
}

export interface TableSettingsPayload {
  timing: Timing;
  operatingDays: string[];
  tables: Table[];
  breakSchedule?: {
    breakStart?: string;
    breakEnd?: string;
  } | null;
}

export interface SavedSettings {
  settings: {
    id: number;
    user_id: number;
    start_time: string;
    start_meridiem: "AM" | "PM";
    end_time: string;
    end_meridiem: "AM" | "PM";
    break_start: string | null;
    break_end: string | null;
    operating_days: string;
    created_at: string;
  } | null;
  tables: {
    table_number: string;
    seats: number;
    eating_time: number;
  }[];
}

const SAVE_TABLE_SETTINGS_URL = `${apiUrl}/seller/table-settings/save-table-settings.php`;

/**
 * Save table & timing settings to DB
 */
export async function saveTableSettings(payload: TableSettingsPayload) {
  const response = await fetch(SAVE_TABLE_SETTINGS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Network error (${response.status})`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to save settings");
  }

  return data;
}

/**
 * Fetch saved table settings from DB
 */
export async function fetchTableSettings(): Promise<SavedSettings> {
  const response = await fetch(SAVE_TABLE_SETTINGS_URL, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Network error (${response.status})`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch settings");
  }

  return data.data;
}