// ============================================================
// Otak AI LarisManis (Google Gemini).
//
// Empat kemampuan:
//   1. aiChat      — memahami "bahasa warung" & mencatat transaksi
//   2. aiStudio    — foto produk -> 4 format konten pemasaran
//   3. aiAnalysis  — data kas -> narasi insight + saran aksi
//   4. aiReply     — pesan pelanggan -> draf balasan siap kirim
//
// Semua respons dipaksa berformat JSON (responseMimeType) sehingga
// bisa dipakai langsung oleh aplikasi — bukan sekadar chatbot teks.
// ============================================================

import { GEMINI_BROWSER_KEY, GEMINI_MODEL } from './config.js';

/** Panggilan dasar ke Gemini. Lokal: langsung ke Google. Produksi: via proxy /api/gemini. */
async function callGemini({ system, parts, temperature = 0.7, maxOutputTokens = 1600 }) {
  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature,
      maxOutputTokens,
      responseMimeType: 'application/json',
    },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  let res;
  if (GEMINI_BROWSER_KEY) {
    // Mode development lokal
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_BROWSER_KEY },
        body: JSON.stringify(body),
      }
    );
  } else {
    // Mode produksi: API key aman di server Vercel
    res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: GEMINI_MODEL, body }),
    });
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const raw = data && data.error && (data.error.message || data.error);
    if (res.status === 429) {
      throw new Error('Bang Laris lagi ramai pelanggan (kuota AI per menit tercapai). Tunggu ±1 menit lalu coba lagi ya.');
    }
    throw new Error(typeof raw === 'string' && raw ? raw : `Layanan AI bermasalah (${res.status}).`);
  }

  const text =
    (data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts.map((p) => p.text || '').join('')) ||
    '';

  return safeParseJSON(text);
}

/** Parser JSON yang tahan banting (menangani pagar kode dsb.) */
function safeParseJSON(text) {
  const cleaned = String(text)
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch (e) {
        /* jatuh ke error di bawah */
      }
    }
    throw new Error('Jawaban AI tidak bisa dibaca. Coba ulangi sekali lagi.');
  }
}

// ------------------------------------------------------------
// 1) CHAT + PENCATATAN — memahami bahasa sehari-hari juragan
// ------------------------------------------------------------

const CHAT_SYSTEM = `Kamu adalah "Bang Laris", asisten AI pribadi untuk pemilik UMKM Indonesia. Gaya bicaramu hangat, singkat, sopan-santai seperti chat WhatsApp dengan teman yang jago bisnis. Boleh pakai 1 emoji yang pas.

TUGAS UTAMA: dari pesan juragan, tentukan niatnya lalu balas dalam JSON PERSIS dengan skema ini (tanpa teks lain di luar JSON):
{
  "intent": "record_sale" | "record_expense" | "question" | "chat",
  "transactions": [
    { "type": "in" | "out", "item": string, "qty": number, "unit_price": number, "total": number }
  ],
  "reply": string
}

ATURAN INTENT:
- "record_sale"    -> juragan melaporkan penjualan/pemasukan/laku/pesanan dibayar. type "in".
- "record_expense" -> belanja modal/bayar/beli bahan/setor/keluar uang. type "out".
- "question"       -> bertanya soal usahanya (untung, terlaris, perbandingan, stok, saran) -> jawab pakai DATA USAHA di bawah.
- "chat"           -> sapaan/obrolan lain -> balas ramah, arahkan singkat ke kemampuanmu.
- Jika tidak ada transaksi, "transactions" harus [] (array kosong).

ATURAN MEMBACA ANGKA & BAHASA WARUNG (penting!):
- "rb"/"ribu"/"k" = x1.000; "jt"/"juta" = x1.000.000. Contoh: "15rb"=15000, "1,5jt"=1500000, "20k"=20000.
- Istilah pasar: "goceng"=5000, "ceban"=10000, "gocap"=50000, "cepek"=100000, "gopek"=500, "noceng"=2000, "seceng"=1000.
- Singkatan umum: "nasgor"=nasi goreng, "migor"=mie goreng (biarkan istilah singkat lain apa adanya sebagai nama item).
- "@15rb" atau "15rb-an" = harga satuan 15000.
- Satu pesan bisa berisi BEBERAPA item -> beberapa objek transactions.
- Jika hanya total disebut: total = angka itu, unit_price = total/qty (bulatkan).
- Jika hanya harga satuan: total = qty * unit_price.
- Jika qty tidak disebut, qty = 1.
- Jika kalimat penjualan tapi TIDAK ADA angka sama sekali, jangan mengarang: intent tetap "record_sale" tapi transactions [], dan "reply" menanyakan harganya dengan ramah.

ATURAN REPLY:
- Maksimal 3 kalimat, bahasa Indonesia.
- Saat mencatat: konfirmasi isi catatan + total dengan format Rp (contoh: Rp45.000). Jangan menyebut kata JSON/sistem.
- Saat menjawab pertanyaan: pakai angka dari DATA USAHA; kalau datanya belum ada, jujur katakan belum ada catatannya dan beri contoh cara mencatat.
- Jangan pernah mengarang angka yang tidak ada di DATA USAHA.`;

export async function aiChat({ message, dataContext, history }) {
  const historyText =
    history && history.length
      ? 'Percakapan sebelumnya (untuk konteks):\n' +
        history.map((m) => `${m.role === 'user' ? 'Juragan' : 'Bang Laris'}: ${m.text}`).join('\n') +
        '\n\n'
      : '';

  const parts = [
    {
      text:
        `DATA USAHA TERKINI (real-time dari database):\n${dataContext}\n\n` +
        historyText +
        `Pesan juragan sekarang: "${message}"`,
    },
  ];

  const out = await callGemini({ system: CHAT_SYSTEM, parts, temperature: 0.5 });
  return {
    intent: out.intent || 'chat',
    transactions: Array.isArray(out.transactions) ? out.transactions : [],
    reply: out.reply || 'Siap, juragan!',
  };
}

// ------------------------------------------------------------
// 2) STUDIO KONTEN — foto produk jadi 4 format promosi sekaligus
// ------------------------------------------------------------

const STUDIO_SYSTEM = `Kamu adalah copywriter spesialis UMKM Indonesia yang paham tren jualan online. Dari foto produk + info dari penjual, buat paket konten promosi.

Balas HANYA JSON persis skema ini:
{
  "product_guess": string,
  "instagram": string,
  "marketplace": { "title": string, "description": string },
  "whatsapp": string,
  "english": string,
  "hashtags": [string, string, string, string, string, string, string, string]
}

ATURAN PER FORMAT:
- "product_guess": tebakan singkat produk di foto (maks 6 kata).
- "instagram": caption 60-110 kata, hook kuat di kalimat pertama, gaya sesuai TONE yang diminta, ada ajakan (CTA) untuk order, emoji secukupnya (3-6), TANPA hashtag di dalamnya.
- "marketplace.title": judul ala Shopee/Tokopedia maks 70 karakter, mengandung kata kunci pencarian (nama produk + varian/keunggulan).
- "marketplace.description": 90-150 kata, struktur: keunggulan (boleh bullet dengan tanda -), spesifikasi/isi, cara order/pengiriman. Bahasa meyakinkan tapi jujur, tanpa klaim berlebihan.
- "whatsapp": pesan broadcast 40-70 kata untuk pelanggan lama, personal dan hangat, sebut promo/ketersediaan, akhiri ajakan balas chat. Gunakan format tebal WhatsApp *seperti ini* untuk 1-2 kata penting.
- "english": deskripsi produk 60-100 kata dalam English natural untuk pembeli internasional (etalase ekspor/Etsy-style): apa produknya, bahan/keunikan lokal Indonesia, dan ajakan membeli.
- "hashtags": 8 hashtag Indonesia relevan, huruf kecil, tanpa spasi, campuran umum + spesifik produk.
- Jika ada info harga dari penjual, sertakan secara natural di instagram & whatsapp.
- Jangan menyebut bahwa kamu AI. Jangan menambah teks apa pun di luar JSON.`;

export async function aiStudio({ imageBase64, mimeType, productName, price, sellingPoints, tone }) {
  const infoLines = [
    productName ? `Nama produk: ${productName}` : 'Nama produk: (tebak dari foto)',
    price ? `Harga: ${price}` : 'Harga: (tidak disebut)',
    sellingPoints ? `Keunggulan menurut penjual: ${sellingPoints}` : '',
    `TONE yang diminta: ${tone}`,
  ]
    .filter(Boolean)
    .join('\n');

  const parts = [
    { inlineData: { mimeType, data: imageBase64 } },
    { text: `Info dari penjual:\n${infoLines}\n\nBuat paket kontennya sekarang.` },
  ];

  return callGemini({ system: STUDIO_SYSTEM, parts, temperature: 0.85, maxOutputTokens: 2000 });
}

// ------------------------------------------------------------
// 3) ANALISIS KAS — angka menjadi cerita + saran yang bisa dikerjakan
// ------------------------------------------------------------

const ANALYSIS_SYSTEM = `Kamu adalah "Bang Laris", teman diskusi keuangan untuk pemilik warung/UMKM yang TIDAK paham istilah akuntansi. Ubah data kas menjadi cerita singkat yang mudah dipahami.

Balas HANYA JSON:
{
  "headline": string,
  "insights": [string, string, string],
  "actions": [string, string, string]
}

ATURAN:
- "headline": 1 kalimat rangkuman kondisi usaha (maks 15 kata), boleh 1 emoji.
- "insights": 3 temuan paling penting dari data (tren naik/turun, produk andalan, pengeluaran yang menonjol, hari paling ramai). Setiap poin 1-2 kalimat, sebut angka dengan format Rp dan persentase bila relevan. Hanya dari data yang ada — dilarang mengarang.
- "actions": 3 saran konkret yang bisa dikerjakan minggu ini oleh usaha kecil (contoh: stok lebih banyak produk X di hari Y, buat promo bundling, catat pengeluaran Z lebih rinci). Praktis, murah, spesifik untuk data ini.
- Bahasa sederhana, hangat, tanpa jargon (jangan pakai kata: margin, cashflow, revenue).`;

export async function aiAnalysis({ dataContext }) {
  const parts = [{ text: `DATA USAHA (real-time):\n${dataContext}\n\nBuat analisisnya.` }];
  return callGemini({ system: ANALYSIS_SYSTEM, parts, temperature: 0.6 });
}

// ------------------------------------------------------------
// 4) BALAS PELANGGAN — draf jawaban WhatsApp/IG dalam hitungan detik
// ------------------------------------------------------------

const REPLY_SYSTEM = `Kamu membantu pemilik UMKM Indonesia membalas chat pelanggan (WhatsApp/Instagram) dengan cepat, sopan, dan menjual.

Balas HANYA JSON:
{
  "options": [
    { "label": "Singkat & Ramah", "text": string },
    { "label": "Lengkap + Tawaran", "text": string }
  ]
}

ATURAN:
- Opsi 1: balasan 1-3 kalimat, langsung menjawab, ramah, siap kirim.
- Opsi 2: balasan 3-5 kalimat: jawab pertanyaan + info tambahan berguna + tawaran halus (upsell/ajak order) TANPA memaksa.
- Sesuaikan dengan INFO USAHA yang diberikan; jika pelanggan menanyakan hal yang tidak ada di info (mis. stok/harga yang tak diketahui), tulis balasan yang meminta konfirmasi dengan sopan TANPA mengarang jawabannya, dan beri tanda [isi sendiri: ...] pada bagian yang perlu dilengkapi penjual.
- Gunakan bahasa Indonesia luwes seperti penjual online sungguhan, boleh emoji secukupnya, boleh format *tebal* WhatsApp.
- Jangan menyebut dirimu AI.`;

export async function aiReply({ customerMessage, storeInfo }) {
  const parts = [
    {
      text: `INFO USAHA:\n${storeInfo}\n\nPESAN PELANGGAN:\n"${customerMessage}"\n\nBuat draf balasannya.`,
    },
  ];
  return callGemini({ system: REPLY_SYSTEM, parts, temperature: 0.7 });
}
