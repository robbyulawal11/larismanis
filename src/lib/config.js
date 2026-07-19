// ============================================================
// Konfigurasi terpusat LarisManis.
// Semua nilai diambil dari environment variables Vite (.env).
// ============================================================

export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Key Gemini di sisi browser — HANYA untuk development lokal.
// Di produksi (Vercel), biarkan kosong supaya aplikasi otomatis
// memakai proxy aman /api/gemini.
export const GEMINI_BROWSER_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.5-flash';

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const APP_NAME = 'LarisManis';
export const ASSISTANT_NAME = 'Bang Laris';
