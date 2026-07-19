// ============================================================
// Tab utama: ngobrol dengan Bang Laris.
// - Ketik ATAU tekan tombol mic dan bicara (bahasa Indonesia).
// - "laku 5 nasgor 15rb-an" -> AI paham -> tersimpan ke cloud
//   -> muncul Nota Digital sebagai bukti, langsung di percakapan.
// - Pertanyaan bisnis dijawab dari data transaksi sungguhan.
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { aiChat } from '../lib/gemini.js';
import { uid } from '../lib/utils.js';
import { MicIcon, SendIcon } from './Icons.jsx';
import Receipt from './Receipt.jsx';

const QUICK_CHIPS = [
  'Laku 3 es teh goceng-an',
  'Beli gas 22 ribu',
  'Untung berapa minggu ini?',
  'Apa produk paling laris?',
];

// Pesan ramah untuk tiap kode error Web Speech API
const MIC_ERROR_MESSAGES = {
  'not-allowed':
    'Izin mikrofon diblokir. Klik ikon gembok 🔒 di sebelah alamat situs → izinkan Mikrofon → coba lagi.',
  'service-not-allowed':
    'Browser memblokir layanan input suara. Cek izin mikrofon di pengaturan situs, lalu muat ulang halaman.',
  'audio-capture':
    'Mikrofon tidak ditemukan. Pastikan perangkat punya mic yang aktif dan tidak dipakai aplikasi lain.',
  network:
    'Input suara butuh internet (suara diproses di server browser). Cek koneksi lalu coba lagi ya.',
  'no-speech': 'Tidak ada suara yang tertangkap. Coba lagi, bicara lebih dekat ke mic ya.',
  'language-not-supported': 'Browser ini belum mendukung input suara bahasa Indonesia.',
};

const MIC_ISSUE_MESSAGES = {
  'no-support':
    'Browser ini belum mendukung input suara. Pakai Chrome atau Edge ya — pencatatan tetap bisa lewat ketik.',
  insecure:
    'Input suara hanya jalan lewat HTTPS atau localhost. Buka aplikasi lewat alamat https:// (mis. Vercel), jangan lewat IP http:// biasa.',
};

export default function ChatTab({ store, dataContext, onSaveTransactions, notify }) {
  const [messages, setMessages] = useState(() => [
    {
      id: uid(),
      role: 'bot',
      text:
        `Halo Juragan ${store.name}! Saya Bang Laris 👋\n` +
        `Cukup ketik atau tekan tombol mic lalu ngomong biasa saja, contohnya:\n` +
        `• "laku 5 nasi goreng 15 ribuan"\n` +
        `• "beli gas 22rb"\n` +
        `• "untung berapa hari ini?"`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  // null = mic siap dipakai; 'no-support' / 'insecure' = ada kendala
  const [micIssue, setMicIssue] = useState(null);

  const recogRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Siapkan pengenal suara (Web Speech API, bahasa Indonesia)
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setMicIssue('no-support');
      return;
    }
    // Web Speech hanya berjalan di HTTPS/localhost. Di http:// biasa
    // (mis. buka lewat IP dari HP), start() selalu gagal diam-diam.
    if (!window.isSecureContext) {
      setMicIssue('insecure');
      return;
    }
    const r = new SR();
    r.lang = 'id-ID';
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onstart = () => setListening(true);
    r.onresult = (e) => {
      const text = (e.results[0][0].transcript || '').trim();
      if (text) setInput((prev) => (prev ? prev + ' ' + text : text));
    };
    r.onend = () => setListening(false);
    r.onerror = (e) => {
      setListening(false);
      if (e.error === 'aborted') return; // dihentikan sendiri, bukan masalah
      notify(
        MIC_ERROR_MESSAGES[e.error] || `Input suara gagal (${e.error || 'unknown'}). Coba lagi ya.`,
        'error'
      );
    };
    recogRef.current = r;
    return () => {
      try {
        r.abort();
      } catch (_) {}
    };
  }, [notify]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  function toggleMic() {
    // Tombol tetap bisa diklik saat bermasalah supaya penggunanya
    // tahu kenapa (title hover tidak terlihat di HP).
    if (micIssue) {
      notify(MIC_ISSUE_MESSAGES[micIssue], 'error');
      return;
    }
    const r = recogRef.current;
    if (!r) return;
    if (listening) {
      r.stop();
      setListening(false);
    } else {
      try {
        r.start();
        setListening(true);
      } catch (_) {
        // start() saat sesi sebelumnya belum benar-benar berhenti
        setListening(false);
        notify('Mic sedang sibuk. Tunggu sebentar lalu coba lagi ya.', 'error');
      }
    }
  }

  async function send(textRaw) {
    const text = (textRaw !== undefined ? textRaw : input).trim();
    if (!text || loading) return;

    setInput('');
    setMessages((m) => [...m, { id: uid(), role: 'user', text }]);
    setLoading(true);

    try {
      // Riwayat singkat (6 pesan terakhir) supaya AI paham konteks lanjutan
      const history = messagesRef.current.slice(-6).map((m) => ({ role: m.role, text: m.text }));

      const out = await aiChat({ message: text, dataContext, history });

      let receipts = [];
      if (
        (out.intent === 'record_sale' || out.intent === 'record_expense') &&
        out.transactions.length > 0
      ) {
        receipts = await onSaveTransactions(out.transactions); // simpan ke Supabase (real-time)
      }

      setMessages((m) => [...m, { id: uid(), role: 'bot', text: out.reply, receipts }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { id: uid(), role: 'bot', text: '😅 ' + err.message, error: true },
      ]);
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    send();
  }

  return (
    <div className="chat">
      <div className="chat-scroll">
        {messages.map((m) => (
          <div key={m.id} className={'bubble-row ' + (m.role === 'user' ? 'right' : 'left')}>
            <div className={'bubble ' + (m.role === 'user' ? 'bubble-user' : 'bubble-bot') + (m.error ? ' bubble-error' : '')}>
              {m.text}
            </div>
            {m.receipts && m.receipts.length > 0 && (
              <div className="bubble-receipts">
                {m.receipts.map((tx) => (
                  <Receipt key={tx.id} tx={tx} storeName={store.name} />
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="bubble-row left">
            <div className="bubble bubble-bot typing" aria-label="Bang Laris sedang mengetik">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-chips" role="list">
        {QUICK_CHIPS.map((c) => (
          <button key={c} type="button" className="chip" onClick={() => send(c)} disabled={loading}>
            {c}
          </button>
        ))}
      </div>

      <form className="chat-inputbar" onSubmit={onSubmit}>
        <button
          type="button"
          className={'mic-btn' + (listening ? ' listening' : '') + (micIssue ? ' unavailable' : '')}
          onClick={toggleMic}
          title={
            micIssue
              ? MIC_ISSUE_MESSAGES[micIssue]
              : listening
                ? 'Berhenti mendengarkan'
                : 'Catat pakai suara'
          }
          aria-label="Input suara"
        >
          <MicIcon />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? 'Silakan bicara…' : 'Ketik atau tekan mic lalu ngomong…'}
          aria-label="Pesan untuk Bang Laris"
        />
        <button type="submit" className="send-btn" disabled={loading || !input.trim()} aria-label="Kirim">
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
