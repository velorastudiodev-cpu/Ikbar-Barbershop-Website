# Dinasti Barbershop — Website

Website publik Dinasti Barbershop (sebelumnya Ikbar Barbershop) oleh Velora Studio Dev: profil, barber, galeri, menu harga, booking kursi via WhatsApp, lokasi, dan jam buka.

Repositori ini hanya memuat frontend. Dashboard pengelolaan (CMS) berada di repositori privat terpisah dan tetap terhubung lewat Supabase.

## Menjalankan

```bash
npm ci
npm run dev        # pengembangan
npm run build      # build produksi + prerender ke dist/
npm test           # tes logika jam buka, nama merek, dan kontrak CMS
```

Tes browser end-to-end: jalankan `npx vite preview --port 5200` setelah build, lalu `node tests/site.test.cjs` (butuh Playwright).

## Koneksi CMS

Salin `.env.example` menjadi `.env.local` dan isi URL serta kunci anon/publishable Supabase. Variabel `VITE_` dapat dibaca publik: jangan gunakan service-role key. Akses database harus dibatasi melalui RLS.

Website membaca tabel yang sama seperti sebelumnya, sehingga dashboard tidak perlu diubah:

| Tabel / bagian | Kolom |
|---|---|
| `gallery_items` | `src`, `type` (image/video), `alt`, `title`, `description`, `category` (Foto/Video), `sort_order` |
| `services` | `name`, `desc`, `price`, `category` (utama/tambahan), `highlight`, `sort_order` |
| `site_content` → `lokasi` | `address`, `maps_url`, `hours_data` [{ `hari`, `jam`, `tutup` }] |
| `site_content` → `kontak` | `wa_number`, `instagram` |
| `site_content` → `barber` / `about` / `video` | `photo_url` / `image_url` / `video_url` |

- Saat build (misalnya di Vercel) dengan variabel Supabase tersedia, konten CMS langsung ikut di-prerender ke HTML. Di browser, konten terbaru tetap diambil ulang dari CMS.
- `hours_data` menggerakkan status "Buka sekarang / Tutup" dan slot jam di formulir booking. Format hari bebas seperti `Senin – Jumat`, `Sabtu, Minggu`, atau `Setiap hari`; jam seperti `16:00 – 21:00`.
- Teks lama bertuliskan "Ikbar" (misalnya "Tanya Ikbar") otomatis tampil sebagai "Dinasti", kecuali nama barber "Ikbar Kamil".

## Teknis

Vite + Preact (melalui `preact/compat`, komponen ditulis dengan API React). Halaman di-prerender saat build (`scripts/prerender.js`) dan di-hydrate di browser. Font dan gambar WebP di-host sendiri di `public/fonts` dan `public/img`; file asli di `public/assets` tidak diubah karena bisa dirujuk oleh CMS.

## Versi sebelumnya

Disimpan di tag `original-before-claude` dan branch `backup/original`:

```bash
git checkout main && git reset --hard original-before-claude
```
