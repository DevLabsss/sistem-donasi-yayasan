require("dotenv").config();
require("../src/configureDatabaseTls")();

const { spawnSync } = require("node:child_process");
const prisma = require.resolve("prisma/build/index.js");

for (const args of [["migrate", "deploy"], ["generate"]]) {
  const result = spawnSync(process.execPath, [prisma, ...args], {
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
