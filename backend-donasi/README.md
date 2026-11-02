# Backend Sistem Donasi Yayasan

API untuk aplikasi sistem donasi yayasan. Backend ini menggunakan Node.js, Express, Prisma, dan MySQL untuk mengelola akun, program donasi, transaksi, pengajuan bantuan, penyaluran, serta laporan.

## Persiapan

- Node.js 22 dan npm
- MySQL
- Database MySQL yang sudah dibuat

Jalankan perintah berikut dari **root repository backend** (folder yang berisi `index.js` dan `package.json`):

```bash
npm ci
cp .env.example .env
```

Isi `.env` sesuai lingkungan Anda:

```env
PORT=3000
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/NAMA_DATABASE"
JWT_SECRET="ganti-dengan-kunci-acak-yang-panjang"
CLIENT_URL="http://localhost:5173"

SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

`DATABASE_URL` harus menggunakan MySQL. Konfigurasi Cloudinary diperlukan untuk penyimpanan gambar program. Simpan kredensial asli hanya di `.env`; file ini tidak boleh diunggah ke GitHub.

Untuk pengembangan di Mac dengan XAMPP, nyalakan **MySQL Database** melalui **XAMPP → Manage Servers** sebelum menjalankan backend. Sesuaikan nama database, pengguna, password, dan port pada `DATABASE_URL` dengan MySQL yang digunakan.

Untuk mengaktifkan fitur lupa password, isi `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, dan `SMTP_FROM` di `.env`, lalu atur `CLIENT_URL` ke alamat frontend. Jika SMTP belum diatur, API menonaktifkan pemulihan password dan mengembalikan status 503.

Untuk deploy, `CLIENT_URL` harus berisi alamat HTTPS frontend yang benar agar tautan reset password dan izin CORS sesuai. Simpan `DATABASE_URL`, `JWT_SECRET`, dan kredensial SMTP/Cloudinary sebagai environment variable rahasia pada layanan backend.

## Menjalankan aplikasi

Terapkan migrasi database, lalu jalankan server:

```bash
npx prisma migrate deploy
npm run dev
```

Untuk menjalankan tanpa `nodemon`, gunakan `npm start`. Server berjalan pada `http://localhost:3000` jika `PORT` tidak diubah. Ketika server dimulai, aplikasi juga memeriksa dan menyinkronkan beberapa tabel serta kolom yang diperlukan.

Jika muncul `nodemon: command not found`, jalankan `npm ci` dari folder ini untuk memasang dependensi pengembangan. Jika muncul pesan Prisma Client belum dibuat, jalankan `npx prisma generate`. Jika muncul `Can't reach database server`, periksa apakah MySQL sudah menyala dan `DATABASE_URL` benar.

Cek server:

```text
GET http://localhost:3000/
GET http://localhost:3000/api/health/db
```

Endpoint kedua memeriksa koneksi database.

## Deploy untuk demonstrasi

Urutan yang memudahkan pengaturan URL adalah **database MySQL online → backend Render → perbarui `VITE_API_URL` frontend Netlify**. Gunakan database kosong dan data contoh untuk demonstrasi. Jangan pakai `DATABASE_URL` lokal dari `.env` pada Render.

Repo root memiliki `render.yaml` untuk membuat Web Service Render Free dengan root `backend-donasi`. Blueprint meminta `DATABASE_URL` MySQL online di dashboard Render; `JWT_SECRET` dibuat otomatis. Kredensial Cloudinary dapat ditambahkan kemudian jika unggah gambar program diperlukan. `CLIENT_URL` sudah diarahkan ke situs Netlify proyek ini. Build menjalankan `npm ci`, lalu start menjalankan `prisma migrate deploy` sebelum API dibuka. Pilih database MySQL online yang mendukung koneksi dari Render, misalnya [Aiven for MySQL Free](https://aiven.io/docs/products/mysql/concepts/mysql-free-tier), dan simpan URL koneksinya hanya sebagai environment variable Render.

Setelah endpoint `https://<nama-layanan>.onrender.com/api/health/db` berhasil, atur `VITE_API_URL=https://<nama-layanan>.onrender.com/api` dan `VITE_DEMO_MODE=true` pada environment variable Netlify, lalu deploy ulang frontend. Blueprint menetapkan `DEMO_MODE=true` pada API untuk menolak pembuatan donasi. Versi ini hanya untuk demo: bukti pembayaran dan avatar masih disimpan pada disk sementara Render Free dan dapat hilang setelah layanan tidur atau deploy ulang. Jangan menerima donasi sungguhan sampai unggahan dipindahkan ke penyimpanan permanen dan alurnya diuji.

Jika membuat layanan Render secara manual, pilih root directory `backend-donasi`, lalu gunakan:

```text
Build command: npm ci
Start command: npx prisma migrate deploy && npm start
```

Atur `DATABASE_URL`, `JWT_SECRET` yang panjang dan acak, serta `CLIENT_URL` sebagai environment variable di layanan backend. `PORT` biasanya disediakan oleh platform. Jika gambar program digunakan, isi variabel Cloudinary juga. Jangan unggah `.env` ke repository.

Frontend perlu `VITE_API_URL` dengan format `https://alamat-backend/api`. Jika alamat frontend berubah dari Netlify yang sekarang, isi `CLIENT_URL` backend dengan **origin** frontend baru tanpa path tambahan, lalu deploy ulang backend.

Backend menyimpan **bukti pembayaran** di `uploads/bukti/` dan **avatar** di `uploads/avatars/`. File ini perlu penyimpanan permanen sebelum menerima data nyata. Pada Render Free, isi disk lokal dapat hilang saat layanan berhenti atau deploy ulang. Render Free juga memblokir port SMTP umum `25`, `465`, dan `587`; fitur lupa password lewat email tidak akan berfungsi di sana tanpa mengganti metode pengiriman email. Lihat [batasan Render Free](https://render.com/docs/free). Jangan gunakan seed atau data donasi sungguhan untuk demonstrasi di layanan tersebut.

## Fitur API

Semua endpoint aplikasi memakai awalan `/api`.

| Area | Contoh endpoint | Keterangan |
| --- | --- | --- |
| Autentikasi | `POST /api/auth/register`, `POST /api/auth/login` | Pendaftaran dan login |
| Profil | `GET /api/profil`, `PUT /api/profil` | Memerlukan login |
| Program | `GET /api/program`, `POST /api/program` | Penambahan program memerlukan akun pengurus |
| Donasi | `POST /api/donasi`, `GET /api/donasi/saya` | Pencatatan dan riwayat donasi |
| Pengajuan bantuan | `POST /api/pengajuan`, `GET /api/pengajuan/saya` | Memerlukan login |
| Penyaluran | `POST /api/penyaluran`, `GET /api/penyaluran/saya` | Pencatatan penyaluran oleh pengurus |
| Laporan | `GET /api/donasi/transparansi`, `GET /api/laporan/pdf` | Laporan PDF memerlukan akun pengurus |

Rute lengkap tersedia di `src/routes/api.js`. Endpoint yang memerlukan login menggunakan token JWT melalui header `Authorization: Bearer <token>`.

## Struktur proyek

```text
index.js              Titik masuk server
src/routes/           Definisi endpoint API
src/controllers/      Logika fitur
src/middleware/       Autentikasi dan upload
src/services/         Layanan penyimpanan gambar
prisma/schema.prisma  Skema database
prisma/migrations/    Migrasi database
```

Jalankan backend dari **root repository** yang berisi `index.js` dan `package.json`.

## Tes

```bash
node --test
```

Perintah `npm test` juga menjalankan tes yang sama. Sebagian tes membuka server lokal pada `127.0.0.1`.

> `prisma/seed.js` berisi data contoh. Jalankan seed hanya pada database kosong untuk pengembangan; jangan jalankan pada database yang sudah berisi data yayasan.
