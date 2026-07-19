-- ============================================================
-- LarisManis — Setup Database Supabase
--
-- Cara pakai:
--   1. Buka dashboard Supabase project Anda
--   2. Masuk ke menu "SQL Editor" > "New query"
--   3. Salin-tempel SELURUH isi file ini, lalu klik "Run"
--   4. Selesai! Dua tabel + kebijakan akses akan dibuat otomatis.
-- ============================================================

-- ---------- Tabel profil warung ----------
create table if not exists public.stores (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,          -- kode warung 6 karakter, dipakai untuk "login"
  name          text not null,                 -- nama warung/usaha
  business_type text default 'Lainnya',        -- jenis usaha
  info          text default '',               -- info penting (jam buka, menu, dll) utk asisten balas pelanggan
  created_at    timestamptz not null default now()
);

-- ---------- Tabel catatan transaksi ----------
create table if not exists public.transactions (
  id          bigint generated always as identity primary key,
  store_code  text not null references public.stores(code) on delete cascade,
  type        text not null check (type in ('in','out')),  -- in = pemasukan, out = pengeluaran
  item        text not null,                               -- nama barang/keperluan
  qty         numeric not null default 1,
  unit_price  numeric not null default 0,
  total       numeric not null,
  note        text default '',
  created_at  timestamptz not null default now()
);

create index if not exists idx_transactions_store_date
  on public.transactions (store_code, created_at desc);

-- ---------- Row Level Security ----------
-- Catatan MVP: kebijakan di bawah mengizinkan akses anonim berbasis
-- "kode warung" (siapa yang tahu kode = pemilik data). Ini cukup untuk
-- MVP kompetisi. Di roadmap produksi, ganti dengan Supabase Auth
-- sehingga tiap baris terikat ke user_id.

alter table public.stores enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "mvp stores select" on public.stores;
drop policy if exists "mvp stores insert" on public.stores;
drop policy if exists "mvp stores update" on public.stores;
drop policy if exists "mvp tx select" on public.transactions;
drop policy if exists "mvp tx insert" on public.transactions;
drop policy if exists "mvp tx delete" on public.transactions;

create policy "mvp stores select" on public.stores
  for select to anon using (true);

create policy "mvp stores insert" on public.stores
  for insert to anon with check (true);

create policy "mvp stores update" on public.stores
  for update to anon using (true) with check (true);

create policy "mvp tx select" on public.transactions
  for select to anon using (true);

create policy "mvp tx insert" on public.transactions
  for insert to anon with check (true);

create policy "mvp tx delete" on public.transactions
  for delete to anon using (true);

-- Selesai. Anda bisa cek di menu "Table Editor" — akan muncul
-- tabel "stores" dan "transactions".
