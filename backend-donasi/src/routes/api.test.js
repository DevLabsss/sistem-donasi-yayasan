const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const router = require("./api");

test("mode demo menolak pembuatan donasi sebelum menyentuh database", async () => {
  const previous = process.env.DEMO_MODE;
  process.env.DEMO_MODE = "true";
  const app = express();
  app.use("/api", router);
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/donasi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programId: 1, jumlah: 20000 }),
    });
    assert.equal(response.status, 503);
    assert.match((await response.json()).message, /donasi belum dibuka/i);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (previous === undefined) delete process.env.DEMO_MODE;
    else process.env.DEMO_MODE = previous;
  }
});
