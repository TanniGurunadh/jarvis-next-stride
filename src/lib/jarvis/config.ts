// Single source of Supabase connection values for the existing project.
// Env vars stay primary (names unchanged); the publishable fallbacks keep the app
// working if the gitignored .env file is missing in a fresh checkout.
const FALLBACK_URL = "https://zetjqqhfzhbeakydvmum.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpldGpxcWhmemhiZWFreWR2bXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNzkzMjQsImV4cCI6MjEwNDg1NTMyNH0.JJ9D2OBOZUBF_yjE6IL8mbUhmjew1sj1PD_o1w0SX6o";

export const SUPABASE_URL =
  (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) || FALLBACK_URL;

export const SUPABASE_ANON_KEY =
  (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined) || FALLBACK_ANON_KEY;
