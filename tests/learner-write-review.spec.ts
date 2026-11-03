import { expect, test, type Page, type Route } from '@playwright/test';
import { persistConsentChoices } from '../src/backend/consentPersistence';
import { CONSENT_POLICY_VERSIONS, emptyConsentState, type ConsentPurpose, type ConsentState, type LearnerClient } from '../src/backend/learnerData';
import { learnerSessionGeneration, observeLearnerSession } from '../src/backend/learnerSession';

const A = '11111111-1111-4111-8111-111111111111';
const B = '77777777-7777-4777-8777-777777777777';
const origin = 'https://mcy-playwright.invalid';
const storageKey = 'sb-mcy-playwright-auth-token';
const required = () => ({ ...emptyConsentState, terms: true, privacy: true });
type ConsentCall = {
  p_purpose: ConsentPurpose; p_action: 'granted' | 'revoked'; p_policy_version: string;
  p_source: string; p_idempotency_key: string; p_channel: string;
};
type Reply = { data: unknown; error: { message: string } | null };
const ok = (data: unknown): Reply => ({ data, error: null });
const lost = (): Reply => ({ data: null, error: { message: 'Fictional response lost; commit is unknown' } });
function latch() {
  let release!: () => void;
  const promise = new Promise<void>(resolve => { release = resolve; });
  return { promise, release };
}

// Models only the database contract: exact idempotency and committed consent
// state. All orchestration under test comes from the real application helper.
function consentBackend(initial = required()) {
  const state: ConsentState = { ...initial };
  const calls: ConsentCall[] = [];
  const committed = new Map<string, { signature: string; id: string }>();
  let reads = 0;
  let record: ((call: ConsentCall, commit: () => string) => Promise<Reply>) | null = null;
  let beforeRead: (() => Promise<void>) | null = null;
  const client = { rpc: async (name: string, body?: ConsentCall) => {
    if (name === 'get_my_consent_state') {
      reads++;
      await beforeRead?.();
      return ok({ ...state });
    }
    if (name === 'get_my_consent_policy_versions') return ok({ ...CONSENT_POLICY_VERSIONS });
    if (name !== 'record_my_consent' || !body) throw Error('Unexpected synthetic RPC: ' + name);
    const call = structuredClone(body); calls.push(call);
    const commit = () => {
      const signature = JSON.stringify(call), previous = committed.get(call.p_idempotency_key);
      if (previous) { expect(previous.signature).toBe(signature); return previous.id; }
      const id = 'fictional-event-' + (committed.size + 1);
      state[call.p_purpose] = call.p_action === 'granted';
      committed.set(call.p_idempotency_key, { signature, id });
      return id;
    };
    return record ? record(call, commit) : ok(commit());
  } } as unknown as LearnerClient;
  return {
    client, state, calls, committed, get reads() { return reads; },
    setRecord(handler: typeof record) { record = handler; },
    setBeforeRead(handler: typeof beforeRead) { beforeRead = handler; },
  };
}

test('committed partial consent batch is reconciled before an explicit contrary choice', async () => {
  const backend = consentBackend(), keys = new Map<string, string>();
  let firstAi = true;
  backend.setRecord(async (call, commit) => {
    if (call.p_purpose === 'ai_processing' && firstAi) { firstAi = false; return lost(); }
    return ok(commit());
  });
  const initial = await persistConsentChoices(backend.client, A, { ...required(), wellbeing_data: true, ai_processing: true }, 'onboarding', keys, 'web', () => true);
  expect(initial.hasUnsettledWrites).toBe(true);
  expect(initial.consents.wellbeing_data).toBe(true);
  expect(keys.size).toBe(1);

  const final = await persistConsentChoices(backend.client, A, required(), 'onboarding', keys, 'web', () => true);
  expect(final.matchesRequested).toBe(true);
  expect(backend.state).toEqual(required());
  const ai = backend.calls.filter(call => call.p_purpose === 'ai_processing');
  expect(ai.map(call => call.p_action)).toEqual(['granted', 'granted', 'revoked']);
  expect(ai[1]).toEqual(ai[0]);
  expect(ai[2].p_idempotency_key).not.toBe(ai[0].p_idempotency_key);
  expect(backend.calls.filter(call => call.p_purpose === 'wellbeing_data').map(call => call.p_action)).toEqual(['granted', 'revoked']);
  expect(keys.size).toBe(0);
});

test('lost response with a still-running grant replays the original key before revoking', async () => {
  const backend = consentBackend(), keys = new Map<string, string>(), originalCommit = latch(), replayStarted = latch();
  let attempts = 0;
  let finishOriginal!: () => string;
  backend.setRecord(async (call, commit) => {
    if (call.p_purpose !== 'wellbeing_data' || call.p_action !== 'granted') return ok(commit());
    attempts++;
    if (attempts === 1) { finishOriginal = commit; return lost(); }
    replayStarted.release();
    await originalCommit.promise;
    return ok(commit());
  });
  const first = await persistConsentChoices(backend.client, A, { ...required(), wellbeing_data: true }, 'onboarding', keys, 'web', () => true);
  expect(first.hasUnsettledWrites).toBe(true);
  expect(first.consents.wellbeing_data).toBe(false);
  const retry = persistConsentChoices(backend.client, A, required(), 'onboarding', keys, 'web', () => true);
  await replayStarted.promise;
  expect(backend.calls).toHaveLength(2);
  expect(backend.calls[1]).toEqual(backend.calls[0]);
  expect(backend.calls.every(call => call.p_action === 'granted')).toBe(true);
  finishOriginal(); originalCommit.release();
  expect((await retry).matchesRequested).toBe(true);
  expect(backend.calls.map(call => call.p_action)).toEqual(['granted', 'granted', 'revoked']);
  expect(backend.state.wellbeing_data).toBe(false);
  expect(backend.committed.size).toBe(2);
  expect(keys.size).toBe(0);
});

test('failed exact consent replay keeps its key and blocks a contrary write', async () => {
  const backend = consentBackend(), keys = new Map<string, string>();
  backend.setRecord(async () => lost());
  await persistConsentChoices(backend.client, A, { ...required(), ai_processing: true }, 'onboarding', keys, 'web', () => true);
  const original = [...keys.entries()];
  const retry = await persistConsentChoices(backend.client, A, required(), 'onboarding', keys, 'web', () => true);
  expect(retry.hasUnsettledWrites).toBe(true);
  expect(retry.matchesRequested).toBe(false);
  expect([...keys.entries()]).toEqual(original);
  expect(backend.calls).toHaveLength(2);
  expect(backend.calls[1]).toEqual(backend.calls[0]);
  expect(backend.state.ai_processing).toBe(false);
});

test('account change during baseline read prevents new consent writes', async () => {
  const backend = consentBackend(), reading = latch(), release = latch(), keys = new Map<string, string>();
  let current = true;
  backend.setBeforeRead(async () => { reading.release(); await release.promise; });
  const operation = persistConsentChoices(backend.client, A, { ...required(), ai_processing: true }, 'onboarding', keys, 'web', () => current);
  const rejected = expect(operation).rejects.toThrow('account_changed');
  await reading.promise; current = false; release.release(); await rejected;
  expect(backend.calls).toHaveLength(0);
  expect(keys.size).toBe(0);
});

test('pending consent for another actor is neither replayed nor discarded', async () => {
  const backend = consentBackend();
  const signature = JSON.stringify([B, 'ai_processing', true, CONSENT_POLICY_VERSIONS.ai_processing, 'onboarding', 'web']);
  const keys = new Map([[signature, 'fictional-other-actor-event']]);
  expect((await persistConsentChoices(backend.client, A, required(), 'onboarding', keys, 'web', () => true)).matchesRequested).toBe(true);
  expect(backend.calls).toHaveLength(0);
  expect(keys.get(signature)).toBe('fictional-other-actor-event');
});

test('old session replay acknowledgement cannot delete a newer pending event with the same consent signature', async () => {
  const backend = consentBackend(), oldStarted = latch(), oldRelease = latch();
  const signature = JSON.stringify([A, 'wellbeing_data', true, CONSENT_POLICY_VERSIONS.wellbeing_data, 'onboarding', 'web']);
  const oldKey = 'fictional-old-lost-event', keys = new Map([[signature, oldKey]]);
  const oldCall: ConsentCall = { p_purpose: 'wellbeing_data', p_action: 'granted', p_policy_version: CONSENT_POLICY_VERSIONS.wellbeing_data,
    p_source: 'onboarding', p_idempotency_key: oldKey, p_channel: 'web' };
  // The old grant committed, but a later separate consent event revoked it.
  // Replaying the old key returns its original ID without making it latest.
  backend.committed.set(oldKey, { signature: JSON.stringify(oldCall), id: 'fictional-old-committed-event' });
  let oldCurrent = true, oldReplayCount = 0;
  backend.setRecord(async (call, commit) => {
    if (call.p_idempotency_key === oldKey) {
      if (++oldReplayCount === 1) { oldStarted.release(); await oldRelease.promise; }
      return ok(commit());
    }
    return lost();
  });
  const obsolete = persistConsentChoices(backend.client, A, { ...required(), wellbeing_data: true }, 'onboarding', keys, 'web', () => oldCurrent);
  const rejected = expect(obsolete).rejects.toThrow('account_changed');
  await oldStarted.promise; oldCurrent = false; // A→B→A creates a new continuation.
  const newer = await persistConsentChoices(backend.client, A, { ...required(), wellbeing_data: true }, 'onboarding', keys, 'web', () => true);
  expect(newer.hasUnsettledWrites).toBe(true);
  const newerKey = keys.get(signature);
  expect(newerKey).toBeTruthy(); expect(newerKey).not.toBe(oldKey);
  oldRelease.release(); await rejected;
  expect(keys.get(signature)).toBe(newerKey);
});

test('session epoch invalidates A to B to A while preserving same-actor refresh', () => {
  observeLearnerSession(null); observeLearnerSession(A);
  const initial = learnerSessionGeneration();
  observeLearnerSession(A); expect(learnerSessionGeneration()).toBe(initial);
  observeLearnerSession(B); observeLearnerSession(A);
  expect(learnerSessionGeneration()).toBe(initial + 2);
  observeLearnerSession(null); expect(learnerSessionGeneration()).toBe(initial + 3);
});

function session(id = A) {
  return { access_token: id === A ? 'fictional-a-token' : 'fictional-b-token', refresh_token: 'fictional-refresh', token_type: 'bearer', expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600,
    user: { id, email: id === A ? 'a@example.test' : 'b@example.test', aud: 'authenticated', role: 'authenticated', email_confirmed_at: '2026-01-01T00:00:00Z', app_metadata: {}, user_metadata: {}, identities: [], created_at: '2026-01-01T00:00:00Z' } };
}
async function switchActor(page: Page, id: string) {
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
    const channel = new BroadcastChannel(key); channel.postMessage({ event: 'SIGNED_IN', session: value }); channel.close();
  }, { key: storageKey, value: session(id) });
}
async function browserBackend(page: Page, handle: (route: Route, path: string) => Promise<boolean>) {
  const profileReads = { [A]: 0, [B]: 0 };
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: storageKey, value: session() });
  await page.route('https://*.supabase.co/**', route => route.abort('blockedbyclient'));
  await page.route(origin + '/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (await handle(route, path)) return;
    const id = route.request().headers().authorization?.endsWith('fictional-b-token') ? B : A;
    if (path.endsWith('/profiles')) {
      profileReads[id]++;
      return route.fulfill({ json: { user_id: id, display_name: id === A ? 'Fixture A' : 'Fixture B', locale: 'vi-VN', body_display_preference: 'neutral' } });
    }
    if (path.endsWith('/get_my_consent_state')) return route.fulfill({ json: { ...required(), wellbeing_data: true, ai_processing: true } });
    if (path.endsWith('/get_my_consent_policy_versions')) return route.fulfill({ json: CONSENT_POLICY_VERSIONS });
    if (path.endsWith('/checkins') || path.endsWith('/checkin_observations')) return route.fulfill({ json: [] });
    if (path.endsWith('/mcy-ai-assistant')) return route.fulfill({ json: { available: false, contractVersion: 'reviewed-practice-1' } });
    if (path.endsWith('/user')) return route.fulfill({ json: session(id).user });
    // The Profile screen asks once whether this account has reading units to preview; a learner has none.
    if (path.endsWith('/owner-control-plane')) return route.fulfill({ status: 403, json: { error: 'content_review_access_required' } });
    if (path.endsWith('/teacher-collaboration')) return route.fulfill({ status: 404, json: { error: 'collaboration_unavailable' } });
    if (path.endsWith('/reading-published/manifest.json')) return route.fulfill({ status: 404, body: '' });
    throw Error('Unexpected synthetic browser request: ' + path);
  });
  return profileReads;
}

for (const returnToA of [false, true]) test(`delayed profile save cannot update a ${returnToA ? 'new A session after A to B to A' : 'different B account'}`, async ({ page }) => {
  const started = latch(), release = latch(); let writes = 0;
  const reads = await browserBackend(page, async (route, path) => {
    if (!path.endsWith('/profiles') || route.request().method() === 'GET') return false;
    expect(route.request().headers().authorization).toBe('Bearer fictional-a-token');
    expect(route.request().postDataJSON().user_id).toBe(A);
    writes++; started.release(); await release.promise;
    await route.fulfill({ json: {} }); return true;
  });
  await page.goto('/?mode=web');
  await page.locator('.flow-fixed-footer').getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await page.getByRole('button', { name: /Thông tin cá nhân/ }).click();
  await page.getByLabel('Tên hiển thị').fill('Obsolete A draft');
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click(); await started.promise;
  await switchActor(page, B); await expect.poll(() => reads[B]).toBeGreaterThan(0);
  if (returnToA) { const previous = reads[A]; await switchActor(page, A); await expect.poll(() => reads[A]).toBeGreaterThan(previous); }
  const response = page.waitForResponse(r => r.url().includes('/profiles') && r.request().method() !== 'GET');
  release.release(); await response;
  await page.getByRole('button', { name: 'Hủy', exact: true }).click();
  await expect(page.locator('.mcy-account-home h1')).toHaveText(returnToA ? 'Chào, Fixture A.' : 'Chào, Fixture B.');
  expect(writes).toBe(1);
});

test('delayed consent success cannot mutate a new same-account session after A to B to A', async ({ page }) => {
  const started = latch(), release = latch(); let writes = 0;
  const reads = await browserBackend(page, async (route, path) => {
    if (!path.endsWith('/record_my_consent')) return false;
    expect(route.request().headers().authorization).toBe('Bearer fictional-a-token');
    expect(route.request().postDataJSON().p_action).toBe('revoked');
    writes++; started.release(); await release.promise;
    await route.fulfill({ json: 'fictional-event-id' }); return true;
  });
  await page.goto('/?mode=web');
  await page.locator('.flow-fixed-footer').getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await page.getByRole('button', { name: /Quyền riêng tư và đồng ý/ }).click();
  const ai = page.locator('.mcy-toggle-row').filter({ hasText: 'Dùng check-in với trợ lý AI' });
  await ai.getByRole('button', { name: /Rút đồng ý/ }).click(); await started.promise;
  await switchActor(page, B); await expect.poll(() => reads[B]).toBeGreaterThan(0);
  const before = reads[A]; await switchActor(page, A); await expect.poll(() => reads[A]).toBeGreaterThan(before);
  const response = page.waitForResponse(r => r.url().endsWith('/record_my_consent')); release.release(); await response;
  await expect(ai.getByRole('button', { name: /Rút đồng ý/ })).toBeVisible();
  expect(writes).toBe(1);
});

test('check-in retry sends the exact frozen record and keeps later edits for a new key', async ({ page }) => {
  const requests: Record<string, unknown>[] = [];
  await browserBackend(page, async (route, path) => {
    if (!path.endsWith('/save_my_checkin_for_current_user_with_current_consent')) return false;
    expect(route.request().headers().authorization).toBe('Bearer fictional-a-token');
    const body = route.request().postDataJSON(); requests.push(body);
    if (requests.length === 1) { await route.abort('failed'); return true; }
    await route.fulfill({ json: [{ checkin_id: '55000000-0000-4000-8000-000000000001', created_at: '2026-10-11T08:00:00Z' }] }); return true;
  });
  await page.goto('/?mode=web');
  await page.getByRole('button', { name: 'Bắt đầu check-in', exact: true }).click();
  await page.getByRole('button', { name: 'Bình thường', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp: năng lượng và thời gian' }).click();
  await page.getByRole('button', { name: 'Bình thường', exact: true }).click();
  await page.getByRole('button', { name: 'Chỉ ghi lại cảm nhận hôm nay, không chọn bài', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Thử lại bản ghi trước', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Rất thấp', exact: true }).click();
  await page.getByRole('button', { name: 'Thử lại bản ghi trước', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Nháp vừa sửa vẫn được giữ' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(requests).toHaveLength(2); expect(requests[1]).toEqual(requests[0]);
  await expect(page.getByRole('button', { name: 'Rất thấp', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Chỉ ghi lại cảm nhận hôm nay, không chọn bài', exact: true }).click();
  await expect.poll(() => requests.length).toBe(3);
  expect(requests[2].p_idempotency_key).not.toBe(requests[0].p_idempotency_key);
  expect(requests[0].p_energy_level).toBe(2); expect(requests[2].p_energy_level).toBe(0);
});

for (const returnToA of [false, true]) test(`delayed check-in cannot navigate or restore a draft for ${returnToA ? 'a new A session after A to B to A' : 'a different B account'}`, async ({ page }) => {
  const started = latch(), release = latch(); let writes = 0;
  const reads = await browserBackend(page, async (route, path) => {
    if (!path.endsWith('/save_my_checkin_for_current_user_with_current_consent')) return false;
    expect(route.request().headers().authorization).toBe('Bearer fictional-a-token');
    expect(route.request().postDataJSON().p_expected_user_id).toBe(A);
    writes++; started.release(); await release.promise;
    await route.fulfill({ json: [{ checkin_id: '55000000-0000-4000-8000-000000000001', created_at: '2026-10-11T08:00:00Z' }] }); return true;
  });
  await page.goto('/?mode=web');
  await page.getByRole('button', { name: 'Bắt đầu check-in', exact: true }).click();
  await page.getByRole('button', { name: 'Bình thường', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp: năng lượng và thời gian' }).click();
  await page.getByRole('button', { name: 'Bình thường', exact: true }).click();
  await page.getByRole('button', { name: 'Chỉ ghi lại cảm nhận hôm nay, không chọn bài', exact: true }).click(); await started.promise;
  await switchActor(page, B); await expect.poll(() => reads[B]).toBeGreaterThan(0);
  if (returnToA) { const before = reads[A]; await switchActor(page, A); await expect.poll(() => reads[A]).toBeGreaterThan(before); }
  await expect(page.getByRole('heading', { name: 'Hôm nay, cơ thể bạn cảm thấy thế nào?', exact: true })).toBeVisible();
  const response = page.waitForResponse(r => r.url().endsWith('/save_my_checkin_for_current_user_with_current_consent'));
  release.release(); await (await response).json();
  // Returning to the account page also gives the completed continuation a turn;
  // a stale success must not push Journey or revive A's previous check-in.
  await page.getByRole('button', { name: 'Quay lại', exact: true }).click();
  await page.locator('.flow-fixed-footer').getByRole('button', { name: 'Cá nhân', exact: true }).click();
  await expect(page.locator('.mcy-account-home h1')).toHaveText(returnToA ? 'Chào, Fixture A.' : 'Chào, Fixture B.');
  expect(writes).toBe(1);
});

test('delayed check-in confirmation does not navigate away from the lesson library the learner opened', async ({ page }) => {
  const started = latch(), release = latch();
  await browserBackend(page, async (route, path) => {
    if (!path.endsWith('/save_my_checkin_for_current_user_with_current_consent')) return false;
    started.release(); await release.promise;
    await route.fulfill({ json: [{ checkin_id: '55000000-0000-4000-8000-000000000001', created_at: '2026-10-11T08:00:00Z' }] }); return true;
  });
  await page.goto('/?mode=web');
  await page.getByRole('button', { name: 'Bắt đầu check-in', exact: true }).click();
  await page.getByRole('button', { name: 'Bình thường', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp: năng lượng và thời gian' }).click();
  await page.getByRole('button', { name: 'Bình thường', exact: true }).click();
  await page.getByRole('button', { name: 'Chỉ ghi lại cảm nhận hôm nay, không chọn bài', exact: true }).click(); await started.promise;
  await page.getByRole('button', { name: 'Tự chọn bài học video miễn phí', exact: true }).click();
  await expect(page.locator('[data-testid="flow-current"] > [data-flow-route]')).toHaveAttribute('data-flow-route', 'discover');
  const response = page.waitForResponse(r => r.url().endsWith('/save_my_checkin_for_current_user_with_current_consent'));
  release.release(); await (await response).json();
  // Wait for the active library to become interactive after the response; a
  // stale continuation used to push Journey here and hide this learner choice.
  await page.getByRole('button', { name: /Cách chọn bài học video/ }).click();
  await expect(page.locator('[data-testid="flow-current"] > [data-flow-route]')).toHaveAttribute('data-flow-route', 'discover-detail');
});

test('leaving and returning to the library keeps the old check-in continuation inactive', async ({ page }) => {
  const started = latch(), release = latch();
  await browserBackend(page, async (route, path) => {
    if (!path.endsWith('/save_my_checkin_for_current_user_with_current_consent')) return false;
    started.release(); await release.promise;
    await route.fulfill({ json: [{ checkin_id: '55000000-0000-4000-8000-000000000001', created_at: '2026-10-11T08:00:00Z' }] }); return true;
  });
  await page.goto('/?mode=web');
  const active = page.getByTestId('flow-current');
  await page.getByRole('button', { name: 'Bắt đầu check-in', exact: true }).click();
  await page.getByRole('button', { name: 'Bình thường', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp: năng lượng và thời gian' }).click();
  await page.getByRole('button', { name: 'Bình thường', exact: true }).click();
  await page.getByRole('button', { name: 'Chỉ ghi lại cảm nhận hôm nay, không chọn bài', exact: true }).click(); await started.promise;
  await page.getByRole('button', { name: 'Tự chọn bài học video miễn phí', exact: true }).click();
  await page.getByRole('button', { name: /Cách chọn bài học video/ }).click();
  await expect(active).toHaveCount(1);
  await expect(active.locator('[data-flow-route]')).toHaveAttribute('data-flow-route', 'discover-detail');
  await page.getByRole('button', { name: 'Quay lại', exact: true }).click();
  await expect(active).toHaveCount(1);
  await expect(active.locator('[data-flow-route]')).toHaveAttribute('data-flow-route', 'discover');
  const response = page.waitForResponse(r => r.url().endsWith('/save_my_checkin_for_current_user_with_current_consent'));
  release.release(); await (await response).json();
  await active.getByRole('button', { name: /Cách chọn bài học video/ }).click();
  await expect(active).toHaveCount(1);
  await expect(active.locator('[data-flow-route]')).toHaveAttribute('data-flow-route', 'discover-detail');
});
