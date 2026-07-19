// ============================================================
// Onboarding tanpa ribet: tidak ada email & password.
// Juragan cukup buat "Kode Warung" 6 huruf — kode itulah kunci
// datanya di cloud, bisa dibuka dari HP mana pun.
// ============================================================

import React, { useState } from 'react';
import { LogoMark } from './Icons.jsx';
import { createStore, getStoreByCode } from '../lib/db.js';
import { generateStoreCode } from '../lib/utils.js';

const BUSINESS_TYPES = [
  'Kuliner / Makanan & Minuman',
  'Warung / Toko Kelontong',
  'Fashion & Aksesori',
  'Kerajinan / Produk Lokal',
  'Jasa (laundry, servis, dll.)',
  'Pertanian / Hasil Bumi',
  'Lainnya',
];

export default function Onboarding({ onReady, notify }) {
  const [mode, setMode] = useState('create'); // 'create' | 'login'
  const [name, setName] = useState('');
  const [type, setType] = useState(BUSINESS_TYPES[0]);
  const [info, setInfo] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [newStore, setNewStore] = useState(null); // tampilkan kode setelah berhasil dibuat

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return notify('Isi dulu nama usahanya ya, Juragan.', 'error');
    setLoading(true);
    try {
      let store = null;
      // coba maksimal 5x kalau kode kebetulan kembar
      for (let i = 0; i < 5 && !store; i++) {
        try {
          store = await createStore({
            code: generateStoreCode(),
            name: name.trim(),
            business_type: type,
            info: info.trim(),
          });
        } catch (err) {
          if (!/duplicate|unique/i.test(String(err.message))) throw err;
        }
      }
      if (!store) throw new Error('Gagal membuat kode unik. Coba sekali lagi.');
      setNewStore(store);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c.length < 4) return notify('Masukkan kode warung (6 karakter).', 'error');
    setLoading(true);
    try {
      const store = await getStoreByCode(c);
      if (!store) {
        notify('Kode tidak ditemukan. Cek lagi, atau buat warung baru.', 'error');
      } else {
        onReady(store);
      }
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // Layar sukses: tunjukkan kode besar-besar supaya dicatat
  if (newStore) {
    return (
      <div className="onboard">
        <div className="onboard-card">
          <LogoMark size={44} />
          <h2 className="onboard-title">Warung siap! 🎉</h2>
          <p className="onboard-sub">
            Ini <strong>Kode Warung</strong> Anda. Simpan baik-baik — kode ini kunci untuk membuka catatan{' '}
            <strong>{newStore.name}</strong> dari HP mana pun.
          </p>
          <div className="code-badge">{newStore.code}</div>
          <button className="btn btn-primary btn-block" onClick={() => onReady(newStore)}>
            Mulai pakai LarisManis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="onboard">
      <div className="onboard-card">
        <div className="onboard-brand">
          <LogoMark size={44} />
          <div>
            <div className="brand-name">
              Laris<span>Manis</span>
            </div>
            <div className="brand-tag">Asisten AI Juragan UMKM</div>
          </div>
        </div>

        <p className="onboard-lead">
          Catat jualan cukup dengan <strong>ngomong</strong>, bikin konten promosi dari <strong>foto</strong>, dan
          pahami untung-rugi tanpa pusing tabel.
        </p>

        <div className="seg">
          <button
            type="button"
            className={'seg-btn' + (mode === 'create' ? ' active' : '')}
            onClick={() => setMode('create')}
          >
            Warung baru
          </button>
          <button
            type="button"
            className={'seg-btn' + (mode === 'login' ? ' active' : '')}
            onClick={() => setMode('login')}
          >
            Sudah punya kode
          </button>
        </div>

        {mode === 'create' ? (
          <form onSubmit={handleCreate} className="onboard-form">
            <label className="field">
              <span>Nama usaha</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="contoh: Warung Bu Sari"
                maxLength={60}
              />
            </label>
            <label className="field">
              <span>Jenis usaha</span>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>
                Info penting <em>(opsional — dipakai AI saat membalas pelanggan)</em>
              </span>
              <textarea
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                placeholder="contoh: Buka 08.00–21.00. Bisa COD area Semarang. Best seller: ayam geprek Rp15.000."
                rows={3}
                maxLength={400}
              />
            </label>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Menyiapkan…' : 'Buat Kode Warung saya'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="onboard-form">
            <label className="field">
              <span>Kode Warung</span>
              <input
                type="text"
                className="input-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                autoCapitalize="characters"
                autoComplete="off"
              />
            </label>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Mencari…' : 'Masuk ke warung saya'}
            </button>
          </form>
        )}
      </div>

      <p className="onboard-foot">Gratis · Bahasa Indonesia · Data tersimpan aman di cloud</p>
    </div>
  );
}
