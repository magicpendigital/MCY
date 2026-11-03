export const FRAME_ORIGIN = 'https://www.youtube-nocookie.com';
export const MOCK_HTML = '<!doctype html><title>Fixture player</title>';
export const FIXTURE_ORIGIN = 'https://mcy-playwright.invalid';
export const LOOPBACK_ORIGIN = 'http://127.0.0.1:4195';
const fixturePaths = new Set(['/auth/v1/user','/auth/v1/token','/rest/v1/profiles','/rest/v1/checkins','/rest/v1/checkin_observations','/rest/v1/rpc/get_my_consent_state','/rest/v1/rpc/get_my_consent_policy_versions','/rest/v1/rpc/record_my_consent','/rest/v1/rpc/save_my_checkin_for_current_user_with_current_consent','/functions/v1/mcy-ai-assistant']);
export function classifyRequest(raw) {
  let url;
  try { url = new URL(raw); } catch { return 'forbidden'; }
  if (url.origin === LOOPBACK_ORIGIN) return 'loopback';
  if (url.origin === FIXTURE_ORIGIN && fixturePaths.has(url.pathname)) return 'fixture';
  if (url.origin === FRAME_ORIGIN && /^\/embed\/[A-Za-z0-9_-]{11}$/.test(url.pathname) && url.search === '?autoplay=1&playsinline=1&rel=0&modestbranding=1' && url.hash === '') return 'mocked-frame';
  return 'forbidden';
}
