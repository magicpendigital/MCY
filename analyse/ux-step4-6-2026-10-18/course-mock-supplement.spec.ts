import {test,expect} from '@playwright/test';
import {classifyRequest,MOCK_HTML} from './course-mock-network-guard.mjs';
// Hooks apply to these exact, unchanged imported tests. Their own page-route mocks
// keep precedence; the context handler is a deny-by-default network backstop.
const violations=new WeakMap<object,string[]>();
test.beforeEach(async({page,context})=>{
 const denied:string[]=[];violations.set(page,denied);
 page.on('request',request=>{const kind=classifyRequest(request.url());if(kind==='forbidden'||(kind==='mocked-frame'&&(request.method()!=='GET'||request.resourceType()!=='document')))denied.push('unexpected '+request.method()+' '+request.resourceType()+' '+request.url());});
 await context.route('**/*',async route=>{const request=route.request(),kind=classifyRequest(request.url());if(kind==='loopback')return route.continue();if(kind==='mocked-frame'){if(request.method()!=='GET'||request.resourceType()!=='document'){denied.push('non-frame use '+request.url());return route.abort('blockedbyclient');}return route.fulfill({status:200,contentType:'text/html',body:MOCK_HTML});}if(kind==='fixture')denied.push('unhandled synthetic fixture '+request.method()+' '+new URL(request.url()).pathname);return route.abort('blockedbyclient');});
});
test.afterEach(async({page},info)=>{const denied=violations.get(page)??[];await info.attach('network-guard.json',{body:JSON.stringify({status:denied.length?'FAIL':'PASS',violations:denied,framePolicy:'Only pinned tests static HTML or context synthetic HTML; real outbound denied by proxy and routing.'},null,2),contentType:'application/json'});expect(denied,'No unexpected or unhandled nonlocal request may occur').toEqual([]);});
import '../../.vercel/ux-step4-6-20261018/tests/ux-home.spec.ts';
import '../../.vercel/ux-step4-6-20261018/tests/ux-checkin-layout.spec.ts';
import '../../.vercel/ux-step4-6-20261018/tests/ux-energy-time.spec.ts';
import '../../.vercel/ux-step4-6-20261018/tests/ux-course-detail.spec.ts';
import '../../.vercel/ux-step4-6-20261018/tests/ux-reflection.spec.ts';
import '../../.vercel/ux-step4-6-20261018/tests/ux-save-feedback.spec.ts';
import '../../.vercel/ux-step4-6-20261018/tests/ux-journey-selection.spec.ts';
