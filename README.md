# Yayasan Mulia Karya Bersama

## Deskripsi
**Yayasan Mulia Karya Bersama** adalah platform sistem informasi donasi dan manajemen penyaluran bantuan sosial berbasis web. Aplikasi ini dirancang untuk memfasilitasi penghimpunan dana dari donatur secara transparan, akuntabel, dan terstruktur, serta mempermudah pengurus yayasan dalam mengelola program kemanusiaan, verifikasi penerima bantuan, dan pelaporan penyaluran dana secara komprehensif.

---

## Features
- **Landing Page & Informasi Yayasan**: Profil lembaga, visi misi, transparansi keuangan, dan program unggulan.
- **Katalog Program Donasi**: Tampilan daftar program bantuan aktif, progres target dana, dan persentase ketercapaian.
- **Donasi Online**: Dukungan donasi publik maupun terdaftar dengan formulir cepat dan transparan.
- **Metode Pembayaran Fleksibel**: Dukungan pembayaran via QRIS dan Transfer Bank.
- **Upload & Bukti Donasi**: Konfirmasi pembayaran donasi secara real-time.
- **Autentikasi & Otorisasi**: Sistem registrasi, login, lupa password melalui reset token, dan proteksi berbasis peran (Role-Based Access Control / RBAC).
- **Dashboard Pengurus (Admin)**:
  - Ringkasan statistik keuangan (Total Dana Masuk, Total Dana Keluar, Saldo Kas).
  - Manajemen akun pengurus dan pengguna.
  - Verifikasi pendaftaran penerima bantuan (Persetujuan / Penolakan).
  - Pencatatan dan alokasi penyaluran bantuan ke penerima.
  - Export laporan penyaluran bantuan ke format PDF dan Excel (.xlsx).
- **Dashboard Donatur**: Riwayat partisipasi donasi, status transaksi donasi, dan transparansi laporan penyaluran.
- **Dashboard Penerima Bantuan**: Status verifikasi pendaftaran akun, data pengajuan, serta riwayat bantuan yang telah diterima.

---

## Tech Stack

### Frontend
- **Framework / Library**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Web Framework**: Express.js
- **ORM**: Prisma ORM
- **Authentication**: JSON Web Token (JWT) & bcryptjs
- **Reporting & Export**: PDFKit (PDF) & ExcelJS (Spreadsheet)
- **CORS & Utilities**: CORS, dotenv

### Database
- **Database Engine**: MySQL / MariaDB

---

## Project Structure

```text
sistem-donasi/
├── frontend-donasi/      # Aplikasi antarmuka pengguna berbasis Vite + React & Tailwind CSS
│   ├── public/           # Aset statis publik
│   ├── src/
│   │   ├── assets/       # Gambar, logo yayasan, QRIS, dan ikon grafis
│   │   ├── components/   # Komponen UI modular (Navbar, Footer, ModalDonasi, WhatsAppChat)
│   │   ├── pages/        # Halaman aplikasi (Home, Login, Register, Dashboards)
│   │   ├── services/     # Konfigurasi Axios dan interceptor API
│   │   ├── App.jsx       # Routing dan routing layout
│   │   └── main.jsx      # Entry point React
│   ├── package.json      # Dependensi dan skrip frontend
│   └── vite.config.js    # Konfigurasi Vite
│
└── backend-donasi/       # Layanan API backend berbasis Express.js & Prisma ORM
    ├── prisma/
    │   ├── schema.prisma # Skema relasi database, model, dan enum Prisma
    │   ├── migrations/   # Riwayat migrasi database
    │   └── seed.js       # Seeder data inisialisasi awal
    ├── src/
    │   ├── controllers/  # Logika bisnis (auth, donasi, program, admin, penyaluran)
    │   ├── middleware/   # Middleware autentikasi token JWT dan autorisasi RBAC
    │   ├── routes/       # Definisi endpoint REST API
    │   └── db.js         # Inisialisasi Prisma Client
    ├── index.js          # Entry point server Express.js
    └── package.json      # Dependensi dan skrip backend
```

---

## Requirements
Sebelum menjalankan aplikasi, pastikan perangkat Anda telah terpasang:
- **Node.js**: Versi `>= 18.x` atau `>= 20.x` (LTS direkomendasikan)
- **npm**: Versi `>= 9.x`
- **Database**: MySQL Server versi `>= 8.0` atau MariaDB `>= 10.4`

---

## Environment Variables

### Backend (`backend-donasi/.env`)
Salin file template `.env.example` menjadi `.env` di dalam direktori `backend-donasi/`:
```bash
cp backend-donasi/.env.example backend-donasi/.env
```

Konfigurasikan variabel lingkungan berikut:
```env
PORT=3000
DATABASE_URL="mysql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:<DB_PORT>/<DB_NAME>"
JWT_SECRET="<MASUKKAN_RANDOM_SECRET_KEY_YANG_KUAT>"

# Konfigurasi Pengiriman Email Reset Password (Gmail SMTP)
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-app-password"
CLIENT_URL="http://localhost:5173"
```

### Frontend (`frontend-donasi/.env`)
Salin file template `.env.example` menjadi `.env` di dalam direktori `frontend-donasi/`:
```bash
cp frontend-donasi/.env.example frontend-donasi/.env
```

Konfigurasikan variabel lingkungan berikut:
```env
VITE_API_URL="http://localhost:3000/api"
```

---

## Database Setup
1. Buat database baru di MySQL/MariaDB server Anda:
   ```sql
   CREATE DATABASE db_donasi_yayasan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Masuk ke direktori backend dan jalankan generate client serta sinkronisasi skema:
   ```bash
   cd backend-donasi
   npx prisma generate
   npx prisma db push
   ```

3. *(Opsional)* Jika ingin mengisi data inisialisasi awal (dummy/starter seed):
   ```bash
   npx prisma db seed
   ```

---

## Installation & Development

### 1. Menjalankan Backend
Buka terminal baru:
```bash
cd backend-donasi
npm install
npx prisma generate
npm run dev
```
Server backend akan aktif di `http://localhost:3000`.

### 2. Menjalankan Frontend
Buka terminal kedua:
```bash
cd frontend-donasi
npm install
npm run dev
```
Aplikasi web frontend akan berjalan di `http://localhost:5173`.

---

## Authentication & Role-Based Access

Sistem menggunakan JSON Web Token (JWT) yang disimpan di client storage dan diverifikasi di header `Authorization: Bearer <TOKEN>`.

### Daftar Peran (Roles):
1. **`PENGURUS`**:
   - Memiliki akses penuh ke Dashboard Admin.
   - Mengelola program donasi, memverifikasi penerima bantuan, mendistribusikan penyaluran dana, dan mengunduh laporan keuangan.
2. **`DONATUR`**:
   - Memiliki akses ke Dashboard Donatur.
   - Dapat melihat riwayat donasi pribadi, status konfirmasi, dan transparansi penyaluran dana yayasan.
3. **`PENERIMA_BANTUAN`**:
   - Mendaftar melalui portal khusus penerima bantuan.
   - Akun baru berstatus `VERIFIKASI` dan menunggu persetujuan dari Pengurus sebelum dapat mengakses dashboard penerima bantuan.

*Catatan Keamanan: Akun demo/pengurus untuk keperluan produksi harus didaftarkan secara mandiri melalui migrasi database atau registrasi resmi.*

---

## REST API Documentation

| Method | Endpoint | Auth | Role | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Publik | Semua | Pendaftaran akun baru (Donatur / Penerima Bantuan) |
| `POST` | `/api/auth/login` | Publik | Semua | Autentikasi dan perolehan JWT Token |
| `POST` | `/api/auth/forgot-password` | Publik | Semua | Permintaan tautan pemulihan kata sandi |
| `POST` | `/api/auth/reset-password` | Publik | Semua | Eksekusi ubah kata sandi dengan token reset |
| `GET` | `/api/program` | Publik | Semua | Menampilkan daftar seluruh program donasi aktif |
| `POST` | `/api/program` | JWT | `PENGURUS` | Membuat program donasi baru |
| `POST` | `/api/donasi` | Publik / JWT | Semua | Membuat transaksi donasi (online/transfer/QRIS) |
| `GET` | `/api/donasi/saya` | JWT | `DONATUR` | Menampilkan riwayat transaksi donasi pribadi pengguna login |
| `GET` | `/api/donasi/transparansi` | Publik | Semua | Mengambil ringkasan total dana terhimpun dan tersalurkan |
| `POST` | `/api/penyaluran` | JWT | `PENGURUS` | Mencatat penyaluran dana bantuan kepada penerima |
| `GET` | `/api/admin/pengurus` | JWT | `PENGURUS` | Menampilkan daftar pengurus yayasan |
| `POST` | `/api/admin/pengurus` | JWT | `PENGURUS` | Menambahkan akun pengurus yayasan baru |
| `PUT` | `/api/admin/pengurus/:id/reset-password` | JWT | `PENGURUS` | Mereset password akun pengguna |
| `GET` | `/api/admin/summary-keuangan` | JWT | `PENGURUS` | Mendapatkan kalkulasi total masuk, keluar, dan sisa saldo |
| `GET` | `/api/admin/penerima` | JWT | `PENGURUS` | Menampilkan daftar seluruh penerima bantuan |
| `GET` | `/api/admin/donatur` | JWT | `PENGURUS` | Menampilkan daftar donatur terdaftar |
| `GET` | `/api/admin/penerima-pending` | JWT | `PENGURUS` | Menampilkan daftar pengajuan penerima berstatus VERIFIKASI |
| `PUT` | `/api/admin/verifikasi-penerima/:id` | JWT | `PENGURUS` | Memverifikasi pengajuan penerima (`DISETUJUI` / `DITOLAK`) |
| `PUT` | `/api/admin/user/:id` | JWT | `PENGURUS` | Memperbarui profil data akun pengguna |
| `DELETE` | `/api/admin/user/:id` | JWT | `PENGURUS` | Menghapus akun pengguna dari sistem |
| `GET` | `/api/laporan/pdf` | JWT | `PENGURUS` | Mengunduh berkas laporan penyaluran bantuan (PDF) |
| `GET` | `/api/laporan/excel` | JWT | `PENGURUS` | Mengunduh berkas laporan penyaluran bantuan (Excel .xlsx) |

---

## Security Implementation
- **Password Hashing**: Semua kata sandi diamankan menggunakan algoritma *one-way hashing* `bcryptjs` sebelum disimpan ke basis data.
- **Environment Isolation**: Tidak ada kredensial basis data, secret key, atau kunci otentikasi yang disimpan dalam source code (semua dikonfigurasi melalui `.env`).
- **Strict Role-Based Access Control (RBAC)**: Seluruh endpoint administratif dilindungi oleh middleware `authenticateToken` dan `isAdmin` untuk mencegah eskalasi hak akses (privilege escalation) maupun IDOR.
- **Verifikasi Status Penerima**: Akun penerima bantuan yang masih menunggu verifikasi (`VERIFIKASI`) atau ditolak (`DITOLAK`) dibatasi aksesnya dari sistem internal.
- **Repository Hygiene**: Menggunakan berkas `.gitignore` komprehensif di level root, frontend, dan backend untuk mencegah kebocoran file sensitif (`.env`, `node_modules`, `.DS_Store`).

---

## Production Deployment Architecture

Dalam arsitektur *production*, komponen web dipisahkan untuk menjamin keandalan, skalabilitas, dan keamanan:

1. **Frontend (Static Web Hosting / CDN)**:
   - Platform: Vercel, Netlify, Cloudflare Pages, atau AWS S3 + CloudFront.
   - Command Build: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_URL=https://api.yourdomain.com/api`

2. **Backend (Node.js Container / PaaS / VPS)**:
   - Platform: Railway, Render, Fly.io, DigitalOcean App Platform, atau VPS Linux (Ubuntu + PM2 + Nginx reverse proxy).
   - Command Start: `npm start`
   - Environment Variable: `NODE_ENV=production`, `PORT=3000`, `DATABASE_URL=...`, `JWT_SECRET=...`, `CLIENT_URL=https://yourdomain.com`

3. **Database (Managed Cloud Database)**:
   - Platform: AWS RDS MySQL, DigitalOcean Managed Database, PlanetScale, atau Aiven.
   - *Peringatan*: Jangan menggunakan lingkungan lokal/XAMPP untuk basis data produksi. Pastikan basis data produksi dikonfigurasi dengan SSL connection, pencadangan otomatis (automated backup), serta kredensial yang kuat.

---

## License
Project ini dilindungi hak cipta untuk **Yayasan Mulia Karya Bersama**.  
*All rights reserved.*
