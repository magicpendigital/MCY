import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    outDir: "dist/client",
    // Vite 8 targets Safari 16.4+ by default and never polyfills. The app must run on iOS 15.0 (docs/quality/KNOWN_INCIDENTS.md, INC-001),
    // so newer syntax is lowered for Safari 15. Regex lookbehind and newer APIs/CSS are NOT lowered or polyfilled: tests/browser-compat.test.mjs guards them.
    target: ["chrome87", "edge88", "firefox78", "safari15"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
  },
  plugins: [react()],
});
