# 📘 PANDUAN EKSEKUSI MANUAL — LarisManis untuk IDCamp Challenge #2

Dokumen ini memandu Anda dari **kode yang sudah jadi** sampai **submit ke Dicoding**. Semua kode aplikasi sudah selesai 100% — tugas Anda hanya menghubungkan "kabel-kabelnya": API key, database, deploy, dan submission.

**Deadline challenge: 22 Juli 2026.** Total waktu eksekusi panduan ini: ±60–90 menit (di luar pilot UMKM opsional).

---

## Peta Jalan (ringkas)

| # | Langkah | Waktu | Wajib? |
|---|---|---|---|
| 0 | Prasyarat | 10 mnt | ✅ |
| 1 | Ambil API key Gemini (gratis) | 5 mnt | ✅ |
| 2 | Setup database Supabase (gratis) | 10 mnt | ✅ |
| 3 | Jalankan di komputer + uji fitur | 15 mnt | ✅ |
| 4 | Push ke GitHub | 5 mnt | ✅ |
| 5 | Deploy ke Vercel (link publik) | 10 mnt | ✅ (nilai tambah) |
| 6 | Uji versi online dari HP | 5 mnt | ✅ |
| 7 | Pilot dengan UMKM sungguhan | 1–2 hari | ⭐ Opsional, nilai tambah besar |
| 8 | Isi Project Brief (template Dicoding) | 20 mnt | ✅ |
| 9 | Rekam video demo 60–90 detik | 30 mnt | ⭐ Sangat disarankan |
| 10 | Submit di halaman challenge | 5 mnt | ✅ |

---

## Langkah 0 — Prasyarat

Pastikan hal-hal berikut sudah siap:

1. **Node.js versi 18 atau lebih baru.** Cek dengan `node -v` di terminal. Kalau belum ada, unduh dari https://nodejs.org (pilih LTS).
2. **Akun GitHub** (gratis) — https://github.com
3. **Akun Google** — untuk Gemini API dan (bisa juga) login Supabase/Vercel.
4. **Browser Google Chrome** — fitur input suara (Web Speech API) paling stabil di Chrome/Edge.
5. **Terdaftar sebagai peserta IDCamp 2026** — syarat wajib challenge. Kalau belum, daftar dulu di situs IDCamp.
6. Ekstrak file `larismanis.zip` ke folder kerja Anda, lalu buka terminal di dalam folder `larismanis/`.

---

## Langkah 1 — Ambil API Key Gemini (gratis, 5 menit)

1. Buka **https://aistudio.google.com/apikey** dan login dengan akun Google.
2. Klik **"Create API key"** → pilih/buat project → salin key yang muncul (formatnya `AIza...`).
3. Simpan sementara di notepad. **Jangan pernah membagikan key ini atau meng-commit-nya ke GitHub.**

Catatan kuota gratis: model bawaan aplikasi adalah `gemini-3.5-flash`. Kuota gratisnya dibatasi per menit dan per hari — lebih dari cukup untuk pengembangan dan demo penjurian. Kalau saat demo intensif kena limit per menit, tunggu ±60 detik (aplikasi sudah menampilkan pesan ramah otomatis). Jika ingin kuota harian lebih longgar, ganti model di `.env` menjadi `VITE_GEMINI_MODEL=gemini-3.1-flash-lite`.

---

## Langkah 2 — Setup Database Supabase (gratis, 10 menit)

Supabase adalah database cloud yang membuat aplikasi memenuhi **nilai tambah "data real-time, bukan dummy/local storage"** dari juri.

1. Buka **https://supabase.com** → **Start your project** → login (bisa pakai GitHub).
2. Klik **New project**:
   - Name: `larismanis`
   - Database password: buat dan **simpan** (tidak dipakai aplikasi, tapi jangan hilang)
   - Region: **Southeast Asia (Singapore)** — paling dekat, paling cepat untuk Indonesia
   - Klik **Create new project**, tunggu ±2 menit sampai selesai dibuat.
3. Buat tabel: buka menu **SQL Editor** (ikon terminal di sidebar) → **New query** → buka file **`supabase_setup.sql`** dari folder project ini, salin **seluruh isinya**, tempel, lalu klik **Run**. Harus muncul "Success". Cek di menu **Table Editor**: ada tabel `stores` dan `transactions`.
4. Ambil kunci koneksi: buka **Project Settings** (ikon gerigi) → **API**:
   - Salin **Project URL** (contoh: `https://abcdxyz.supabase.co`)
   - Salin **anon public** key (deretan panjang mulai `eyJ...`) — yang *anon*, **bukan** service_role!

---

## Langkah 3 — Jalankan di Komputer + Uji Fitur (15 menit)

1. Di terminal, dari dalam folder project:

   ```bash
   cp .env.example .env
   ```

   (Windows Command Prompt: `copy .env.example .env`)

2. Buka file `.env` dengan editor teks, isi tiga baris ini dengan nilai dari Langkah 1–2:

   ```
   VITE_SUPABASE_URL=https://abcdxyz.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...(anon key Anda)
   VITE_GEMINI_API_KEY=AIza...(key Gemini Anda)
   ```

3. Install dan jalankan:

   ```bash
   npm install
   npm run dev
   ```

4. Buka **http://localhost:5173** di Chrome.

### ✅ Checklist Uji Fitur (lakukan berurutan)

1. **Onboarding**: pilih "Warung baru" → isi nama (mis. *Warung Bu Sari*), jenis usaha, dan info penting → klik buat → **catat Kode Warung** yang muncul → masuk.
2. **Catat via ketik**: di tab Bang Laris ketik `laku 5 nasi goreng 15rb an sama 3 es teh goceng` → harus muncul balasan konfirmasi + **2 Nota Digital** (Rp75.000 dan Rp15.000).
3. **Catat via suara**: klik tombol **mic kuning** → izinkan mikrofon → ucapkan *"beli gas dua puluh dua ribu"* → teks masuk ke kolom → kirim → nota pengeluaran merah muncul.
4. **Tanya bisnis**: ketik `untung berapa hari ini?` → jawaban harus menyebut angka yang cocok dengan catatan barusan (Rp90.000 − Rp22.000 = Rp68.000).
5. **Buku Kas**: buka tab Buku Kas → kartu Masuk/Keluar/Laba terisi, grafik ada batangnya, nota tampil. Klik **"Minta analisis sekarang"** → muncul headline + 3 temuan + 3 saran.
6. **Studio**: buka tab Studio → upload foto produk apa pun (foto makanan dari galeri juga boleh) → klik **Buatkan paket konten** → muncul 4 kartu (Instagram, Marketplace, WhatsApp, English) + hashtag → tombol **Salin** berfungsi.
7. **Balas**: tab Balas → klik salah satu contoh chip → **Buatkan draf balasan** → muncul 2 opsi → Salin berfungsi.
8. **Real-time lintas perangkat** (bukti "bukan local storage"): buka jendela **Incognito** → masuk dengan **Kode Warung** yang sama → semua catatan ikut muncul. 🎉
9. **Hapus**: di Buku Kas, klik `×` pada satu nota → terhapus.

Kalau semua tercentang, aplikasi Anda sehat 100%. Lanjut deploy.

---

## Langkah 4 — Push ke GitHub (5 menit)

1. Buat repository baru di https://github.com/new — nama: `larismanis`, visibility bebas (Public memudahkan juri melihat kode).
2. Dari folder project, jalankan (ganti `USERNAME` dengan milik Anda):

   ```bash
   git init
   git add .
   git commit -m "LarisManis - Asisten AI Juragan UMKM (IDCamp Challenge #2)"
   git branch -M main
   git remote add origin https://github.com/USERNAME/larismanis.git
   git push -u origin main
   ```

3. **Verifikasi keamanan**: buka repo di browser → pastikan file `.env` **TIDAK ADA** di sana (file `.gitignore` sudah mengaturnya — `.env.example` boleh ada karena hanya template kosong).

---

## Langkah 5 — Deploy ke Vercel (10 menit) → dapat link publik

1. Buka **https://vercel.com** → login **dengan GitHub**.
2. **Add New… → Project** → pilih repo `larismanis` → **Import**.
3. Framework otomatis terdeteksi **Vite** (biarkan default build `npm run build`, output `dist`).
4. Buka bagian **Environment Variables**, tambahkan **TIGA** variabel ini:

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | (URL Supabase Anda) |
   | `VITE_SUPABASE_ANON_KEY` | (anon key Anda) |
   | `GEMINI_API_KEY` | (API key Gemini Anda) |

   ⚠️ **PENTING — bagian keamanan yang membedakan Anda dari peserta lain:** di Vercel gunakan `GEMINI_API_KEY` (tanpa awalan `VITE_`) dan **JANGAN** menambahkan `VITE_GEMINI_API_KEY`. Dengan begitu key Gemini tersimpan di server dan dipanggil lewat proxy aman `/api/gemini` yang sudah dibuatkan — tidak bisa dicuri orang lewat DevTools browser. (Anon key Supabase memang dirancang untuk sisi browser, jadi aman memakai `VITE_`.)

5. Klik **Deploy**, tunggu ±1 menit → dapat URL seperti `https://larismanis.vercel.app`.
6. (Opsional) Rapikan nama: **Settings → Domains** untuk mengganti subdomain.

---

## Langkah 6 — Uji Versi Online dari HP (5 menit)

1. Buka URL Vercel dari **HP Android dengan Chrome** (juri kemungkinan besar menguji dari HP; aplikasi ini memang dirancang mobile-first).
2. Masuk dengan **Kode Warung** yang sama seperti di komputer → data harus langsung muncul (bukti real-time lintas perangkat).
3. Uji tombol **mic** di HP — di Vercel sudah HTTPS sehingga izin mikrofon berfungsi (mic memang hanya jalan di HTTPS/localhost).
4. Uji **Studio** dengan memotret produk langsung dari kamera HP.
5. Ulangi cepat checklist Langkah 3 poin 2–7.

---

## Langkah 7 — ⭐ Pilot dengan UMKM Sungguhan (opsional, nilai tambah besar)

Deskripsi challenge menyebut kolaborasi dengan UMKM riil sebagai **nilai tambah**. Cara termudah dan cepat:

1. Pilih 1–2 UMKM terdekat (warung tetangga, teman yang jualan online, kantin, penjual keripik).
2. Minta mereka memakai LarisManis selama 1–3 hari untuk mencatat penjualan asli (cukup lewat HP mereka, buat Kode Warung sendiri).
3. Dokumentasikan: (a) foto pemilik sedang memakai aplikasi, (b) screenshot Buku Kas berisi data asli mereka, (c) 1–2 kalimat testimoni, contoh format: *"Biasanya saya lupa nyatet. Sekarang tinggal ngomong pas lagi masak."* — Bu Sari, Warung Makan, Yogyakarta.
4. Masukkan bukti ini ke Project Brief (Langkah 8) di bagian "Validasi Pengguna". Ini memperkuat kriteria **Manfaat untuk Masyarakat (25%)** secara nyata, bukan klaim.

---

## Langkah 8 — Isi Project Brief Dicoding (20 menit)

1. Di halaman challenge (https://www.dicoding.com/challenges/973), klik tautan **template Project Brief** yang disediakan → **File → Make a copy** ke Google Drive Anda.
2. Buka file **`PROJECT_BRIEF.md`** di folder project ini — **semua jawaban sudah disiapkan** per bagian. Salin-tempel ke bagian yang sesuai di template, lalu sesuaikan bagian yang bertanda `[ISI: ...]` (nama Anda, link, dsb.).
3. Tambahkan screenshot aplikasi (ambil dari HP: onboarding, chat dengan nota, Buku Kas + analisis, Studio hasil 4 konten).
4. **Set sharing** dokumen: klik Share → *Anyone with the link* → **Viewer**. Uji buka link dari mode incognito untuk memastikan bisa diakses reviewer.

---

## Langkah 9 — ⭐ Video Demo 60–90 detik (sangat disarankan)

Juri menilai puluhan submission; video singkat membuat karya Anda "hidup". Rekam layar HP (atau HP dipegang) dengan skrip ini:

1. **0–10 dtk** — Masalah: "64 juta UMKM, tapi pencatatan masih manual dan pemasaran susah. Solusi yang ada terlalu ribet."
2. **10–30 dtk** — Pukulan utama: tekan mic, ucapkan *"laku 5 nasi goreng lima belas ribuan sama 3 es teh goceng"* → tunjukkan nota muncul otomatis. Lalu ketik *"untung berapa hari ini?"* → tunjukkan jawabannya pakai data asli.
3. **30–50 dtk** — Studio: foto produk → tunjukkan 4 konten + English ekspor muncul sekaligus → tekan Salin.
4. **50–70 dtk** — Buku Kas: grafik + "Minta analisis" → sorot 3 saran konkret.
5. **70–90 dtk** — Tutup: "LarisManis. Ngomong doang, beres. Data real-time di cloud, gratis, bahasa warung." + tampilkan URL.

Upload ke YouTube (unlisted boleh) atau Google Drive, cantumkan link-nya di Project Brief.

---

## Langkah 10 — Submit! (5 menit)

Di halaman challenge, klik tombol **Submit** lalu isi:

1. **Nama Aplikasi**: `LarisManis — Asisten AI Juragan UMKM`
2. **Link Aplikasi**: URL Vercel Anda (mis. `https://larismanis.vercel.app`). Cantumkan juga link GitHub di Project Brief.
3. **Link Project Brief**: link Google Docs dari Langkah 8 (pastikan *Anyone with the link*).
4. Submit sebelum **22 Juli 2026**. Jangan mepet — submit H-2 lebih aman.

### 💡 Untuk sesi demo/penjurian

Sebelum juri menguji, isi warung demo dengan **15–25 transaksi bervariasi selama beberapa hari** (jual beberapa produk berbeda + beberapa pengeluaran) supaya grafik dan Analisis Bang Laris tampil meyakinkan. Siapkan juga 2–3 foto produk bagus di galeri HP.

---

## Cek Terakhir vs Kriteria Penilaian

1. **Kesesuaian Tema (30%)** — AI generatif adalah inti (bukan tempelan): intent parsing bahasa warung, vision konten, narasi analitik, draf balasan. Semuanya langsung menjawab pain point yang tertulis di deskripsi challenge (pencatatan manual, konten promosi, respons pelanggan, bahasa ekspor). ✅
2. **Manfaat Masyarakat (25%)** — target 64 juta UMKM; gratis; bahasa Indonesia; jalan di HP murah; + bukti pilot riil kalau Langkah 7 dikerjakan. ✅
3. **Desain & Kemudahan (25%)** — onboarding 30 detik tanpa email, antarmuka chat yang familiar, mobile-first, identitas visual "Spanduk Warung" yang khas. ✅
4. **Inovasi (20%)** — Voice-to-Ledger bahasa warung + Nota Digital + asisten menyatu (bukan sekadar caption generator). ✅
5. **Nilai tambah** — link publik Vercel ✅ + data real-time Supabase lintas perangkat ✅.
6. **Orisinalitas** — karya baru, belum pernah menang di tempat lain. ✅

---

## Troubleshooting

1. **"Satu langkah lagi ⚙️" muncul terus** → `.env` belum terisi benar / server dev belum di-restart setelah mengubah `.env`. Matikan (`Ctrl+C`) lalu `npm run dev` lagi.
2. **Error saat buat warung / "Database error"** → SQL di Langkah 2.3 belum dijalankan, atau URL/anon key salah salin. Jalankan ulang seluruh `supabase_setup.sql` (aman diulang).
3. **"Bang Laris lagi ramai pelanggan"** → limit per menit Gemini free tier. Tunggu ±60 detik. Untuk kuota harian lebih besar: `VITE_GEMINI_MODEL=gemini-3.1-flash-lite` di `.env` (di Vercel tidak perlu diubah, kecuali Anda menambah env `VITE_GEMINI_MODEL`).
4. **Tombol mic abu-abu / tidak merespons** → pakai Chrome/Edge; pastikan lewat `localhost` atau HTTPS (Vercel); cek izin mikrofon di ikon gembok address bar. Di Firefox/beberapa browser, Web Speech belum didukung — pencatatan tetap bisa lewat ketik.
5. **AI menjawab tapi transaksi tidak tercatat** → itu perilaku benar bila kalimat tidak mengandung angka harga (AI dilarang mengarang); Bang Laris akan balik bertanya harganya.
6. **Deploy Vercel sukses tapi AI gagal di produksi** → env `GEMINI_API_KEY` belum ditambahkan / typo. Tambahkan di Settings → Environment Variables lalu **Redeploy**.
7. **Foto gagal diproses** → pastikan file gambar (JPG/PNG/WEBP). Foto dikompres otomatis ke ±1024px sebelum dikirim.

---

## Catatan Keamanan (jujur, untuk Anda & untuk brief)

Model akses MVP memakai **Kode Warung** (siapa yang tahu kode = pemilik data) agar onboarding UMKM tanpa hambatan — trade-off yang disadari dan sudah dicantumkan sebagai roadmap: Supabase Auth + PIN per warung. API key Gemini di produksi sudah aman di server via proxy. Menyebut trade-off + rencana perbaikan seperti ini justru menunjukkan kematangan engineering di mata juri.

Semoga juara, Juragan! 🏆
