# Ikbar Barbershop — Website

Website publik Ikbar Barbershop oleh Velora Studio Dev: profil barbershop, layanan, galeri, dan informasi kontak.

Repositori ini hanya memuat frontend website. Dashboard pengelolaan tetap berada di repositori privat yang terpisah. Riwayat dan konfigurasi privat tidak disertakan.

## Menjalankan

```bash
npm ci
npm run dev
```

Build produksi: `npm run build`. Pratinjau: `npm run preview`.

Website dapat memakai konten bawaan tanpa konfigurasi Supabase. Jika menghubungkan CMS, salin `.env.example` menjadi `.env.local` dan isi URL serta kunci anon/publishable proyek. Variabel `VITE_` dapat dibaca publik: jangan gunakan service-role key atau kredensial rahasia. Akses database harus dibatasi melalui RLS.

Pemisahan repositori ini tidak mengubah deployment website atau dashboard yang sudah berjalan.
