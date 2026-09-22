// Minimal typed access to the project's existing Supabase project (Data API + Edge Functions).
// No second backend: everything goes through VITE_SUPABASE_URL with the publishable anon key.

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

function baseHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY ?? "",
    Authorization: `Bearer ${SUPABASE_ANON_KEY ?? ""}`,
  };
}

function missingConfig(): string | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return "Supabase configuration is missing.";
  return null;
}

const RETRY_ATTEMPTS = 3;
const RETRY_BASE_MS = 1_200;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calls an existing Supabase Edge Function (e.g. jarvis-ask, generate-study-plan).
 * The AI provider behind these functions occasionally answers 429/5xx (surfaced as
 * "The AI service is temporarily unavailable"), so transient failures are retried
 * with bounded backoff before the error reaches the UI.
 */
export async function invokeFunction<T>(
  name: string,
  body: unknown,
): Promise<ApiResult<T>> {
  const configError = missingConfig();
  if (configError) return { data: null, error: configError };

  let lastError = `Request to ${name} failed.`;

  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
    if (attempt > 0) await wait(RETRY_BASE_MS * attempt);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
        method: "POST",
        headers: baseHeaders(),
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => null)) as
        | (T & { error?: string })
        | null;
      if (response.ok) {
        if (!payload) return { data: null, error: `${name} returned an empty response.` };
        return { data: payload as T, error: null };
      }
      lastError = payload?.error || `Request to ${name} failed.`;
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable) return { data: null, error: lastError };
    } catch {
      lastError = "Network error. Please check your connection and try again.";
    }
  }

  return { data: null, error: lastError };
}

/** SELECT rows from a table in the existing Supabase project. */
export async function selectRows<T>(
  table: string,
  query = "select=*",
): Promise<ApiResult<T[]>> {
  const configError = missingConfig();
  if (configError) return { data: null, error: configError };
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: baseHeaders(),
    });
    if (!response.ok) {
      const detail = (await response.json().catch(() => null)) as { message?: string } | null;
      return { data: null, error: detail?.message || `Could not load ${table}.` };
    }
    return { data: (await response.json()) as T[], error: null };
  } catch {
    return { data: null, error: "Network error while loading data." };
  }
}

/** INSERT a row and return it. */
export async function insertRow<T>(table: string, row: unknown): Promise<ApiResult<T>> {
  const configError = missingConfig();
  if (configError) return { data: null, error: configError };
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...baseHeaders(), Prefer: "return=representation" },
      body: JSON.stringify(row),
    });
    const payload = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      const detail = payload as { message?: string } | null;
      return { data: null, error: detail?.message || `Could not save to ${table}.` };
    }
    const rows = Array.isArray(payload) ? (payload as T[]) : [];
    return { data: rows[0] ?? null, error: null };
  } catch {
    return { data: null, error: "Network error while saving data." };
  }
}

/** PATCH rows matching a filter. */
export async function updateRows<T>(
  table: string,
  filter: string,
  patch: unknown,
): Promise<ApiResult<T[]>> {
  const configError = missingConfig();
  if (configError) return { data: null, error: configError };
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
      method: "PATCH",
      headers: { ...baseHeaders(), Prefer: "return=representation" },
      body: JSON.stringify(patch),
    });
    const payload = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      const detail = payload as { message?: string } | null;
      return { data: null, error: detail?.message || `Could not update ${table}.` };
    }
    return { data: (Array.isArray(payload) ? payload : []) as T[], error: null };
  } catch {
    return { data: null, error: "Network error while updating data." };
  }
}
