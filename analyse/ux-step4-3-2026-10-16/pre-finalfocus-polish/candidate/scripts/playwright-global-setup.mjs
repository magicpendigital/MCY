import { resolve } from "node:path";
import { createServer } from "vite";
import { isolatePlaywrightTestEnvironment } from "./playwright-test-environment.mjs";

export default async function globalSetup() {
  const port = Number(process.env.MOBILE_RUNTIME_TEST_PORT ?? 4177);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("MOBILE_RUNTIME_TEST_PORT must be a valid TCP port.");
  }

  isolatePlaywrightTestEnvironment();

  const server = await createServer({
    configFile: resolve(process.cwd(), "vite.config.ts"),
    configLoader: process.env.MCY_PLAYWRIGHT_VITE_CONFIG_LOADER === "runner" ? "runner" : "bundle",
    server: {
      host: "127.0.0.1",
      port,
      strictPort: true,
    },
  });

  await server.listen();
  return async () => server.close();
}
