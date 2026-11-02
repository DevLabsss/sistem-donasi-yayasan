const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function configureDatabaseTls() {
  const certificate = process.env.AIVEN_CA_CERT;
  if (!certificate) return;

  const pem = certificate.replace(/\\n/g, "\n").trim() + "\n";
  if (!pem.includes("-----BEGIN CERTIFICATE-----") || !pem.includes("-----END CERTIFICATE-----")) {
    throw new Error("AIVEN_CA_CERT harus berisi sertifikat PEM dari Aiven.");
  }

  const url = new URL(process.env.DATABASE_URL);
  if (url.protocol !== "mysql:") throw new Error("DATABASE_URL harus berupa URL MySQL.");

  const certPath = path.join(os.tmpdir(), "aiven-ca-cert.pem");
  fs.writeFileSync(certPath, pem, { mode: 0o600 });
  url.searchParams.delete("ssl-mode");
  url.searchParams.set("sslcert", certPath);
  url.searchParams.set("sslaccept", "strict");
  process.env.DATABASE_URL = url.toString();
}

module.exports = configureDatabaseTls;
