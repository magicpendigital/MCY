import fs from 'node:fs';
const p='.vercel/ux-step4-5-20261017/tests/ux-reflection.spec.ts';let s=fs.readFileSync(p,'utf8');
s=s.slice(0,s.indexOf("for(const english of [false,true])for(const large"))+`
async function footerBounds(page:Page){
 const g=await page.evaluate(()=>{
  const box=(e:Element)=>{const r=e.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height,client:e.clientWidth,scroll:e.scrollWidth};};
  const footer=document.querySelector('.flow-fixed-footer')!,viewport=document.querySelector('.mobile-app-viewport')!;
  const buttons=[...footer.querySelectorAll('button')].map(e=>{const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),text=[];let node;while(node=walker.nextNode()){if(!node.textContent?.trim())continue;const range=document.createRange();range.selectNodeContents(node);for(const r of range.getClientRects())text.push({left:r.left,right:r.right,top:r.top,bottom:r.bottom});}const style=getComputedStyle(e);return{...box(e),text,font:parseFloat(style.fontSize),ring:parseFloat(style.outlineWidth)+parseFloat(style.outlineOffset)};});
  return{footer:box(footer),viewport:box(viewport),safe:parseFloat(getComputedStyle(document.querySelector('.mobile-page')!).getPropertyValue('--mobile-safe-area-height'))||0,buttons};
 });
 expect(g.buttons).toHaveLength(2);expect(g.footer.left).toBeGreaterThanOrEqual(g.viewport.left);expect(g.footer.right).toBeLessThanOrEqual(g.viewport.right);
 expect(g.footer.bottom).toBeLessThanOrEqual(g.viewport.bottom-g.safe+.5);
 for(const b of g.buttons){expect(b.left-g.footer.left).toBeGreaterThanOrEqual(16);expect(g.footer.right-b.right).toBeGreaterThanOrEqual(16);expect(b.width).toBeGreaterThanOrEqual(44);expect(b.height).toBeGreaterThanOrEqual(44);expect(b.top-g.footer.top).toBeGreaterThanOrEqual(6);expect(g.footer.bottom-b.bottom).toBeGreaterThanOrEqual(6);expect(b.scroll).toBeLessThanOrEqual(b.client);for(const r of b.text){expect(r.left).toBeGreaterThanOrEqual(b.left);expect(r.right).toBeLessThanOrEqual(b.right+.5);expect(r.top).toBeGreaterThanOrEqual(b.top);expect(r.bottom).toBeLessThanOrEqual(b.bottom+.5);}}
 expect(g.buttons[1].left-g.buttons[0].right).toBeGreaterThanOrEqual(8);
 for(const b of await page.locator('.mcy-reflection-footer button').all()){await b.focus();const f=await b.evaluate(e=>{const r=e.getBoundingClientRect(),f=e.closest('footer')!.getBoundingClientRect(),s=getComputedStyle(e),ring=parseFloat(s.outlineWidth)+parseFloat(s.outlineOffset);return{ring,top:r.top-f.top,bottom:f.bottom-r.bottom,left:r.left-f.left,right:f.right-r.right};});expect(f.ring).toBe(6);for(const side of ['top','bottom','left','right'] as const)expect(f[side]).toBeGreaterThanOrEqual(f.ring);}
 return g;
}
for(const english of [false,true])for(const large of [false,true])for(const width of [320,390])test('Footer bounds and actual focus '+english+' '+large+' '+width,async({page})=>{await page.setViewportSize({width,height:568});await enter(page,{english});if(large)await page.addStyleTag({content:'.mcy-reflection-footer button{font-size:28px!important;line-height:1.5!important}'});const g=await footerBounds(page);if(large)for(const b of g.buttons)expect(b.font).toBe(28);fs.writeFileSync('analyse/ux-step4-5-2026-10-17/footer-final-'+english+'-'+large+'-'+width+'.json',JSON.stringify(g,null,2));});
for(const device of ['iphone','pixel-10'])for(const english of [false,true])test('Simulator footer safe area and actual focus '+device+' '+english,async({page})=>{await enter(page,{query:'?mode=review&device='+device,english});await footerBounds(page);await page.addStyleTag({content:'.mcy-reflection-footer button{font-size:28px!important;line-height:1.5!important}'});const g=await footerBounds(page);for(const b of g.buttons)expect(b.font).toBe(28);fs.writeFileSync('analyse/ux-step4-5-2026-10-17/footer-final-'+device+'-'+english+'.json',JSON.stringify(g,null,2));});
`;
fs.writeFileSync(p,s);console.log('Footer checks assert text, touch, inset, ring, overlap and safe-area bounds.');
