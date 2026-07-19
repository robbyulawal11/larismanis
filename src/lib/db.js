// ============================================================
// Akses database Supabase lewat REST API (PostgREST) murni —
// tanpa SDK tambahan, supaya aplikasi tetap ringan dan cepat.
// Inilah sumber "data real-time" LarisManis: semua catatan
// tersimpan di cloud, bisa dibuka dari HP mana pun dengan
// kode warung yang sama.
// ============================================================

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

async function request(path, { method = 'GET', body, returning = false } = {}) {
  const headers = { ...HEADERS };
  if (returning) headers.Prefer = 'return=representation';

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let msg = `Database error (${res.status})`;
    try {
      const j = await res.json();
      if (j && (j.message || j.hint)) msg = j.message || j.hint;
    } catch (_) {
      /* abaikan */
    }
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ---------- STORES ----------

export async function createStore({ code, name, business_type, info }) {
  const rows = await request('stores', {
    method: 'POST',
    body: [{ code, name, business_type, info: info || '' }],
    returning: true,
  });
  return rows && rows[0];
}

export async function getStoreByCode(code) {
  const rows = await request(`stores?code=eq.${encodeURIComponent(code)}&select=*&limit=1`);
  return rows && rows[0] ? rows[0] : null;
}

export async function updateStoreInfo(code, info) {
  const rows = await request(`stores?code=eq.${encodeURIComponent(code)}`, {
    method: 'PATCH',
    body: { info },
    returning: true,
  });
  return rows && rows[0];
}

// ---------- TRANSACTIONS ----------

export async function listTransactions(storeCode, limit = 500) {
  return (
    (await request(
      `transactions?store_code=eq.${encodeURIComponent(storeCode)}&select=*&order=created_at.desc&limit=${limit}`
    )) || []
  );
}

/** rows: [{type,item,qty,unit_price,total,note?}] — store_code otomatis ditambahkan */
export async function addTransactions(storeCode, rows) {
  const payload = rows.map((r) => ({
    store_code: storeCode,
    type: r.type === 'out' ? 'out' : 'in',
    item: String(r.item || 'Lainnya').slice(0, 120),
    qty: Number(r.qty) > 0 ? Number(r.qty) : 1,
    unit_price: Number(r.unit_price) >= 0 ? Number(r.unit_price) : 0,
    total: Number(r.total) >= 0 ? Number(r.total) : 0,
    note: r.note ? String(r.note).slice(0, 200) : '',
  }));
  return (await request('transactions', { method: 'POST', body: payload, returning: true })) || [];
}

export async function deleteTransaction(id) {
  await request(`transactions?id=eq.${id}`, { method: 'DELETE' });
}
