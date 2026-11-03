const FIXTURE_SUPABASE_URL = "https://mcy-playwright.invalid";
const FIXTURE_PUBLISHABLE_KEY = "sb_publishable_mcy_playwright_fixture";
const SERVER_ONLY_VARIABLES = Object.freeze([
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ACCESS_TOKEN",
  "AI_GATEWAY_API_KEY",
  "OPENROUTER_API_KEY",
  "VITE_OPENROUTER_API_KEY",
  "OPENROUTER_API_KEY",
]);

export function createPlaywrightTestEnvironment(sourceEnvironment = process.env) {
  const environment = {
    ...sourceEnvironment,
    VITE_SUPABASE_URL: FIXTURE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: FIXTURE_PUBLISHABLE_KEY,
  };

  for (const name of SERVER_ONLY_VARIABLES) delete environment[name];
  return environment;
}

export function isolatePlaywrightTestEnvironment(targetEnvironment = process.env) {
  const environment = createPlaywrightTestEnvironment(targetEnvironment);

  for (const name of SERVER_ONLY_VARIABLES) delete targetEnvironment[name];
  targetEnvironment.VITE_SUPABASE_URL = environment.VITE_SUPABASE_URL;
  targetEnvironment.VITE_SUPABASE_PUBLISHABLE_KEY = environment.VITE_SUPABASE_PUBLISHABLE_KEY;
}
