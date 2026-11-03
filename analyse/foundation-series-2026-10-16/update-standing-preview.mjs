import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>readFile(path.join(root,name),'utf8');
const save=(name,text)=>writeFile(path.join(root,name),text,'utf8');
const draft=JSON.parse((await read('standing-lesson.json')).replace(/^\uFEFF/,''));
if(draft.steps.length!==5 || new Set(draft.steps.map(s=>s.image)).size!==5) throw new Error('Expected five distinct step assets');
await save('standing-lesson.js',`"use strict";\n// Draft content for the local owner preview; not a publication approval.\nconst standingLessonDraft = ${JSON.stringify(draft,null,2)};\n`);
let preview=await read('preview.js');
const oldStart=preview.indexOf('  { id:"standing"');
const second=preview.indexOf('  { id:"tabletop"');
if(oldStart>=0&&second>oldStart) preview=preview.slice(0,oldStart)+'  null,\n'+preview.slice(second);
const replacements=[
 ['Hình concept · bản mẫu chưa dùng để hướng dẫn tập.','Bài 01 đã có nội dung và 5 hình riêng · bản nháp để đánh giá.'],
 ['<small>5 khung · đọc khoảng ${lesson.minutes} phút</small>','<small>${lesson.completeDraft?"5 bước · 5 hình riêng":"5 khung · đề cương"} · đọc khoảng ${lesson.minutes} phút</small>'],
 ['Cấu trúc, lời dẫn và hình ảnh là bản concept có AI hỗ trợ. Chưa có thẩm định chuyên môn. Trước khi dùng để tập, cần giáo viên hoàn thiện và duyệt toàn bộ bài, các phương án khác và cách kết thúc.','Bài 01 đã có lời hướng dẫn và năm hình riêng. Bài 02–03 còn ở mức đề cương với hình concept. Nội dung có AI hỗ trợ và chưa được giáo viên thẩm định; đây là bản để đánh giá trước khi tích hợp.'],
 ['Hình concept · kế hoạch minh họa là trạng thái đề xuất, không có buổi thực hành đang chạy.','Bài 01 là bản nháp với 5 hình riêng. Kế hoạch minh họa là trạng thái đề xuất.'],
 ['Ba hình là concept cho ba bài, được dùng lại qua các bước để xem bố cục. Chưa có đủ năm khung kỹ thuật riêng mỗi bài, chưa có audio và chưa duyệt chuyên môn.','Bài 01 đã có nội dung từng bước và năm hình riêng. Hai bài còn lại giữ ở mức đề cương. Chưa có audio hoặc thẩm định chuyên môn; bản xem trước dùng để đánh giá trước khi tích hợp.'],
 ['Xem mục tiêu và phần chuẩn bị dự kiến.','Xem mục tiêu và phần chuẩn bị của bài.']
];
for(const [from,to] of replacements) if(preview.includes(from)) preview=preview.replace(from,to);
await save('preview.js',preview);
let review=await read('review.html');
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const story=`<!-- standing-v2:start -->
    <section class="section" id="standing-v2" aria-labelledby="standing-v2-title">
      <div class="section-head"><div><p class="eyebrow">BÀI 01 · BẢN NỘI DUNG MỚI</p><h2 id="standing-v2-title">Đứng và nhận biết<br>điểm tựa.</h2></div><p>Năm bước đã có lời hướng dẫn và hình riêng. Mở từng bước trong bản tương tác để đánh giá cách đọc. Bản biên tập có AI hỗ trợ, chưa được giáo viên thẩm định.</p></div>
      <div class="actions"><a class="button" href="preview.html?lesson=standing">Mở bài 01 ↗</a><a class="text-link" href="STANDING-LESSON.vi.md">Đọc nội dung và nguồn đối chiếu ↗</a></div>
      <div class="standing-storyboard">${draft.steps.map((s,i)=>`<article class="standing-frame"><a href="preview.html?lesson=standing&amp;step=${i+1}"><img loading="lazy" src="${s.image}" alt="${esc(s.alt)}" width="1536" height="1024"></a><div><p class="eyebrow">BƯỚC ${i+1} / 5</p><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p><details><summary>Xem kỹ và lựa chọn khác</summary><p>${esc(s.detail)}</p><p>${esc(s.alternative)}</p></details><a class="text-link" href="preview.html?lesson=standing&amp;step=${i+1}">Mở bước ${i+1} trong bản mẫu ↗</a></div></article>`).join('')}</div>
      <p class="small-note">${esc(draft.stopCue)} ${esc(draft.readTimeNote)}</p>
    </section>
    <!-- standing-v2:end -->
    `;
if(review.includes('<!-- standing-v2:start -->')) review=review.replace(/<!-- standing-v2:start -->[\s\S]*?<!-- standing-v2:end -->\s*/,story);
else review=review.replace('<section class="section" id="series"',story+'<section class="section" id="series"');
review=review.replace('Ba hình dùng để xem phong cách và bố cục. Chưa phải bộ 15 hình kỹ thuật cho 15 khung nội dung.','Ba hình trên giữ lại hướng ban đầu của series. Bài 01 bên dưới đã được phát triển với năm hình riêng và nội dung từng bước; hai bài còn lại là đề cương.');
review=review.replace('<a href="#series">Ba bài mẫu</a>','<a href="#standing-v2">Bài 01 mới</a><a href="#series">Cấu trúc series</a>');
review=review.replace('<li>Nhìn toàn bộ</li><li>Nhận biết điểm tựa</li><li>Có những cách bắt đầu khác nhau</li><li>Biết lúc cần đổi hoặc dừng</li><li>Biết cách kết thúc</li>',draft.steps.map(s=>`<li>${esc(s.title)}</li>`).join(''));
review=review.replace('Chất liệu dự kiến: Tadasana<br>5 khung · đọc khoảng 3 phút','Nền đứng Tadasana · bản biên tập để đánh giá<br>5 bước · 5 hình riêng · đọc khoảng 3 phút');
review=review.replace('Bản tương tác có ba bài, điều hướng từng bước, phóng to, phản hồi hiểu bài và ngữ cảnh quay lại từ Hôm nay. Ba hình concept được dùng lại để kiểm bố cục.','Bài 01 có nội dung hoàn chỉnh để đánh giá và năm hình riêng. Bản mẫu có mục lục, phóng to đúng hình từng bước, xem lại và đường quay về Hôm nay. Hai bài còn lại giữ ở mức đề cương.');
await save('review.html',review);
process.stdout.write('Standing lesson data and review synchronized: 5 steps, 5 distinct image paths.\n');
