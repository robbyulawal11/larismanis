// ============================================================
// App shell LarisManis.
// - Menyimpan sesi warung di localStorage (hanya kodenya;
//   datanya sendiri selalu diambil real-time dari Supabase)
// - Memuat transaksi & menghitung ringkasan untuk semua tab
// - Navigasi bawah 4 tab ala aplikasi HP yang familiar
// ============================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { hasSupabase } from './lib/config.js';
import { listTransactions, addTransactions, deleteTransaction, getStoreByCode } from './lib/db.js';
import { computeSummary, summaryForAI } from './lib/utils.js';
import { ChatIcon, SparkIcon, BookIcon, ReplyIcon, LogoMark } from './components/Icons.jsx';
import Onboarding from './components/Onboarding.jsx';
import ChatTab from './components/ChatTab.jsx';
import StudioTab from './components/StudioTab.jsx';
import KasTab from './components/KasTab.jsx';
import BalasTab from './components/BalasTab.jsx';

const LS_KEY = 'larismanis_store_code';

const TABS = [
  { key: 'chat', label: 'Bang Laris', Icon: ChatIcon },
  { key: 'studio', label: 'Studio', Icon: SparkIcon },
  { key: 'kas', label: 'Buku Kas', Icon: BookIcon },
  { key: 'balas', label: 'Balas', Icon: ReplyIcon },
];

function SetupScreen() {
  return (
    <div className="onboard">
      <div className="onboard-card">
        <LogoMark size={44} />
        <h2 className="onboard-title">Satu langkah lagi ⚙️</h2>
        <p className="onboard-sub">
          Konfigurasi database belum diisi. Salin <code>.env.example</code> menjadi <code>.env</code>, isi{' '}
          <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code>, lalu jalankan ulang aplikasi.
        </p>
        <p className="onboard-sub">
          Panduan lengkap langkah demi langkah ada di file <strong>PANDUAN.md</strong>.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [store, setStore] = useState(null);
  const [booting, setBooting] = useState(true);
  const [tab, setTab] = useState('chat');
  const [transactions, setTransactions] = useState([]);
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg, type = 'ok') => {
    setToast({ msg, type, id: Date.now() });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  // Pulihkan sesi dari kode warung yang tersimpan
  useEffect(() => {
    if (!hasSupabase) {
      setBooting(false);
      return;
    }
    const saved = localStorage.getItem(LS_KEY);
    if (!saved) {
      setBooting(false);
      return;
    }
    getStoreByCode(saved)
      .then((s) => {
        if (s) setStore(s);
        else localStorage.removeItem(LS_KEY);
      })
      .catch(() => {})
      .finally(() => setBooting(false));
  }, []);

  // Muat transaksi setiap kali warung berganti
  const refresh = useCallback(async () => {
    if (!store) return;
    try {
      const rows = await listTransactions(store.code);
      setTransactions(rows);
    } catch (err) {
      notify('Gagal memuat catatan: ' + err.message, 'error');
    }
  }, [store, notify]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const summary = useMemo(() => computeSummary(transactions), [transactions]);
  const dataContext = useMemo(
    () => (store ? summaryForAI(store, summary, transactions) : ''),
    [store, summary, transactions]
  );

  const handleReady = useCallback((s) => {
    localStorage.setItem(LS_KEY, s.code);
    setStore(s);
    setTab('chat');
  }, []);

  const handleLogout = useCallback(() => {
    if (!window.confirm('Keluar dari warung ini? (Data tetap aman di cloud — masuk lagi kapan pun dengan Kode Warung)')) return;
    localStorage.removeItem(LS_KEY);
    setStore(null);
    setTransactions([]);
  }, []);

  // Simpan transaksi (dipakai Chat & input manual Kas) — kembalikan baris tersimpan utk Nota
  const saveTransactions = useCallback(
    async (rows) => {
      const saved = await addTransactions(store.code, rows);
      setTransactions((prev) => [...saved.slice().reverse(), ...prev]);
      return saved;
    },
    [store]
  );

  const removeTransaction = useCallback(
    async (tx) => {
      if (!window.confirm(`Hapus catatan "${tx.item}"?`)) return;
      try {
        await deleteTransaction(tx.id);
        setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
        notify('Catatan dihapus.', 'ok');
      } catch (err) {
        notify(err.message, 'error');
      }
    },
    [notify]
  );

  if (!hasSupabase) return <SetupScreen />;

  if (booting) {
    return (
      <div className="boot">
        <LogoMark size={52} />
        <p>Menyiapkan warung…</p>
      </div>
    );
  }

  if (!store) {
    return (
      <>
        <Onboarding onReady={handleReady} notify={notify} />
        {toast && <div className={'toast ' + toast.type}>{toast.msg}</div>}
      </>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-brand">
          <LogoMark size={30} />
          <div className="topbar-titles">
            <span className="brand-name small">
              Laris<span>Manis</span>
            </span>
            <span className="topbar-store">{store.name}</span>
          </div>
        </div>
        <div className="topbar-right">
          <span className="code-chip" title="Kode Warung — kunci untuk masuk dari HP lain">
            {store.code}
          </span>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </header>

      <main className="content">
        <div className={tab === 'chat' ? 'tabpane active' : 'tabpane'}>
          <ChatTab store={store} dataContext={dataContext} onSaveTransactions={saveTransactions} notify={notify} />
        </div>
        <div className={tab === 'studio' ? 'tabpane active' : 'tabpane'}>
          <StudioTab notify={notify} />
        </div>
        <div className={tab === 'kas' ? 'tabpane active' : 'tabpane'}>
          <KasTab
            store={store}
            transactions={transactions}
            summary={summary}
            dataContext={dataContext}
            onManualAdd={saveTransactions}
            onDelete={removeTransaction}
            notify={notify}
          />
        </div>
        <div className={tab === 'balas' ? 'tabpane active' : 'tabpane'}>
          <BalasTab store={store} onStoreUpdate={setStore} notify={notify} />
        </div>
      </main>

      <nav className="bottomnav" aria-label="Navigasi utama">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            className={'nav-btn' + (tab === key ? ' active' : '')}
            onClick={() => setTab(key)}
            aria-current={tab === key ? 'page' : undefined}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {toast && <div className={'toast ' + toast.type}>{toast.msg}</div>}
    </div>
  );
}
