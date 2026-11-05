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

Jalankan server pengembangan:

```bash
npm run dev
```

Untuk menjalankan tanpa `nodemon`, gunakan `npm start`. Server berjalan pada `http://localhost:3000` jika `PORT` tidak diubah. Ketika server dimulai, aplikasi juga memeriksa dan menyinkronkan beberapa tabel serta kolom yang diperlukan. Jalankan migrasi Prisma hanya setelah riwayat migrasi database tujuan diperiksa, seperti dijelaskan pada bagian Railway di bawah.

Jika muncul `nodemon: command not found`, jalankan `npm ci` dari folder ini untuk memasang dependensi pengembangan. Jika muncul pesan Prisma Client belum dibuat, jalankan `npx prisma generate`. Jika muncul `Can't reach database server`, periksa apakah MySQL sudah menyala dan `DATABASE_URL` benar.

Cek server:

```text
GET http://localhost:3000/
GET http://localhost:3000/api/health/db
```

Endpoint kedua memeriksa koneksi database.

## Persiapan deploy Railway

1. Hubungkan repository ke Railway dan atur **Root Directory** layanan backend menjadi `/backend-donasi`. Gunakan `npm start` sebagai **Start Command** dan `/api/health/db` sebagai **Healthcheck Path**. Server sudah mendengarkan `PORT` yang diberikan Railway pada `0.0.0.0`.
2. Tambahkan layanan **MySQL** ke proyek Railway. Di layanan backend, atur variabel berikut. Jangan salin file `.env` lokal ke repository.

   | Variabel | Nilai |
   | --- | --- |
   | `DATABASE_URL` | Referensi `${{MySQL.MYSQL_URL}}` ke layanan MySQL Railway; ganti `MySQL` jika nama layanannya berbeda. |
   | `JWT_SECRET` | Kunci acak panjang dan rahasia. |
   | `CLIENT_URL` | Origin HTTPS frontend, tanpa path. |
   | `DEMO_MODE` | `true` selama donasi belum siap dibuka. |
   | `UPLOADS_DIR` | `/data/uploads` bila volume di bawah dipasang. |

   Tambahkan `SMTP_*` dan `CLOUDINARY_*` sesuai fitur yang digunakan. Gunakan `MYSQL_URL` internal dari layanan database Railway untuk backend, bukan URL publik atau `DATABASE_URL` lokal.
3. Buat **volume** Railway untuk layanan backend, pasang di `/data/uploads`, dan set `UPLOADS_DIR=/data/uploads`. Bukti pembayaran disimpan di subfolder `bukti` dan hanya disajikan melalui API berizin; avatar berada di `avatars`. Volume ini diperlukan agar file tetap ada setelah deploy ulang. File unggahan lokal yang sudah ada tidak berpindah otomatis ke volume.
4. Biarkan **Pre-deploy Command** kosong untuk persiapan awal. Proyek ini saat ini menyinkronkan skema lewat `autoMigrate()` pada startup. Riwayat migrasi Prisma lama memakai nama tabel `User`/`Donasi`, sedangkan skema aktif memakai `user`/`donasi`. Jika database Railway sudah berisi tabel atau data, periksa riwayat migrasinya sebelum menjalankan `prisma migrate deploy`; jangan jalankan seed contoh pada database yayasan.
5. Setelah backend sehat di `/api/health/db`, atur `VITE_API_URL=https://alamat-backend/api` pada frontend dan build ulang. Selama pengujian, set juga `VITE_DEMO_MODE=true` pada frontend. Uji login, unggah avatar, dan akses bukti pembayaran sebelum membuka donasi.

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
