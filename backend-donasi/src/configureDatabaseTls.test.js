const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const configureDatabaseTls = require("./configureDatabaseTls");

test("sertifikat Aiven mengaktifkan verifikasi TLS ketat pada URL Prisma", () => {
  const previousUrl = process.env.DATABASE_URL;
  const previousCert = process.env.AIVEN_CA_CERT;
  try {
    process.env.DATABASE_URL = "mysql://user:password@example.test:1234/defaultdb?ssl-mode=REQUIRED";
    process.env.AIVEN_CA_CERT = "-----BEGIN CERTIFICATE-----\\ntest\\n-----END CERTIFICATE-----";
    configureDatabaseTls();
    const url = new URL(process.env.DATABASE_URL);
    assert.equal(url.searchParams.has("ssl-mode"), false);
    assert.equal(url.searchParams.get("sslaccept"), "strict");
    assert.match(fs.readFileSync(url.searchParams.get("sslcert"), "utf8"), /BEGIN CERTIFICATE/);
  } finally {
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
    if (previousCert === undefined) delete process.env.AIVEN_CA_CERT;
    else process.env.AIVEN_CA_CERT = previousCert;
  }
});
