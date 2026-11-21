import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

// Schema creation is a separate Prisma step; this legacy entry point only
// delegates to the environment-backed administrator bootstrap.
const bootstrap = resolve(fileURLToPath(new URL("../setup-admin.mjs", import.meta.url)));
const result = spawnSync(process.execPath, [bootstrap], { stdio: "inherit", env: process.env });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;