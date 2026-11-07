# ValteraTravel Frontend (V1)

React + TypeScript + Vite + Tailwind v4 + React Router + i18next (ID/EN).
Mencakup **public website**, **login**, **Staff Dashboard** (destinasi, paket, jadwal, fasilitas, inquiry) dan **Manager Dashboard** (laporan + export CSV).

## Jalankan lokal
```bash
npm install
npm run dev          # http://localhost:5173
npm run build:check  # typecheck + build produksi
```

## Deploy ke Vercel (mode demo, tanpa backend)
1. Push folder ini ke GitHub.
2. Vercel → *Add New Project* → import repo. Preset **Vite** terdeteksi otomatis (`vercel.json` sudah siap: SPA fallback, cache asset, security header).
3. Environment Variables: tidak wajib (default `VITE_USE_MOCK=true`). Klik **Deploy**.

Mode mock memakai data contoh di browser. Akun demo (hanya mock): `staff@valteratravel.test` / `manager@valteratravel.test`, password `demo12345`.
Data mock di-reset setiap halaman dimuat ulang. **Jangan dipakai sebagai sistem operasional.**

## Menyambung ke backend Spring Boot
1. Deploy backend (Render/Railway/dll).
2. Ganti `vercel.json` dengan isi `vercel.backend.example.json` (isi URL backend). Request `/api/*` di-proxy Vercel sehingga cookie session HttpOnly + CSRF berjalan **same-origin**.
3. Set `VITE_USE_MOCK=false` di Vercel → Redeploy.
4. Backend: pakai cookie CSRF `XSRF-TOKEN` (frontend mengirim header `X-XSRF-TOKEN`).

### Kontrak API yang dipakai frontend
Semua response: `{ success, message, data, errors? }`. Daftar berpaginasi: `{ content, page, size, totalElements, totalPages }`. Tipe lengkap: `src/types/api.ts`, `src/types/staff.ts`.

| Area | Endpoint |
|---|---|
| Public | `GET /api/public/destinations[/{id}]`, `GET /api/public/packages[/{id}]` (detail memuat `schedules` aktif & `inclusions`), `POST /api/public/inquiries` |
| Auth | `POST /api/auth/login` (body `{email,password}` → user), `POST /api/auth/logout`, `GET /api/auth/me` |
| Staff (SRS) | `/api/staff/destinations` (GET/POST, PUT `/{id}`, PATCH `/{id}/status` body `{isActive}`), `/api/staff/packages` (idem), `POST /api/staff/packages/{id}/schedules`, `PUT /api/staff/schedules/{id}`, `PATCH .../status`, `POST /api/staff/packages/{id}/inclusions`, `PUT/DELETE /api/staff/inclusions/{id}`, `GET /api/staff/inquiries`, `PATCH .../inquiries/{id}/status|assign|notes` |
| **Tambahan di luar daftar SRS** | `GET /api/staff/packages/{id}/schedules`, `GET /api/staff/packages/{id}/inclusions`, `GET /api/staff/members` (daftar staf untuk penugasan) |
| Manager | `GET /api/manager/dashboard?from&to&lang` (bentuk `ManagerReport`), `GET /api/manager/reports/inquiries/export?from&to&lang` (CSV) |

Endpoint staff untuk destinasi/paket/fasilitas mengembalikan **kedua terjemahan** (`translations: { id: {...}, en: {...} }`).
Aturan aktivasi (terjemahan lengkap) dan hak akses per role tetap harus ditegakkan di backend; pengecekan di frontend hanya untuk UX.

## Catatan
- Vercel paket Hobby ditujukan untuk penggunaan non-komersial; periksa ketentuan sebelum dipakai untuk bisnis (SRS 16.3).
- Detail kontak footer masih placeholder.
- `/manager` menggabungkan Dashboard, Inquiry Reports, dan Export dalam satu halaman.

## Struktur
`src/pages` (publik) · `src/pages/dashboard` · `src/layouts` · `src/components` · `src/contexts` · `src/services` (api/mock/http) · `src/types` · `src/i18n` · `src/utils`

## Mode mock vs backend
Default `VITE_USE_MOCK=true` hanya untuk demo tampilan (ada lencana "Mode demo" di pojok kiri bawah; data tidak tersimpan). Untuk pengujian sistem sungguhan set `VITE_USE_MOCK=false` dan jalankan backend + PostgreSQL.
