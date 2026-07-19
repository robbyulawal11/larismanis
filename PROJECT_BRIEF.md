# 📄 DRAFT PROJECT BRIEF — LarisManis

> Salin-tempel isi tiap bagian di bawah ke **template Project Brief resmi Dicoding** (Google Docs). Bagian bertanda `[ISI: ...]` wajib Anda lengkapi sendiri. Struktur di bawah mengikuti pola umum template brief Dicoding — bila judul bagian di template sedikit berbeda, cocokkan saja isinya.

---

## 1. Informasi Umum

**Nama Aplikasi:** LarisManis — Asisten AI Juragan UMKM

**Tagline:** *"Ngomong doang, beres."* Catat jualan pakai suara, bikin konten dari foto, pahami untung-rugi — satu asisten AI berbahasa warung.

**Nama Peserta / Tim:** `[ISI: nama lengkap sesuai akun Dicoding/IDCamp; jika tim, maks. 3 orang]`

**Email / Username Dicoding:** `[ISI]`

**Link Aplikasi (publik):** `[ISI: https://larismanis.vercel.app — sesuaikan URL Vercel Anda]`

**Link Repository:** `[ISI: https://github.com/USERNAME/larismanis]`

**Link Video Demo (60–90 dtk):** `[ISI: link YouTube/Drive — sangat disarankan]`

---

## 2. Latar Belakang Masalah

Indonesia memiliki lebih dari 64 juta pelaku UMKM yang menyumbang sekitar 60% PDB nasional, namun baru sekitar 12% yang benar-benar memanfaatkan platform digital. Riset yang dikutip penyelenggara juga menunjukkan 44% pelaku usaha belum memahami cara beriklan secara digital.

Di lapangan, hambatannya sangat konkret dan berulang:

1. **Pencatatan keuangan masih manual** (buku tulis / ingatan), sehingga pemilik tidak pernah tahu pasti untung-ruginya — padahal catatan adalah syarat naik kelas (mis. pengajuan modal).
2. **Membuat konten promosi terasa sulit dan mahal**: satu produk butuh caption Instagram, deskripsi marketplace, dan pesan broadcast yang berbeda-beda.
3. **Membalas chat pelanggan menyita waktu** di sela memasak/melayani, dan balasan yang lambat berarti penjualan hilang.
4. **Kendala bahasa menutup peluang ekspor**: menulis deskripsi produk dalam bahasa Inggris adalah tembok bagi mayoritas pelaku.

Akar masalahnya bukan kemauan, melainkan **kecocokan alat**: aplikasi kasir dan pembukuan yang ada dirancang seperti perangkat akuntan — penuh form, menu, dan istilah teknis. Padahal ada satu keterampilan digital yang sudah dikuasai hampir semua juragan Indonesia: **mengobrol lewat chat**.

## 3. Solusi yang Diusulkan

**LarisManis** adalah asisten AI berbentuk chat (teks + suara) bernama **"Bang Laris"** yang mengubah kebiasaan mengobrol menjadi digitalisasi usaha. Pengguna tidak perlu belajar aplikasi baru — cukup berbicara atau mengetik seperti ke teman:

- Ucapkan *"laku 5 nasgor 15rb-an sama 3 es teh goceng"* → AI memahami bahasa sehari-hari warung (termasuk "goceng", "ceban", "nasgor", "@12rb") → transaksi otomatis tercatat ke database cloud → muncul **Nota Digital** sebagai konfirmasi visual.
- Tanya *"untung berapa minggu ini?"* → AI menjawab dari **data transaksi asli milik pengguna secara real-time**, bukan jawaban generik.
- Unggah **satu foto produk** → AI Vision menghasilkan **empat konten sekaligus**: caption Instagram, judul + deskripsi marketplace, pesan broadcast WhatsApp, dan deskripsi **bahasa Inggris siap ekspor**, plus 8 hashtag.
- Buka **Buku Kas** → ringkasan masuk/keluar/laba, grafik 7 hari, dan tombol **analisis AI** yang menerjemahkan angka menjadi cerita sederhana + 3 saran konkret yang murah dan bisa dikerjakan minggu ini (tanpa jargon akuntansi).
- Tempel **chat pelanggan** → AI menyusun 2 draf balasan ramah berbasis info usaha yang diisi pemilik — AI dilarang mengarang harga/stok.

## 4. Fitur Utama (MVP)

1. **Chat Bang Laris (Voice-to-Ledger)** — pencatatan pemasukan/pengeluaran lewat ketikan atau **suara berbahasa Indonesia**; satu kalimat bisa berisi beberapa transaksi sekaligus; sekaligus menjadi tempat bertanya apa pun tentang kondisi usaha.
2. **Studio Konten (1 Foto → 4 Konten)** — dari foto produk + nama/harga opsional, dengan pilihan gaya bahasa (santai/profesional/lucu).
3. **Buku Kas Pintar** — ringkasan hari/7 hari/30 hari, grafik batang pemasukan vs pengeluaran, daftar Nota Digital (bisa hapus), input manual sebagai cadangan, dan **Analisis Bang Laris** (headline + 3 temuan + 3 langkah aksi).
4. **Balas Pelanggan** — 2 opsi draf balasan (singkat-ramah & lengkap-menjual) siap salin ke WhatsApp/Instagram/marketplace.
5. **Kode Warung** — onboarding <30 detik tanpa email/kata sandi; data tersinkron real-time antar perangkat dengan satu kode.

## 5. Keunikan / Inovasi

1. **Voice-to-Ledger berbahasa warung** — bukan sekadar speech-to-text, melainkan pemahaman semantik istilah pasar Indonesia (goceng, ceban, 15rb-an, harga satuan "@"), diubah menjadi data terstruktur yang tervalidasi. Sepengetahuan kami belum ada aplikasi pembukuan UMKM gratis yang menjadikan suara-bahasa-santai sebagai pintu masuk utama.
2. **Satu asisten, bukan lima aplikasi** — pencatatan, analitik, produksi konten, dan layanan pelanggan menyatu dalam satu antarmuka chat yang sudah dikuasai pengguna, memangkas kurva belajar ke hampir nol.
3. **AI yang membumi berdasarkan data nyata** — analisis dan jawaban dihasilkan dari transaksi asli pengguna (real-time dari cloud), dengan prompt yang secara eksplisit melarang jargon dan mengharuskan saran murah-praktis.
4. **Nota Digital** — metafora struk warung yang familiar sebagai konfirmasi visual setiap pencatatan, membangun kepercayaan pengguna non-teknis terhadap "apa yang barusan dicatat AI".
5. **Gerbang ekspor instan** — setiap foto produk otomatis mendapatkan deskripsi bahasa Inggris, menjawab langsung hambatan bahasa yang disebut dalam deskripsi challenge.

## 6. Penerapan Generative AI (inti, bukan tempelan)

Model: **Google Gemini 2.5 Flash** (multimodal), dipanggil dalam **JSON mode** (`responseMimeType: application/json`) agar keluaran selalu terstruktur dan aman dirender UI. Empat penerapan:

1. **Intent parsing & ekstraksi transaksi** — sistem prompt mengajarkan AI membaca kalimat pasar Indonesia dan mengembalikan `{intent, transactions[], reply}`; dilengkapi aturan anti-halusinasi (dilarang menebak harga yang tidak disebut; harus bertanya balik).
2. **Vision-to-marketing** — satu panggilan multimodal (gambar + brief) menghasilkan 4 format konten + hashtag dalam satu objek JSON.
3. **Analitik naratif** — ringkasan statistik dihitung aplikasi dari data Supabase, lalu AI mengubahnya menjadi headline, temuan, dan rencana aksi berbahasa manusia.
4. **Draf komunikasi pelanggan** — grounding pada "info usaha" milik pemilik agar balasan akurat dan tidak mengarang.

Seluruh percakapan juga disuntik **konteks data real-time** (ringkasan omzet, produk terlaris, transaksi terakhir) sehingga AI menjawab spesifik untuk usaha tersebut.

## 7. Arsitektur & Teknologi

- **Frontend:** React 18 + Vite, CSS custom mobile-first (design system "Spanduk Warung": hijau daun pisang, kuning spanduk, kartu nota krem; font Baloo 2 + Plus Jakarta Sans). Dependensi runtime hanya `react` + `react-dom` → ringan untuk HP spesifikasi rendah dan jaringan lambat.
- **Suara:** Web Speech API (`id-ID`) — di sisi peramban, gratis, tanpa server tambahan; tersedia fallback ketik penuh.
- **Database (real-time, bukan dummy):** **Supabase** (PostgreSQL) melalui REST PostgREST dengan Row Level Security; tabel `stores` dan `transactions`; data yang sama dapat dibuka dari perangkat mana pun via Kode Warung.
- **Keamanan kunci AI:** pada produksi (Vercel), API key Gemini disimpan **di server** dan seluruh panggilan AI melewati proxy **Vercel Serverless Function** (`/api/gemini`) dengan whitelist model — key tidak pernah terekspos di browser.
- **Deployment:** Vercel (HTTPS — juga syarat agar mikrofon berfungsi di perangkat pengguna).

**Alur data:** Suara/teks → (opsional Web Speech) → Gemini JSON mode → validasi & sanitasi di aplikasi → Supabase → ringkasan statistik → konteks untuk jawaban/analisis AI berikutnya.

## 8. Manfaat untuk Masyarakat

1. **Inklusif:** dirancang untuk pengguna non-teknis — tanpa email, tanpa istilah akuntansi, berbahasa Indonesia sehari-hari; berjalan di browser HP apa pun tanpa instalasi.
2. **Ekonomis:** gratis dipakai (memanfaatkan free tier Gemini & Supabase); menggantikan kebutuhan menyewa admin sosial media/penulis konten bagi usaha mikro.
3. **Naik kelas:** catatan keuangan yang rapi adalah fondasi akses permodalan; wawasan produk terlaris membantu keputusan stok; konten English membuka pasar ekspor.
4. **Skalabel:** arsitektur serverless + database cloud siap melayani banyak pengguna tanpa perubahan.

**Validasi pengguna:** `[ISI jika mengerjakan pilot — contoh: "Diuji 3 hari oleh Warung Makan Bu Sari (Sleman) dengan 27 transaksi asli. Testimoni: '…'. Screenshot terlampir." Jika belum, hapus bagian ini]`

## 9. Cara Mencoba Aplikasi (untuk Reviewer)

1. Buka `[ISI: URL Vercel]` dari HP atau desktop (Chrome disarankan untuk fitur suara).
2. Pilih **"Warung baru"** → isi nama usaha apa pun → simpan **Kode Warung** yang muncul.
3. Di tab **Bang Laris**, coba ketik atau ucapkan lewat tombol mic: *"laku 5 nasi goreng 15rb an sama 3 es teh goceng"* → perhatikan Nota Digital muncul.
4. Ketik: *"untung berapa hari ini?"* → jawaban memakai data yang baru dicatat.
5. Tab **Studio**: unggah foto produk apa pun → **Buatkan paket konten**.
6. Tab **Buku Kas**: lihat ringkasan & grafik → klik **Minta analisis sekarang**.
7. Tab **Balas**: klik contoh pesan pelanggan → **Buatkan draf balasan**.
8. *(Bukti real-time)* Buka jendela incognito / HP lain → masuk dengan Kode Warung yang sama → data identik muncul.

Alternatif cepat: gunakan warung demo berisi data contoh — Kode Warung: `[ISI: kode warung demo yang sudah Anda isi 15–25 transaksi]`.

## 10. Keterbatasan MVP & Roadmap

**Disadari pada MVP:** akses berbasis Kode Warung (tanpa kata sandi) dipilih demi onboarding tanpa hambatan — cocok untuk fase validasi, dengan kebijakan RLS permisif.

**Roadmap:** (1) Supabase Auth + PIN per warung; (2) integrasi WhatsApp Business API agar pencatatan terjadi langsung dari chat WA asli; (3) mode offline dengan antrean sinkronisasi untuk daerah sinyal lemah; (4) dukungan bahasa daerah (Jawa, Sunda); (5) ekspor laporan PDF untuk pengajuan KUR; (6) deteksi stok & pengingat belanja bahan.

## 11. Penutup

LarisManis tidak meminta 64 juta juragan Indonesia belajar teknologi baru — ia membawa teknologi menemui mereka di tempat yang paling akrab: sebuah percakapan. *Ngomong doang, beres.*
