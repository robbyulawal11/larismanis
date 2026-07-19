// ============================================================
// Kumpulan utilitas kecil LarisManis.
// ============================================================

/** Format angka menjadi "Rp12.500" */
export function rupiah(n) {
  const num = Number(n) || 0;
  return 'Rp' + Math.round(num).toLocaleString('id-ID');
}

/** Kunci tanggal lokal "YYYY-MM-DD" (bukan UTC) agar "hari ini" akurat di Indonesia */
export function dateKey(d) {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** "Sel, 14 Jul 13:05" */
export function fmtDateTime(iso) {
  const d = new Date(iso);
  return `${DAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** "14 Jul" */
export function fmtDateShort(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}

/** ID unik sederhana untuk key React */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Salin teks ke clipboard, dengan fallback untuk browser lama */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch (e) {
      return false;
    }
  }
}

/**
 * Kompres foto produk di browser sebelum dikirim ke AI.
 * Hasil: JPEG maksimal 1024px sisi terpanjang (~100-300 KB).
 */
export function compressImage(file, maxSide = 1024, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file foto.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('File bukan gambar yang valid.'));
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, maxSide / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = dataUrl.split(',')[1];
        resolve({ dataUrl, base64, mimeType: 'image/jpeg' });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Hitung ringkasan usaha dari daftar transaksi.
 * Dipakai untuk kartu Buku Kas, grafik, dan konteks yang dikirim ke AI.
 */
export function computeSummary(transactions) {
  const now = new Date();
  const todayK = dateKey(now);

  const dayMs = 24 * 60 * 60 * 1000;
  const weekAgo = new Date(now.getTime() - 6 * dayMs);
  const monthAgo = new Date(now.getTime() - 29 * dayMs);

  const zero = () => ({ in: 0, out: 0, count: 0 });
  const today = zero();
  const week = zero();
  const month = zero();

  const itemMap = new Map(); // penjualan per produk
  const expenseMap = new Map(); // pengeluaran per keperluan
  const byDay = new Map(); // "YYYY-MM-DD" -> {in, out}

  for (const t of transactions) {
    const d = new Date(t.created_at);
    const k = dateKey(d);
    const total = Number(t.total) || 0;
    const isIn = t.type === 'in';

    if (!byDay.has(k)) byDay.set(k, { in: 0, out: 0 });
    byDay.get(k)[isIn ? 'in' : 'out'] += total;

    const bump = (obj) => {
      obj[isIn ? 'in' : 'out'] += total;
      obj.count += 1;
    };
    if (k === todayK) bump(today);
    if (d >= new Date(dateKey(weekAgo) + 'T00:00:00')) bump(week);
    if (d >= new Date(dateKey(monthAgo) + 'T00:00:00')) bump(month);

    if (isIn) {
      const key = (t.item || 'Lainnya').trim().toLowerCase();
      if (!itemMap.has(key)) itemMap.set(key, { name: t.item, qty: 0, revenue: 0 });
      const it = itemMap.get(key);
      it.qty += Number(t.qty) || 0;
      it.revenue += total;
    } else {
      const key = (t.item || 'Lainnya').trim().toLowerCase();
      if (!expenseMap.has(key)) expenseMap.set(key, { name: t.item, total: 0 });
      expenseMap.get(key).total += total;
    }
  }

  const topItems = [...itemMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const topExpenses = [...expenseMap.values()].sort((a, b) => b.total - a.total).slice(0, 5);

  // 7 hari terakhir untuk grafik (urut lama -> baru)
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * dayMs);
    const k = dateKey(d);
    const v = byDay.get(k) || { in: 0, out: 0 };
    last7.push({ key: k, label: DAY_SHORT[d.getDay()], in: v.in, out: v.out });
  }

  return { today, week, month, topItems, topExpenses, last7, totalCount: transactions.length };
}

/**
 * Ubah ringkasan menjadi teks padat berbahasa Indonesia — inilah
 * "data real-time" yang disuntikkan ke setiap percakapan AI sehingga
 * Bang Laris menjawab berdasarkan angka usaha yang sebenarnya.
 */
export function summaryForAI(store, s, recent) {
  const line = (label, o) =>
    `${label}: pemasukan ${rupiah(o.in)}, pengeluaran ${rupiah(o.out)}, laba ${rupiah(o.in - o.out)} (${o.count} catatan)`;

  const tops =
    s.topItems.length > 0
      ? s.topItems.map((t, i) => `${i + 1}. ${t.name} (terjual ${t.qty}, omzet ${rupiah(t.revenue)})`).join('; ')
      : 'belum ada data penjualan';

  const exps =
    s.topExpenses.length > 0
      ? s.topExpenses.map((t, i) => `${i + 1}. ${t.name} (${rupiah(t.total)})`).join('; ')
      : 'belum ada data pengeluaran';

  const recentLines =
    recent && recent.length > 0
      ? recent
          .slice(0, 10)
          .map(
            (t) =>
              `${fmtDateShort(t.created_at)} | ${t.type === 'in' ? 'MASUK' : 'KELUAR'} | ${t.item} x${t.qty} = ${rupiah(t.total)}`
          )
          .join('\n')
      : '(belum ada)';

  return [
    `Nama usaha: ${store.name} (jenis: ${store.business_type || 'Lainnya'})`,
    line('Hari ini', s.today),
    line('7 hari terakhir', s.week),
    line('30 hari terakhir', s.month),
    `Produk terlaris 30 hari: ${tops}`,
    `Pengeluaran terbesar 30 hari: ${exps}`,
    `10 transaksi terakhir:\n${recentLines}`,
  ].join('\n');
}

/** Generator kode warung 6 karakter (tanpa huruf/angka ambigu O,0,I,1,L) */
export function generateStoreCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
