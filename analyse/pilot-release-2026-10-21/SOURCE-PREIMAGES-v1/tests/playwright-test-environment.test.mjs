import assert from "node:assert/strict";
import test from "node:test";
import { createPlaywrightTestEnvironment } from "../scripts/playwright-test-environment.mjs";

test("Playwright Vite receives only the fictional Supabase configuration", () => {
  const environment = createPlaywrightTestEnvironment({
    PATH: "fixture-path",
    VITE_SUPABASE_URL: "https://production.example.invalid",
    VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_real_key_must_not_be_used",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-canary",
    SUPABASE_ACCESS_TOKEN: "access-token-canary",
    AI_GATEWAY_API_KEY: "gateway-key-canary",
  });

  assert.equal(environment.PATH, "fixture-path");
  assert.equal(environment.VITE_SUPABASE_URL, "https://mcy-playwright.invalid");
  assert.equal(environment.VITE_SUPABASE_PUBLISHABLE_KEY, "sb_publishable_mcy_playwright_fixture");
  assert.equal("SUPABASE_SERVICE_ROLE_KEY" in environment, false);
  assert.equal("SUPABASE_ACCESS_TOKEN" in environment, false);
  assert.equal("AI_GATEWAY_API_KEY" in environment, false);
  assert.equal(JSON.stringify(environment).includes("canary"), false);
});
