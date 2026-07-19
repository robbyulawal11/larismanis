// ============================================================
// Balas Pelanggan: tempel chat dari WhatsApp/Instagram,
// Bang Laris membuatkan 2 draf balasan siap kirim —
// satu singkat-ramah, satu lengkap dengan tawaran halus.
// Jawaban mengacu pada "Info penting" milik warung, jadi
// tidak asal mengarang harga/stok.
// ============================================================

import React, { useState } from 'react';
import { aiReply } from '../lib/gemini.js';
import { updateStoreInfo } from '../lib/db.js';
import { copyText } from '../lib/utils.js';
import { ReplyIcon, CopyIcon, CheckIcon } from './Icons.jsx';

const EXAMPLES = [
  'Kak ini ready? Bisa COD daerah mana aja?',
  'Harga berapa kalau ambil 10? Ada diskon ga?',
  'Pesanan saya kok belum sampai ya kak?',
];

function OptionCard({ label, text, notify }) {
  const [done, setDone] = useState(false);
  return (
    <div className="card content-card">
      <div className="content-head">
        <span className="content-badge wa">{label}</span>
        <button
          type="button"
          className={'copy-btn' + (done ? ' done' : '')}
          onClick={async () => {
            const ok = await copyText(text);
            if (ok) {
              setDone(true);
              setTimeout(() => setDone(false), 1800);
            } else {
              notify('Gagal menyalin. Salin manual ya.', 'error');
            }
          }}
        >
          {done ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
          {done ? 'Tersalin' : 'Salin'}
        </button>
      </div>
      <p className="content-text">{text}</p>
    </div>
  );
}

export default function BalasTab({ store, onStoreUpdate, notify }) {
  const [message, setMessage] = useState('');
  const [info, setInfo] = useState(store.info || '');
  const [showInfo, setShowInfo] = useState(!store.info);
  const [savingInfo, setSavingInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function saveInfo() {
    setSavingInfo(true);
    try {
      const updated = await updateStoreInfo(store.code, info.trim());
      if (updated) onStoreUpdate(updated);
      notify('Info usaha tersimpan ✓', 'ok');
      setShowInfo(false);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSavingInfo(false);
    }
  }

  async function generate() {
    if (!message.trim()) return notify('Tempel dulu pesan pelanggannya ya.', 'error');
    setLoading(true);
    setResult(null);
    try {
      const storeInfo =
        `Nama usaha: ${store.name}\nJenis: ${store.business_type || 'Lainnya'}\n` +
        `Catatan penjual: ${info.trim() || '(belum diisi — jangan mengarang harga/stok)'}`;
      const out = await aiReply({ customerMessage: message.trim(), storeInfo });
      setResult(out);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="balas">
      <div className="card">
        <h3 className="card-title">
          <ReplyIcon width={18} height={18} /> Balas chat pelanggan dalam hitungan detik
        </h3>

        <label className="field">
          <span>Tempel pesan pelanggan (dari WhatsApp / Instagram / marketplace)</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder='contoh: "Kak ini ready? Bisa COD daerah mana aja?"'
            maxLength={800}
          />
        </label>

        <div className="chat-chips">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className="chip" onClick={() => setMessage(ex)}>
              {ex}
            </button>
          ))}
        </div>

        <button type="button" className="link-toggle" onClick={() => setShowInfo((v) => !v)}>
          {showInfo ? '▾' : '▸'} Info usaha untuk AI {store.info ? '(sudah diisi)' : '(belum diisi — disarankan)'}
        </button>

        {showInfo && (
          <div className="info-box">
            <label className="field">
              <span>
                Tulis hal-hal yang sering ditanya pelanggan — jam buka, area COD, harga best seller, estimasi kirim.
                AI hanya menjawab berdasarkan info ini.
              </span>
              <textarea
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                rows={4}
                placeholder="contoh: Buka 08.00–21.00, libur Jumat. COD area Sleman. Keripik pisang Rp12.000, min. order luar kota 5 pcs. Kirim via JNE/SiCepat, estimasi 2-3 hari."
                maxLength={400}
              />
            </label>
            <button type="button" className="btn btn-small" onClick={saveInfo} disabled={savingInfo}>
              {savingInfo ? 'Menyimpan…' : 'Simpan info usaha'}
            </button>
          </div>
        )}

        <button className="btn btn-primary btn-block" onClick={generate} disabled={loading}>
          {loading ? 'Menyiapkan balasan…' : 'Buatkan draf balasan'}
        </button>
      </div>

      {result && Array.isArray(result.options) && (
        <div className="balas-results">
          {result.options.map((opt, i) => (
            <OptionCard key={i} label={opt.label || `Opsi ${i + 1}`} text={opt.text || ''} notify={notify} />
          ))}
          <p className="muted center">Pilih yang paling pas, salin, lalu kirim ke pelanggan. Boleh diedit dulu ✍️</p>
        </div>
      )}
    </div>
  );
}
