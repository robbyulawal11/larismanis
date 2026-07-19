// ============================================================
// Proxy Gemini API untuk produksi (Vercel Serverless Function).
//
// Kenapa perlu proxy? Kalau API key ditaruh di kode frontend
// (VITE_GEMINI_API_KEY), siapa pun bisa melihatnya lewat DevTools
// dan menghabiskan kuota Anda. Dengan proxy ini, key disimpan di
// environment variable server Vercel bernama GEMINI_API_KEY dan
// tidak pernah dikirim ke browser.
//
// Endpoint : POST /api/gemini
// Body     : { model: "gemini-3.5-flash", body: { ...payload Gemini } }
// ============================================================

const ALLOWED_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview',
  // Model 2.5 sudah ditutup untuk pengguna API baru (Juli 2026),
  // dibiarkan di sini hanya untuk key lama yang masih punya akses.
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Gunakan POST.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error:
        'GEMINI_API_KEY belum diatur di environment variables Vercel. ' +
        'Buka Project Settings > Environment Variables, tambahkan GEMINI_API_KEY, lalu redeploy.',
    });
    return;
  }

  try {
    const { model, body } = req.body || {};
    const chosenModel = ALLOWED_MODELS.includes(model) ? model : 'gemini-3.5-flash';

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${chosenModel}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body || {}),
      }
    );

    const data = await upstream.json().catch(() => ({}));
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghubungi Gemini: ' + (err && err.message ? err.message : 'unknown') });
  }
}
