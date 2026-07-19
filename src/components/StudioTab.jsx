// ============================================================
// Studio Konten: satu foto -> satu paket promosi.
// AI melihat foto produk lalu membuat 4 format sekaligus:
// caption Instagram, judul+deskripsi marketplace, broadcast
// WhatsApp, dan deskripsi English untuk pembeli luar negeri.
// ============================================================

import React, { useRef, useState } from 'react';
import { aiStudio } from '../lib/gemini.js';
import { compressImage, copyText } from '../lib/utils.js';
import { CameraIcon, CopyIcon, CheckIcon, SparkIcon } from './Icons.jsx';

const TONES = ['Santai & Gaul', 'Hangat Kekeluargaan', 'Meyakinkan & Premium'];

function CopyButton({ getText, notify }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={'copy-btn' + (done ? ' done' : '')}
      onClick={async () => {
        const ok = await copyText(getText());
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
  );
}

export default function StudioTab({ notify }) {
  const fileRef = useRef(null);
  const [photo, setPhoto] = useState(null); // {dataUrl, base64, mimeType}
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [points, setPoints] = useState('');
  const [tone, setTone] = useState(TONES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function onPickFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
      setResult(null);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      e.target.value = '';
    }
  }

  async function generate() {
    if (!photo) return notify('Pilih foto produknya dulu ya, Juragan.', 'error');
    setLoading(true);
    setResult(null);
    try {
      const out = await aiStudio({
        imageBase64: photo.base64,
        mimeType: photo.mimeType,
        productName: productName.trim(),
        price: price.trim(),
        sellingPoints: points.trim(),
        tone,
      });
      setResult(out);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const hashtagText = result && Array.isArray(result.hashtags)
    ? result.hashtags.map((h) => '#' + String(h).replace(/^#/, '')).join(' ')
    : '';

  return (
    <div className="studio">
      <div className="card">
        <h3 className="card-title">
          <SparkIcon width={18} height={18} /> Foto produk jadi konten promosi
        </h3>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onPickFile}
          hidden
        />

        {photo ? (
          <div className="photo-preview">
            <img src={photo.dataUrl} alt="Foto produk" />
            <button type="button" className="btn btn-ghost" onClick={() => fileRef.current.click()}>
              Ganti foto
            </button>
          </div>
        ) : (
          <button type="button" className="photo-drop" onClick={() => fileRef.current.click()}>
            <CameraIcon width={30} height={30} />
            <strong>Ambil / pilih foto produk</strong>
            <span>Cukup foto dari HP — nanti dirapikan AI</span>
          </button>
        )}

        <div className="grid-2">
          <label className="field">
            <span>Nama produk (opsional)</span>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="mis. Keripik Pisang Coklat"
              maxLength={80}
            />
          </label>
          <label className="field">
            <span>Harga (opsional)</span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="mis. Rp12.000 / bungkus"
              maxLength={40}
            />
          </label>
        </div>

        <label className="field">
          <span>Keunggulan produk (opsional)</span>
          <input
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="mis. tanpa pengawet, renyah 3 bulan, bisa kirim luar kota"
            maxLength={160}
          />
        </label>

        <label className="field">
          <span>Gaya bahasa</span>
          <select value={tone} onChange={(e) => setTone(e.target.value)}>
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <button className="btn btn-primary btn-block" onClick={generate} disabled={loading}>
          {loading ? 'Bang Laris lagi meracik konten…' : 'Buatkan paket konten ✨'}
        </button>
      </div>

      {result && (
        <div className="studio-results">
          {result.product_guess && (
            <p className="guess-line">
              Bang Laris melihat: <strong>{result.product_guess}</strong>
            </p>
          )}

          <div className="card content-card">
            <div className="content-head">
              <span className="content-badge ig">Instagram</span>
              <CopyButton getText={() => `${result.instagram}\n\n${hashtagText}`} notify={notify} />
            </div>
            <p className="content-text">{result.instagram}</p>
            {hashtagText && <p className="hashtags">{hashtagText}</p>}
          </div>

          <div className="card content-card">
            <div className="content-head">
              <span className="content-badge mp">Marketplace</span>
              <CopyButton
                getText={() =>
                  `${result.marketplace && result.marketplace.title}\n\n${result.marketplace && result.marketplace.description}`
                }
                notify={notify}
              />
            </div>
            <p className="content-title-line">{result.marketplace && result.marketplace.title}</p>
            <p className="content-text">{result.marketplace && result.marketplace.description}</p>
          </div>

          <div className="card content-card">
            <div className="content-head">
              <span className="content-badge wa">WhatsApp</span>
              <CopyButton getText={() => result.whatsapp} notify={notify} />
            </div>
            <p className="content-text">{result.whatsapp}</p>
          </div>

          <div className="card content-card">
            <div className="content-head">
              <span className="content-badge en">English · Ekspor</span>
              <CopyButton getText={() => result.english} notify={notify} />
            </div>
            <p className="content-text">{result.english}</p>
          </div>

          <button className="btn btn-ghost btn-block" onClick={generate} disabled={loading}>
            🔄 Racik ulang dengan variasi lain
          </button>
        </div>
      )}
    </div>
  );
}
