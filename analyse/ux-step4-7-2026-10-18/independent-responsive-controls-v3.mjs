// Preparation-only core. No launch, server, candidate mutation, or top-level invocation.
import assert from 'node:assert/strict';
import {expect} from '@playwright/test';

export const controlCases=Object.freeze([
  {id:'independent-vi320-normal-and28-four-routes',locale:'vi',viewport:{width:320,height:568},query:'?mode=web',kind:'routes'},
  {id:'independent-en320-28-four-routes',locale:'en',viewport:{width:320,height:568},query:'?mode=web',kind:'routes'},
  {id:'independent-rapid-resize-edit-return',locale:'vi',viewport:{width:320,height:568},query:'?mode=web',kind:'resize'},
  {id:'independent-iphone-fitted-safearea',locale:'vi',viewport:{width:740,height:760},query:'?mode=review&device=iphone',kind:'device'},
  {id:'independent-pixel-fitted-safearea',locale:'vi',viewport:{width:740,height:760},query:'?mode=review&device=pixel-10',kind:'device'},
]);
export const enlargedNav='.mcy-bottom-nav button{font-size:28px!important;line-height:1.5!important}';
const current=p=>p.getByTestId('flow-current');
const nav=p=>p.getByTestId('mcy-app-navigation');
const labels={vi:['Hôm nay','Hành trình','Khám phá','Cá nhân'],en:['Today','Journey','Explore','Profile']};
const ids=['home','journey','discover','profile'];

export async function installIndependentGuard(page,origin){
  assert.equal(origin,'http://127.0.0.1:4195');
  const ledger={unexpected:[],capabilityReads:[],pageErrors:[],localMutations:[]};
  page.on('pageerror',e=>ledger.pageErrors.push(e.message));
  await page.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url()),method=request.method();
    if(url.origin===origin){
      if(method==='GET'||method==='HEAD')return route.continue();
      ledger.localMutations.push({path:url.pathname,method});return route.abort();
    }
    if(url.origin==='https://mcy-playwright.invalid'&&url.pathname==='/functions/v1/mcy-ai-assistant'&&url.search===''&&method==='POST'){
      let body;try{body=request.postDataJSON();}catch{}
      if(body&&body.action==='capability'&&Object.keys(body).length===1){
        ledger.capabilityReads.push({path:url.pathname,method});
        return route.fulfill({json:{available:false,contractVersion:'reviewed-practice-1'}});
      }
    }
    ledger.unexpected.push({origin:url.origin,path:url.pathname,method});return route.abort();
  });
  page.on('websocket',socket=>{const u=new URL(socket.url());if(u.origin!=='ws://127.0.0.1:4195')ledger.unexpected.push({origin:u.origin,path:u.pathname,method:'WEBSOCKET'});});
  return ledger;
}
export function assertIndependentLedger(ledger){assert.deepEqual(ledger.unexpected,[]);assert.deepEqual(ledger.localMutations,[]);assert.deepEqual(ledger.pageErrors,[]);}

async function settled(page,id){
  await expect(current(page)).toHaveCount(1);
  await expect(current(page).locator('[data-flow-active="true"]')).toHaveAttribute('data-flow-route',id);
  await expect(current(page).locator('[data-flow-active="true"]')).not.toHaveAttribute('inert','');
  await expect.poll(()=>current(page).evaluate(e=>Math.abs(e.getBoundingClientRect().left-e.parentElement.getBoundingClientRect().left))).toBeLessThan(.5);
  const content={home:'.mcy-home-page',journey:'.mcy-journey-page',discover:'.mcy-discover-page',profile:'.mcy-account-home','edit-profile':'.mcy-account-detail'}[id];if(content)await expect(current(page).locator(content)).toBeVisible();
  await current(page).evaluate(async e=>{await document.fonts.ready;await Promise.all([...e.querySelectorAll('img')].map(async image=>{if(!image.complete)await image.decode();if(!image.naturalWidth)throw Error('Active route image did not decode');}));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
}
async function enter(page,scenario,origin){
  await page.goto(origin+'/'+scenario.query,{waitUntil:'domcontentloaded'});await settled(page,'welcome');
  if(scenario.locale==='en')await page.locator('.mcy-language-toggle').click();
  await page.getByRole('button',{name:scenario.locale==='en'?'Explore as a guest':'Thử tìm hiểu như khách',exact:true}).click();
  await page.getByRole('button',{name:scenario.locale==='en'?'Browse free video lessons':'Tự chọn bài học miễn phí',exact:true}).click();
  await settled(page,'discover');await expect(nav(page)).toHaveCount(1);
}
async function styleReady(page,large){
  await expect.poll(()=>page.locator('.mcy-bottom-nav span').evaluateAll(nodes=>nodes.length===4&&nodes.every(n=>{
    const style=getComputedStyle(n),range=document.createRange();range.selectNodeContents(n);
    const footer=n.closest('.mcy-app-navigation'),scale=footer.getBoundingClientRect().width/footer.offsetWidth;
    const glyphs=[...range.getClientRects()];return !large||(style.fontSize==='28px'&&style.lineHeight==='42px'&&glyphs.length>0&&glyphs.every(r=>r.height/scale>=27));
  }))).toBe(true);
  await page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
  await expect.poll(()=>nav(page).evaluate(e=>Math.abs(Math.ceil(e.offsetHeight)-parseFloat(getComputedStyle(e.closest('.flow-stack')).getPropertyValue('--mcy-app-nav-height'))))).toBeLessThanOrEqual(1);
}
async function largeStyle(page){const tag=await page.addStyleTag({content:enlargedNav});await styleReady(page,true);return tag;}

export async function snapshot(page){return page.evaluate(()=>{
  const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height};};
  const active=document.querySelector('[data-testid="flow-current"]'),footer=document.querySelector('.mcy-app-navigation'),stack=document.querySelector('.flow-stack'),scroll=active?.querySelector('.mobile-scroll'),main=active?.querySelector('.mcy-page'),app=document.querySelector('.mobile-app-viewport');
  const scale=footer?footer.getBoundingClientRect().width/footer.offsetWidth:1;
  return{route:active?.querySelector('[data-flow-active="true"]')?.getAttribute('data-flow-route'),retainedScreens:document.querySelectorAll('.flow-screen').length,footer:rect(footer),layoutHeight:footer?.offsetHeight,scale,app:rect(app),header:rect(document.querySelector('.flow-fixed-header')),configured:stack?getComputedStyle(stack).getPropertyValue('--flow-footer-height').trim():null,measured:stack?getComputedStyle(stack).getPropertyValue('--mcy-app-nav-height').trim():null,inset:stack?parseFloat(getComputedStyle(stack).getPropertyValue('--keyboard-height')):null,safe:scroll?parseFloat(getComputedStyle(scroll).getPropertyValue('--mobile-safe-area-height'))||0:0,pagePadding:main?parseFloat(getComputedStyle(main).paddingBottom):null,scroll:scroll?{rect:rect(scroll),top:scroll.scrollTop,max:scroll.scrollHeight-scroll.clientHeight,width:scroll.scrollWidth,client:scroll.clientWidth,padding:parseFloat(getComputedStyle(scroll).scrollPaddingBottom)}:null,last:rect(main?.lastElementChild),activeElement:{tag:document.activeElement?.tagName,text:document.activeElement?.textContent?.slice(0,80)},controls:[...(footer?.querySelectorAll('button')??[])].map(button=>{const span=button.querySelector('span'),range=document.createRange();range.selectNodeContents(span);return{text:span.textContent,button:rect(button),ranges:[...range.getClientRects()].map(r=>({top:r.top,bottom:r.bottom,left:r.left,right:r.right})),font:getComputedStyle(span).fontSize};})};
});}
function navBounds(g){
  assert(g.footer&&g.controls.length===4,JSON.stringify(g));assert(g.scale>0&&g.scale<=1.01);assert.equal(g.configured,'0px');
  assert(Math.abs(parseFloat(g.measured)-g.layoutHeight)<=1,JSON.stringify(g));assert(g.layoutHeight>=68);
  assert(Math.abs(g.footer.height/g.scale-g.layoutHeight)<=1,JSON.stringify(g));
  assert(Math.abs((g.app.bottom-g.footer.bottom)/g.scale-g.inset)<=1.5,JSON.stringify(g));
  assert(g.scroll.width<=g.scroll.client+1,JSON.stringify(g));
  assert(g.pagePadding>=g.layoutHeight+g.safe+(g.route==='profile'?35:27),JSON.stringify(g));
  assert(g.scroll.padding>=g.layoutHeight+g.safe+23,JSON.stringify(g));
  const widths=g.controls.map(c=>c.button.right-c.button.left);assert(Math.max(...widths)-Math.min(...widths)<=1);
  for(const c of g.controls)for(const r of c.ranges)for(const b of[c.button,g.footer])assert(r.left>=b.left-.5&&r.right<=b.right+.5&&r.top>=b.top-.5&&r.bottom<=b.bottom+.5,JSON.stringify({c,g}));
}
async function tabUntil(page,selector,max=70){for(let i=0;i<max;i++){await page.keyboard.press('Tab');if(await page.evaluate(s=>document.activeElement?.matches(s),selector))return;}throw Error('Unreachable with actual Tab: '+selector);}
async function focusBounds(page,insideNav){
  let data;await expect.poll(async()=>{data=await page.evaluate(inside=>{
    const e=document.activeElement,rect=e.getBoundingClientRect(),style=getComputedStyle(e),footer=document.querySelector('.mcy-app-navigation').getBoundingClientRect(),header=document.querySelector('.flow-fixed-header').getBoundingClientRect(),scale=footer.width/document.querySelector('.mcy-app-navigation').offsetWidth,ring=(parseFloat(style.outlineWidth)+parseFloat(style.outlineOffset))*scale;
    return{rect:{top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right},footer:{top:footer.top,bottom:footer.bottom,left:footer.left,right:footer.right},headerBottom:header.bottom,ring,layoutRing:ring/scale,visible:e.matches(':focus-visible'),inside};
  },insideNav);const g=data,r=g.rect,f=g.footer;return g.visible&&g.layoutRing>=6&&(insideNav?r.top-g.ring>=f.top-.5&&r.bottom+g.ring<=f.bottom+.5&&r.left-g.ring>=f.left-.5&&r.right+g.ring<=f.right+.5:r.top-g.ring>=g.headerBottom-.5&&r.bottom+g.ring<=f.top+.5);}).toBe(true);return data;
}
async function fourRings(page){const result=[];for(let i=0;i<4;i++){await tabUntil(page,`.mcy-app-navigation button:nth-child(${i+1})`);result.push(await focusBounds(page,true));}return result;}
async function contentEnd(page){await current(page).locator('.mobile-scroll').evaluate(e=>{e.scrollTop=e.scrollHeight;});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(r)));const g=await snapshot(page);assert(g.last.bottom<=g.footer.top+.5,JSON.stringify(g));return g;}
async function routeControls(page,scenario){const states=[];for(let i=0;i<4;i++){const old=await current(page).elementHandle();await nav(page).getByRole('button',{name:labels[scenario.locale][i],exact:true}).click();await settled(page,ids[i]);await styleReady(page,true);const g=await snapshot(page),newRouteNode=await old.evaluate(e=>e!==document.querySelector('[data-testid="flow-current"]'));await old.dispose();assert(newRouteNode,'Different destination must create a new route node');assert.equal(g.scroll.top,0,'Fresh nav replacement starts at top');navBounds(g);states.push({geometry:g,newRouteNode,rings:await fourRings(page),end:await contentEnd(page)});}return states;}
async function tabRow(page,index){for(let i=0;i<70;i++){await page.keyboard.press('Tab');if(await page.evaluate(n=>document.activeElement===document.querySelectorAll('[data-testid="flow-current"] .mcy-account-home .mcy-account-row')[n],index))return;}throw Error('Profile row not reachable with Tab: '+index);}
async function profileRows(page){const results=[];await tabRow(page,0);results.push(await focusBounds(page,false));await tabRow(page,8);results.push(await focusBounds(page,false));return results;}
async function editReturn(page,simulator){
  await nav(page).getByRole('button',{name:'Cá nhân',exact:true}).click();await settled(page,'profile');
  await tabRow(page,0);await focusBounds(page,false);const before=await snapshot(page),retained=await current(page).elementHandle();
  await page.keyboard.press('Enter');const transition=[];for(let i=0;i<3;i++){transition.push(await snapshot(page));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(r)));}
  await settled(page,'edit-profile');await expect(nav(page)).toHaveCount(0);
  const absent=await snapshot(page);assert.equal(absent.measured,'');assert.equal(absent.scroll.top,0,'New detail starts at top');
  await current(page).getByLabel('Tên hiển thị',{exact:true}).click();
  if(simulator)await expect(current(page).locator('.mobile-page')).toHaveAttribute('data-keyboard-visible','true');
  const input=await snapshot(page);await page.getByRole('button',{name:'Quay lại',exact:true}).click();await settled(page,'profile');await styleReady(page,true);
  if(simulator)await expect(current(page).locator('.mobile-page')).toHaveAttribute('data-keyboard-visible','false');
  const after=await snapshot(page),retainedRouteNodeRestored=await retained.evaluate(e=>e===document.querySelector('[data-testid="flow-current"]'));await retained.dispose();assert(retainedRouteNodeRestored,'Returning detail must restore retained Profile node');navBounds(after);await tabRow(page,0);const ring=await focusBounds(page,false);const end=await contentEnd(page);
  return{before,transition,absent,input,after,retainedRouteNodeRestored,ring,end,scrollDelta:after.scroll.top-before.scroll.top};
}
async function retainedEndControl(page,record){
  const scroll=await current(page).locator('.mobile-scroll').elementHandle(),screen=await current(page).elementHandle();
  const read=()=>scroll.evaluate(e=>{const last=e.querySelector('main').lastElementChild,r=last.getBoundingClientRect();return{top:e.scrollTop,height:e.scrollHeight,client:e.clientHeight,padding:parseFloat(getComputedStyle(e.querySelector('main')).paddingBottom),last:{top:r.top,bottom:r.bottom}};});
  await scroll.evaluate(e=>{e.scrollTop=e.scrollHeight;});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(r)));
  const before={retained:await read(),current:await snapshot(page)};assert(before.retained.top>0,'True end must have nonzero scrollTop');
  // Deliberately invoke only the existing handler, with no offscreen auto-scroll.
  await current(page).getByRole('button',{name:/Thông tin cá nhân/}).evaluate(e=>e.click());
  const during=[];for(let i=0;i<3;i++){during.push({retained:await read(),current:await snapshot(page)});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(r)));}
  await settled(page,'edit-profile');const detail={retained:await read(),current:await snapshot(page)};
  await page.getByRole('button',{name:'Quay lại',exact:true}).click();await settled(page,'profile');await styleReady(page,true);
  const after={retained:await read(),current:await snapshot(page),sameNode:await screen.evaluate(e=>e===document.querySelector('[data-testid="flow-current"]'))};
  await scroll.dispose();await screen.dispose();const evidence={probe:'handler-only-true-end-no-autoscroll',before,during,detail,after};record({phase:'retained-end-observation',evidence});
  assert(after.sameNode,'Original Profile node must return');
  for(const state of[...during,detail])assert(state.retained.top>=before.retained.top-2,JSON.stringify(evidence));
  assert(Math.abs(after.retained.top-before.retained.top)<=2,JSON.stringify(evidence));
  assert(Math.abs(after.retained.last.bottom-before.retained.last.bottom)<=3,JSON.stringify(evidence));
  return evidence;
}

export async function runIndependentControl(page,scenario,origin,record){
  assert(controlCases.some(c=>c.id===scenario.id));await enter(page,scenario,origin);const result={};
  if(scenario.locale==='vi'){const ordinary=await snapshot(page);navBounds(ordinary);result.ordinary={geometry:ordinary,rings:await fourRings(page)};}
  let style=await largeStyle(page);
  if(scenario.kind==='routes'){result.routes=await routeControls(page,scenario);if(scenario.locale==='vi')result.profileRows=await profileRows(page);}
  if(scenario.kind==='resize'){
    await nav(page).getByRole('button',{name:'Cá nhân',exact:true}).click();await settled(page,'profile');
    await page.setViewportSize({width:390,height:568});await style.evaluate(e=>e.remove());await page.setViewportSize({width:320,height:568});style=await largeStyle(page);
    result.afterRapid=await snapshot(page);navBounds(result.afterRapid);result.retainedEnd=await retainedEndControl(page,record);result.restore=await editReturn(page,false);
  }
  if(scenario.kind==='device'){
    const scaled=await snapshot(page);navBounds(scaled);assert(scaled.scale<1,'A fitted scale below1 is required');result.scaled=scaled;result.rings=await fourRings(page);result.restore=await editReturn(page,true);
  }
  record(result);return result;
}
