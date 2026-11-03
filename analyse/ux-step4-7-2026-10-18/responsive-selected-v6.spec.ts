import { test, expect } from '@playwright/test';
import { classifyRequest, MOCK_HTML } from './responsive-network-guard.mjs';

const violations = new WeakMap<object, string[]>();
test.beforeEach(async ({ page, context }) => {
  const denied: string[] = [];
  violations.set(page, denied);
  page.on('request', request => {
    const kind = classifyRequest(request.url());
    if (kind === 'forbidden' || (kind === 'mocked-frame' && (request.method() !== 'GET' || request.resourceType() !== 'document'))) denied.push('unexpected ' + request.method() + ' ' + request.resourceType() + ' ' + request.url());
  });
  await context.route('**/*', async route => {
    const request = route.request(), kind = classifyRequest(request.url());
    if (kind === 'loopback') return route.continue();
    if (kind === 'mocked-frame') {
      if (request.method() !== 'GET' || request.resourceType() !== 'document') { denied.push('non-frame use ' + request.url()); return route.abort('blockedbyclient'); }
      return route.fulfill({ status: 200, contentType: 'text/html', body: MOCK_HTML });
    }
    if (kind === 'fixture') denied.push('unhandled synthetic fixture ' + request.method() + ' ' + new URL(request.url()).pathname);
    return route.abort('blockedbyclient');
  });
});
test.afterEach(async ({ page }, info) => {
  const denied = violations.get(page) ?? [];
  await info.attach('network-guard.json', { body: JSON.stringify({ status: denied.length ? 'FAIL' : 'PASS', violations: denied, framePolicy: 'Exact synthetic player HTML; deny proxy and route guard prevent real outbound media/backend.' }, null, 2), contentType: 'application/json' });
  expect(denied, 'No unexpected or unhandled nonlocal request may occur').toEqual([]);
});

import '../../.vercel/ux-step4-7-20261018-v5/tests/ux-responsive.spec.ts';
import '../../.vercel/ux-step4-7-20261018-v5/tests/ux-home.spec.ts';
import '../../.vercel/ux-step4-7-20261018-v5/tests/ux-checkin-layout.spec.ts';
import '../../.vercel/ux-step4-7-20261018-v5/tests/ux-profile.spec.ts';
import '../../.vercel/ux-step4-7-20261018-v5/tests/ux-reflection.spec.ts';
import '../../.vercel/ux-step4-7-20261018-v5/tests/ux-course-detail.spec.ts';
import '../../.vercel/ux-step4-7-20261018-v5/tests/ux-journey-selection.spec.ts';
import '../../.vercel/ux-step4-7-20261018-v5/tests/mobile-runtime.spec.ts';
