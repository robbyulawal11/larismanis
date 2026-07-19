// ============================================================
// Buku Kas: semua catatan dari chat/suara terkumpul rapi.
// - Kartu ringkas: masuk, keluar, laba (hari ini / 7 / 30 hari)
// - Grafik batang 7 hari (SVG buatan sendiri, ringan)
// - "Minta Analisis" -> AI menceritakan kondisi usaha + saran
// - Bisa tambah catatan manual (tanpa AI) sebagai cadangan
// ============================================================

import React, { useMemo, useState } from 'react';
import { aiAnalysis } from '../lib/gemini.js';
import { rupiah, dateKey } from '../lib/utils.js';
import { ArrowUpIcon, ArrowDownIcon, PlusIcon, SparkIcon } from './Icons.jsx';
import Receipt from './Receipt.jsx';

const PERIODS = [
  { key: 'today', label: 'Hari ini' },
  { key: 'week', label: '7 hari' },
  { key: 'month', label: '30 hari' },
];

function BarChart({ last7 }) {
  const W = 320;
  const H = 120;
  const pad = 6;
  const n = last7.length;
  const bw = (W - pad * 2) / n;
  const max = Math.max(1, ...last7.map((d) => Math.max(d.in, d.out)));

  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} className="kas-chart" role="img" aria-label="Grafik pemasukan dan pengeluaran 7 hari terakhir">
      {last7.map((d, i) => {
        const x = pad + i * bw;
        const hIn = Math.round((d.in / max) * H);
        const hOut = Math.round((d.out / max) * H);
        return (
          <g key={d.key}>
            <rect x={x + bw * 0.14} y={H - hIn} width={bw * 0.34} height={Math.max(hIn, d.in > 0 ? 3 : 0)} rx="3" className="bar-in" />
            <rect x={x + bw * 0.52} y={H - hOut} width={bw * 0.34} height={Math.max(hOut, d.out > 0 ? 3 : 0)} rx="3" className="bar-out" />
            <text x={x + bw / 2} y={H + 16} textAnchor="middle" className="bar-label">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function KasTab({ store, transactions, summary, dataContext, onManualAdd, onDelete, notify }) {
  const [period, setPeriod] = useState('week');
  const [showForm, setShowForm] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loadingA, setLoadingA] = useState(false);

  // form manual
  const [fType, setFType] = useState('in');
  const [fItem, setFItem] = useState('');
  const [fQty, setFQty] = useState('1');
  const [fPrice, setFPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    let fromKey;
    if (period === 'today') fromKey = dateKey(now);
    else if (period === 'week') fromKey = dateKey(new Date(now.getTime() - 6 * dayMs));
    else fromKey = dateKey(new Date(now.getTime() - 29 * dayMs));
    const from = new Date(fromKey + 'T00:00:00');
    return transactions.filter((t) => new Date(t.created_at) >= from);
  }, [transactions, period]);

  const totals = summary[period] || { in: 0, out: 0 };
  const profit = totals.in - totals.out;

  async function askAnalysis() {
    setLoadingA(true);
    try {
      const out = await aiAnalysis({ dataContext });
      setAnalysis(out);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoadingA(false);
    }
  }

  async function submitManual(e) {
    e.preventDefault();
    const qty = Number(fQty) || 1;
    const price = Number(String(fPrice).replace(/[^\d]/g, '')) || 0;
    if (!fItem.trim()) return notify('Isi nama barang/keperluannya dulu ya.', 'error');
    if (price <= 0) return notify('Isi harganya dengan angka ya.', 'error');
    setSaving(true);
    try {
      await onManualAdd([
        { type: fType, item: fItem.trim(), qty, unit_price: price, total: qty * price },
      ]);
      setFItem('');
      setFQty('1');
      setFPrice('');
      setShowForm(false);
      notify('Catatan tersimpan ✓', 'ok');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="kas">
      <div className="seg seg-small">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={'seg-btn' + (period === p.key ? ' active' : '')}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="kas-cards">
        <div className="kas-card in">
          <span className="kas-card-label">
            <ArrowDownIcon width={14} height={14} /> Masuk
          </span>
          <strong>{rupiah(totals.in)}</strong>
        </div>
        <div className="kas-card out">
          <span className="kas-card-label">
            <ArrowUpIcon width={14} height={14} /> Keluar
          </span>
          <strong>{rupiah(totals.out)}</strong>
        </div>
        <div className={'kas-card profit' + (profit < 0 ? ' minus' : '')}>
          <span className="kas-card-label">Laba</span>
          <strong>{rupiah(profit)}</strong>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Ramai-sepinya 7 hari terakhir</h3>
        <BarChart last7={summary.last7} />
        <div className="chart-legend">
          <span>
            <i className="dot dot-in" /> Pemasukan
          </span>
          <span>
            <i className="dot dot-out" /> Pengeluaran
          </span>
        </div>
      </div>

      <div className="card analysis-card">
        <h3 className="card-title">
          <SparkIcon width={18} height={18} /> Analisis Bang Laris
        </h3>
        {!analysis && (
          <p className="muted">
            Biar angka-angka di atas diceritakan dengan bahasa manusia — plus saran yang bisa langsung dikerjakan minggu
            ini.
          </p>
        )}
        {analysis && (
          <div className="analysis-body">
            <p className="analysis-headline">{analysis.headline}</p>
            <div className="analysis-group">
              <h4>Yang Bang Laris lihat</h4>
              <ul>
                {(analysis.insights || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="analysis-group">
              <h4>Coba lakukan minggu ini</h4>
              <ul className="actions-list">
                {(analysis.actions || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <button className="btn btn-primary btn-block" onClick={askAnalysis} disabled={loadingA || transactions.length === 0}>
          {loadingA
            ? 'Bang Laris lagi baca catatan…'
            : transactions.length === 0
              ? 'Catat dulu minimal 1 transaksi'
              : analysis
                ? 'Analisis ulang'
                : 'Minta analisis sekarang'}
        </button>
      </div>

      <div className="kas-list-head">
        <h3>Nota tercatat {period === 'today' ? 'hari ini' : period === 'week' ? '7 hari terakhir' : '30 hari terakhir'}</h3>
        <button type="button" className="btn btn-small" onClick={() => setShowForm((v) => !v)}>
          <PlusIcon width={16} height={16} /> Manual
        </button>
      </div>

      {showForm && (
        <form className="card manual-form" onSubmit={submitManual}>
          <div className="seg seg-small">
            <button type="button" className={'seg-btn' + (fType === 'in' ? ' active' : '')} onClick={() => setFType('in')}>
              Pemasukan
            </button>
            <button type="button" className={'seg-btn' + (fType === 'out' ? ' active' : '')} onClick={() => setFType('out')}>
              Pengeluaran
            </button>
          </div>
          <div className="grid-3">
            <label className="field span-2">
              <span>Barang / keperluan</span>
              <input value={fItem} onChange={(e) => setFItem(e.target.value)} placeholder="mis. Es teh" maxLength={80} />
            </label>
            <label className="field">
              <span>Jumlah</span>
              <input value={fQty} onChange={(e) => setFQty(e.target.value)} inputMode="numeric" />
            </label>
          </div>
          <label className="field">
            <span>Harga satuan (Rp)</span>
            <input value={fPrice} onChange={(e) => setFPrice(e.target.value)} inputMode="numeric" placeholder="mis. 5000" />
          </label>
          <button className="btn btn-primary btn-block" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan catatan'}
          </button>
        </form>
      )}

      <div className="kas-list">
        {filtered.length === 0 ? (
          <p className="empty">
            Belum ada catatan di periode ini. Coba bilang ke Bang Laris: <em>"laku 3 es teh goceng-an"</em> 😉
          </p>
        ) : (
          filtered.map((tx) => <Receipt key={tx.id} tx={tx} storeName={store.name} onDelete={onDelete} />)
        )}
      </div>
    </div>
  );
}
