import { spawnSync } from "node:child_process";

// Keep Prisma's conventional seed entry point aligned with the secure bootstrap script.
const result = spawnSync(process.execPath, ["setup-admin.mjs"], { stdio: "inherit", env: process.env });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;