# 🍃 LarisManis — Asisten AI Juragan UMKM

> **"Ngomong doang, beres."** Catat jualan pakai suara, bikin konten promosi dari foto, pahami untung-rugi tanpa pusing tabel — semua dalam satu asisten AI berbahasa warung.

Dibangun untuk **IDCamp Developer Challenge #2: Digitalization & Acceleration of MSMEs with Generative AI**.

## Masalahnya

64 juta pelaku UMKM menyumbang 60% PDB Indonesia, tapi baru 12% yang terdigitalisasi. Bukan karena tidak mau — tapi karena solusi yang ada **terlalu rumit**: aplikasi kasir penuh menu, dashboard penuh istilah akuntansi, dan tools pemasaran berbahasa Inggris. Padahal juragan warung sudah sangat mahir dengan satu hal: **ngobrol di WhatsApp**.

## Solusinya

LarisManis mengubah kemahiran itu menjadi digitalisasi. Tidak ada form. Tidak ada menu rumit. Cukup ngobrol dengan **Bang Laris**:

| Juragan bilang / lakukan | Yang terjadi |
|---|---|
| 🎙️ *"laku 5 nasgor 15rb-an sama 3 es teh goceng"* | AI memahami bahasa warung → 2 transaksi tercatat otomatis ke cloud → muncul **Nota Digital** |
| 💬 *"untung berapa minggu ini?"* | AI menjawab dari **data transaksi sungguhan**, bukan jawaban generik |
| 📸 Upload foto produk | AI Vision meracik **4 konten sekaligus**: caption Instagram, judul+deskripsi marketplace, broadcast WhatsApp, dan deskripsi **English untuk ekspor** + 8 hashtag |
| 📊 Buka Buku Kas → "Minta analisis" | Angka diubah jadi **cerita** + 3 saran konkret yang bisa dikerjakan minggu ini (tanpa jargon: dilarang kata "margin"/"cashflow") |
| 📥 Tempel chat pelanggan | 2 draf balasan siap kirim, berdasarkan info usaha — AI **tidak mengarang** harga/stok |

## Fitur Kunci & Keunikan

1. **Voice-to-Ledger** — pencatatan keuangan dengan suara bahasa Indonesia (Web Speech API `id-ID` + Gemini intent parsing). Paham "goceng", "ceban", "15rb-an", "@12rb", "nasgor".
2. **Satu asisten, bukan lima aplikasi** — pencatatan, analitik, konten, dan layanan pelanggan menyatu dalam pengalaman chat yang sudah familiar.
3. **AI yang membumi** — semua output dirancang untuk pengguna non-teknis: bahasa sederhana, format Rp, saran yang murah dan praktis.
4. **Data real-time, bukan dummy** — semua catatan tersimpan di Supabase (PostgreSQL cloud). Buka dari HP mana pun dengan Kode Warung; AI selalu menjawab dari data terkini.
5. **Onboarding 30 detik tanpa email/password** — cukup nama usaha → dapat Kode Warung.
6. **Gerbang ekspor** — setiap foto produk otomatis mendapat deskripsi English siap pakai untuk pembeli internasional.

## Teknologi

- **Frontend**: React 18 + Vite, CSS custom (design system "Spanduk Warung"), mobile-first PWA-ready
- **AI**: Google Gemini 2.5 Flash — multimodal (teks + vision), JSON mode (`responseMimeType`) untuk output terstruktur, prompt engineering khusus "bahasa warung"
- **Voice**: Web Speech API (`id-ID`) — gratis, tanpa server
- **Database**: Supabase (PostgreSQL + PostgREST + RLS) — data real-time lintas perangkat
- **Keamanan**: di produksi, API key Gemini disimpan di server melalui proxy Vercel Serverless (`/api/gemini`) — tidak pernah terekspos ke browser
- **Dependensi runtime**: hanya `react` + `react-dom`. Tanpa SDK berat → bundel kecil, cepat di HP kentang & sinyal pas-pasan.

## Menjalankan Project

Panduan lengkap langkah demi langkah (termasuk setup API key, database, deploy, sampai submission) ada di **[PANDUAN.md](./PANDUAN.md)**. Versi singkat:

```bash
cp .env.example .env    # isi kunci Supabase + Gemini (lihat PANDUAN.md)
npm install
npm run dev             # buka http://localhost:5173
```

## Struktur Project

```
├── api/gemini.js          # Proxy aman Gemini (Vercel Serverless)
├── supabase_setup.sql     # Setup database sekali jalan
├── src/
│   ├── lib/
│   │   ├── gemini.js      # 4 kemampuan AI + prompt engineering
│   │   ├── db.js          # Supabase via REST (tanpa SDK)
│   │   ├── utils.js       # ringkasan data real-time utk konteks AI
│   │   └── config.js
│   └── components/
│       ├── ChatTab.jsx    # chat + input suara + pencatatan otomatis
│       ├── StudioTab.jsx  # foto → 4 format konten
│       ├── KasTab.jsx     # ringkasan, grafik, analisis AI
│       ├── BalasTab.jsx   # draf balasan pelanggan
│       ├── Receipt.jsx    # signature: Nota Digital
│       └── Onboarding.jsx # Kode Warung tanpa email/password
├── PANDUAN.md             # panduan eksekusi manual A–Z
└── PROJECT_BRIEF.md       # draft isi submission Dicoding
```

## Roadmap Setelah MVP

Integrasi WhatsApp Business API (mencatat langsung dari chat WA asli), Supabase Auth + PIN untuk keamanan berlapis, mode offline dengan antrean sinkronisasi, dukungan bahasa daerah (Jawa, Sunda), dan ekspor laporan PDF untuk pengajuan KUR.

---

Dibuat dengan ❤️ untuk 64 juta juragan Indonesia.
