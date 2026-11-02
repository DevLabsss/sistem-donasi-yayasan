const prisma = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const nodemailer = require("nodemailer");
const resetPasswordEmail = require("../utils/resetPasswordEmail");

const passwordFingerprint = (passwordHash) =>
  crypto.createHash("sha256").update(passwordHash).digest("hex");

// 1. REGISTRASI
exports.register = async (req, res) => {
  try {
    const { nama, email, password, role, alamat, noHp, alasan } = req.body;

    if (!["DONATUR", "PENERIMA_BANTUAN"].includes(role || "DONATUR")) {
      return res.status(400).json({ message: "Peran pendaftaran tidak valid." });
    }
    if (typeof nama !== "string" || !nama.trim() || typeof email !== "string" || !email.trim() || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Nama, email, dan password minimal 6 karakter wajib diisi." });
    }

    // Cek apakah email sudah pernah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar!" });
    }

    // Hash password menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tentukan Role (Default: DONATUR)
    const userRole = role || "DONATUR";

    // Opsi data pendaftaran dasar
    let createData = {
      nama,
      email,
      password: hashedPassword,
      role: userRole,
    };

    // Jika PENERIMA_BANTUAN, buat sekaligus menggunakan Nested Write Prisma
    if (userRole === "PENERIMA_BANTUAN") {
      createData.penerimaBantuan = {
        create: {
          alamat: alamat || "-",
          noHp: noHp || "-",
          alasan: alasan || "-",
          status: "VERIFIKASI", // Sesuai enum StatusPenerima di schema.prisma
        },
      };
    }

    // Simpan data User
    const newUser = await prisma.user.create({
      data: createData,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,

      },
    });

    res.status(201).json({
      message:
        userRole === "PENERIMA_BANTUAN"
          ? "Registrasi berhasil! Akun Anda sedang dalam proses verifikasi oleh Admin."
          : "Registrasi berhasil!",
      data: {
        id: newUser.id,
        nama: newUser.nama,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error Register:", error);
    res.status(500).json({
      message: "Gagal melakukan pendaftaran.",
      error: error.message,
    });
  }
};

// 2. LOGIN (Urutan Pengecekan Ditolak Diperbaiki)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        nama: true,
        email: true,
        password: true,
        role: true,

        penerimaBantuan: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password salah!" });
    }

    // 🔴 PROTEKSI & PERBAIKAN: Cek Verifikasi khusus PENERIMA_BANTUAN
    if (user.role === "PENERIMA_BANTUAN") {
      const profilPenerima = Array.isArray(user.penerimaBantuan)
        ? user.penerimaBantuan[0]
        : user.penerimaBantuan;

      // 🟢 1. Cek terlebih dahulu apakah pendaftaran DITOLAK
      if (profilPenerima && profilPenerima.status === "DITOLAK") {
        return res.status(403).json({
          message:
            "Mohon maaf, pendaftaran akun Penerima Bantuan Anda tidak disetujui oleh Admin.",
        });
      }

      // 🟢 2. Cek jika profil belum ada atau statusnya masih VERIFIKASI (Menunggu)
      if (!profilPenerima || profilPenerima.status === "VERIFIKASI") {
        return res.status(403).json({
          message:
            "Akun Penerima Bantuan Anda belum disetujui/diverifikasi oleh Admin. Silakan tunggu konfirmasi Admin.",
        });
      }

      // Jika status "DISETUJUI", proses login akan berlanjut ke bawah.
    }

    // Pembuatan Token JWT
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      return res.status(500).json({ message: "Konfigurasi server bermasalah: JWT_SECRET belum diatur." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, nama: user.nama },
      secretKey,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login berhasil!",
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        fotoProfil: null,
      },
    });
  } catch (error) {
    console.error("Error Login:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat login.", error: error.message });
  }
};

// 3. LUPA PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    if (!email) {
      return res.status(400).json({ message: "Alamat email wajib diisi." });
    }

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      return res.status(500).json({ message: "Konfigurasi server bermasalah: JWT_SECRET belum diatur." });
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, CLIENT_URL } = process.env;
    const smtpPort = Number(SMTP_PORT);
    if (!SMTP_HOST || !Number.isInteger(smtpPort) || smtpPort <= 0 || !SMTP_USER || !SMTP_PASS || !SMTP_FROM || !CLIENT_URL) {
      return res.status(503).json({ message: "Pemulihan password belum tersedia. Hubungi pengurus yayasan." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const resetToken = jwt.sign(
        { id: user.id, purpose: "password-reset", passwordFingerprint: passwordFingerprint(user.password) },
        secretKey,
        { expiresIn: "15m" },
      );
      const resetUrl = new URL(`/reset-password/${resetToken}`, CLIENT_URL).toString();
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      await transporter.sendMail({
        from: SMTP_FROM,
        to: user.email,
        ...resetPasswordEmail(resetUrl),
      });
    }

    return res.json({ message: "Jika email terdaftar, tautan pemulihan akan dikirim ke alamat tersebut." });
  } catch (error) {
    console.error("Error Forgot Password:", error);
    return res.status(503).json({ message: "Pemulihan password sementara tidak tersedia." });
  }
};

// 4. EKSEKUSI RESET PASSWORD BARU
exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { token, passwordBaru } = req.body;

    if (!token || !passwordBaru) {
      return res
        .status(400)
        .json({ message: "Token dan password baru wajib diisi." });
    }

    if (passwordBaru.length < 6) {
      return res
        .status(400)
        .json({ message: "Password baru minimal 6 karakter." });
    }

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      return res.status(500).json({ message: "Konfigurasi server bermasalah: JWT_SECRET belum diatur." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secretKey);
      if (decoded.purpose !== "password-reset" || !Number.isSafeInteger(decoded.id) || !decoded.passwordFingerprint) {
        throw new Error("Token bukan untuk reset password.");
      }
    } catch (err) {
      return res.status(400).json({
        message: "Tautan reset password tidak valid atau telah kadaluwarsa.",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { password: true } });
    if (!user || passwordFingerprint(user.password) !== decoded.passwordFingerprint) {
      return res.status(400).json({ message: "Tautan reset password tidak valid atau telah digunakan." });
    }

    const hashedPassword = await bcrypt.hash(passwordBaru, 10);
    const updated = await prisma.user.updateMany({
      where: { id: decoded.id, password: user.password },
      data: { password: hashedPassword },
    });
    if (!updated.count) {
      return res.status(400).json({ message: "Tautan reset password tidak valid atau telah digunakan." });
    }

    res.json({
      message: "Password Anda berhasil diperbarui! Silakan login kembali.",
    });
  } catch (error) {
    console.error("Error Reset Password:", error);
    res.status(500).json({
      message: "Gagal memperbarui password.",
      error: error.message,
    });
  }
};
