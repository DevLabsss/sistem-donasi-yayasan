const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character]);

function resetPasswordEmail(resetUrl) {
  const safeUrl = escapeHtml(resetUrl);
  return {
    subject: "Atur ulang kata sandi akun donasi Anda",
    text: [
      "Halo,",
      "",
      "Kami menerima permintaan untuk mengatur ulang kata sandi akun Sistem Donasi Yayasan Anda.",
      "Buka tautan berikut dalam 15 menit untuk membuat kata sandi baru:",
      resetUrl,
      "",
      "Jika Anda tidak meminta perubahan ini, abaikan email ini. Kata sandi Anda tetap sama.",
      "",
      "Sistem Donasi Yayasan",
    ].join("\n"),
    html: `<!doctype html>
<html lang="id">
  <body style="margin:0;padding:24px;background:#f5f7f6;font-family:Arial,sans-serif;color:#16302a">
    <main style="max-width:560px;margin:auto;padding:32px;background:#ffffff;border-radius:12px">
      <h1 style="font-size:24px;margin:0 0 20px">Atur ulang kata sandi</h1>
      <p>Halo,</p>
      <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Sistem Donasi Yayasan Anda.</p>
      <p>Tombol berikut berlaku selama <strong>15 menit</strong>.</p>
      <p style="margin:28px 0"><a href="${safeUrl}" style="display:inline-block;padding:14px 20px;background:#087f5b;color:#ffffff;text-decoration:none;border-radius:8px">Buat kata sandi baru</a></p>
      <p>Jika tombol tidak berfungsi, salin tautan ini ke browser:</p>
      <p style="overflow-wrap:anywhere"><a href="${safeUrl}">${safeUrl}</a></p>
      <p style="margin-top:28px;color:#52645e">Jika Anda tidak meminta perubahan ini, abaikan email ini. Kata sandi Anda tetap sama.</p>
      <p>Sistem Donasi Yayasan</p>
    </main>
  </body>
</html>`,
  };
}

module.exports = resetPasswordEmail;
