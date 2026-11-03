import {chromium} from '@playwright/test';import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge'}),results=[];
try{for(const [width,height] of [[320,568],[390,844],[1440,1000]]){
 const page=await browser.newPage({viewport:{width,height}});await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await page.goto('http://127.0.0.1:4192/?mode=web');await page.getByRole('button',{name:'Thử tìm hiểu như khách',exact:true}).click();
 await page.getByRole('button',{name:'Tiếp: năng lượng và thời gian',exact:true}).click();await page.getByRole('button',{name:'Tự chọn bài học video miễn phí',exact:true}).click();
 await page.getByRole('button',{name:/Một chút chuyển động nhẹ/}).click();await page.waitForTimeout(700);
 await page.screenshot({path:`analyse/ux-step4-4-2026-10-17/early-${width}.png`,animations:'disabled'});
 results.push({width,height,heading:await page.locator('.mcy-course-featured-copy h2').boundingBox(),play:await page.locator('.mcy-course-play').boundingBox(),video:await page.locator('.mcy-course-video').boundingBox(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 await page.close();
}}finally{await browser.close();}
fs.writeFileSync('analyse/ux-step4-4-2026-10-17/early.json',JSON.stringify(results,null,2)+'\n');console.log(results);
