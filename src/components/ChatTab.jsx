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
  const [micSupported, setMicSupported] = useState(true);

  const recogRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Siapkan pengenal suara (Web Speech API, bahasa Indonesia)
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setMicSupported(false);
      return;
    }
    const r = new SR();
    r.lang = 'id-ID';
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + text : text));
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recogRef.current = r;
    return () => {
      try {
        r.abort();
      } catch (_) {}
    };
  }, []);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  function toggleMic() {
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
        setListening(false);
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
          className={'mic-btn' + (listening ? ' listening' : '')}
          onClick={toggleMic}
          disabled={!micSupported}
          title={
            micSupported
              ? listening
                ? 'Berhenti mendengarkan'
                : 'Catat pakai suara'
              : 'Browser ini belum mendukung input suara — pakai Chrome ya'
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
