import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>readFile(path.join(root,name),'utf8');
const save=(name,text)=>writeFile(path.join(root,name),text,'utf8');
const draft=JSON.parse((await read('tabletop-lesson.json')).replace(/^\uFEFF/,''));
if(draft.id!=='tabletop'||draft.steps.length!==5||draft.reviewOptions.length!==5||new Set(draft.steps.map(s=>s.image)).size!==5) throw new Error('Expected tabletop lesson with five steps and distinct assets');
await save('tabletop-lesson.js',`"use strict";\n// Draft content for the local owner preview; not a publication approval.\nconst tabletopLessonDraft = ${JSON.stringify(draft,null,2)};\n`);
const lessonDoc=`# ${draft.title} — nội dung và 5 hình riêng\n\n16/10/2026 · ${draft.status}.\n\nBản này thay phần đề cương bài 02 trong bản xem trước để Owner đánh giá, chưa phải phê duyệt tích hợp hoặc phát hành cho người học.\n\n## Mục tiêu và phạm vi\n\n${draft.intro}\n\n${draft.goal.map(s=>'- '+s).join('\n')}\n\n${draft.audience}\n\n${draft.material}\n\n## Chuẩn bị\n\n${draft.preparation.map(s=>'- '+s).join('\n')}\n\n**Khi cần dừng:** ${draft.stopCue}\n\n${draft.readTimeNote}\n\n${draft.steps.map((s,i)=>`## Bước ${i+1} · ${s.title}\n\n![${s.alt}](${s.image})\n\n**Nội dung chính:** ${s.body}\n\n**Xem kỹ:** ${s.detail}\n\n**Một lựa chọn khác:** ${s.alternative}\n\n**Chú thích:** ${s.caption}\n`).join('\n')}\n## Nhìn lại và chọn tiếp\n\n${draft.ending}\n\n${draft.reviewQuestion} ${draft.reviewOptions.join(' / ')}. Lựa chọn mở lại bước tương ứng, không ghi cảm nhận sức khỏe hoặc suy ra đã thực hành.\n\n## Nguồn đối chiếu và giới hạn\n\nCác nguồn được đối chiếu ngày 16/10/2026 bởi agent rà soát. Nội dung dưới đây là tổng hợp biên tập tiếng Việt, không phải giáo án được các tổ chức này phê duyệt. Không sao chép ảnh/video của nguồn.\n\n${draft.sources.map(s=>`- [${s.title}](${s.url}): ${s.use}`).join('\n')}\n\n**Các quyết định biên tập cần giáo viên kiểm:** cấu trúc năm bước, điểm dừng giữa hai hướng, khoảng chuyển động nhỏ theo cảm nhận, hơi thở tự nhiên khi chưa phối hợp được, phạm vi người dùng tự xuống/rời sàn và tính đầy đủ của lời hướng dẫn cùng năm hình. Không có nguồn nào chứng nhận bộ hình AI hoặc phê duyệt bài MCY.\n\nHình 01/03/05 cùng là nền bốn điểm tựa ở những thời điểm khác nhau; không yêu cầu lưng hoàn toàn phẳng. Hình 05 đổi góc nhìn, không yêu cầu xoay người. Năm hình tĩnh không mô tả tốc độ hay toàn bộ chuyển động; chưa có audio hoặc clip trong bản này.\n\nDữ liệu gốc: tabletop-lesson.json. Prompt, nguồn hình và kiểm pixels: assets/TABLETOP-IMAGES.vi.md. Việc đánh giá bản xem trước cục bộ không thay thế thẩm định chuyên môn, thử với người dùng mục tiêu hoặc các cổng phát hành hiện có.\n`;
await save('TABLETOP-LESSON.vi.md',lessonDoc);
let preview=await read('preview.js');
const oldStart=preview.indexOf('  { id:"tabletop"');
const restStart=preview.indexOf('  { id:"rest"');
if(oldStart>=0&&restStart>oldStart) preview=preview.slice(0,oldStart)+'  null,\n'+preview.slice(restStart);
preview=preview.replace('if(lesson.completeDraft) return `<p class="eyebrow">MỘT CHÚT NỀN TẢNG · BÀI 01</p>','if(lesson.completeDraft) return `<p class="eyebrow">MỘT CHÚT NỀN TẢNG · BÀI ${String(state.lesson+1).padStart(2,"0")}</p>');
if(!preview.includes(' const finishLead=')) preview=preview.replace('const lesson=title(), response=state.understanding.get(state.lesson);','const lesson=title(), response=state.understanding.get(state.lesson);\n const finishLead=lesson.id==="standing"?"Nhận biết điểm tựa, giữ quyền điều chỉnh và chọn điều tiếp theo theo nhịp của bạn.":lesson.ending?.replace(/^Bạn đã đến cuối phần đọc\\.\\s*/,"");');
preview=preview.replace('<p class="lead">Nhận biết điểm tựa, giữ quyền điều chỉnh và chọn điều tiếp theo theo nhịp của bạn.</p>','<p class="lead">${esc(finishLead)}</p>');
preview=preview.replace('<button type="button" class="text-button full" data-action="lesson" data-lesson="1">Xem đề cương bài 2: Chuyển động Bò–Mèo</button>','${state.lesson<2?`<button type="button" class="text-button full" data-action="lesson" data-lesson="${state.lesson+1}">${lessons[state.lesson+1].completeDraft?"Xem bài":"Xem đề cương bài"} ${state.lesson+2}: ${lessons[state.lesson+1].short}</button>`:""}');
const replacements=[
 ['Bài 01 đã có nội dung và 5 hình riêng · bản nháp để đánh giá.','Bài 01–02 đã có nội dung và 5 hình riêng mỗi bài · bản nháp để đánh giá.'],
 ['Bài 01 đã có lời hướng dẫn và năm hình riêng. Bài 02–03 còn ở mức đề cương với hình concept.','Bài 01–02 đã có lời hướng dẫn và năm hình riêng mỗi bài. Bài 03 còn ở mức đề cương với hình concept.'],
 ['Bài 01 đã có nội dung từng bước và năm hình riêng. Hai bài còn lại giữ ở mức đề cương.','Bài 01–02 đã có nội dung từng bước và năm hình riêng mỗi bài. Bài 03 giữ ở mức đề cương.']
];
for(const [from,to]of replacements)preview=preview.replaceAll(from,to);
await save('preview.js',preview);
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let review=await read('review.html');
const story=`<!-- tabletop-v2:start -->
    <section class="section" id="tabletop-v2" aria-labelledby="tabletop-v2-title">
      <div class="section-head"><div><p class="eyebrow">BÀI 02 · NỘI DUNG VÀ 5 HÌNH RIÊNG</p><h2 id="tabletop-v2-title">Làm quen chuyển động<br>Bò–Mèo.</h2></div><p>Năm hình đi qua điểm bắt đầu, Bò, vị trí giữa, Mèo và trở về. Cùng nhân vật và cách đọc với bài đầu. Bản biên tập có AI hỗ trợ, chưa được giáo viên thẩm định.</p></div>
      <div class="actions"><a class="button" href="preview.html?lesson=tabletop">Mở bài 02 ↗</a><a class="text-link" href="TABLETOP-LESSON.vi.md">Đọc nội dung và nguồn đối chiếu ↗</a></div>
      <div class="standing-storyboard">${draft.steps.map((s,i)=>`<article class="standing-frame"><a href="preview.html?lesson=tabletop&amp;step=${i+1}"><img loading="lazy" src="${s.image}" alt="${esc(s.alt)}" width="1536" height="1024"></a><div><p class="eyebrow">BƯỚC ${i+1} / 5</p><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p><details><summary>Xem kỹ và lựa chọn khác</summary><p>${esc(s.detail)}</p><p>${esc(s.alternative)}</p></details><a class="text-link" href="preview.html?lesson=tabletop&amp;step=${i+1}">Mở bước ${i+1} của bài 02 ↗</a></div></article>`).join('')}</div>
      <p class="small-note">${esc(draft.stopCue)} ${esc(draft.readTimeNote)}</p>
    </section>
    <!-- tabletop-v2:end -->
    `;
if(review.includes('<!-- tabletop-v2:start -->'))review=review.replace(/<!-- tabletop-v2:start -->[\s\S]*?<!-- tabletop-v2:end -->\s*/,story);
else review=review.replace('<section class="section" id="series"',story+'<section class="section" id="series"');
review=review.replace('<a href="#standing-v2">Bài 01 mới</a>','<a href="#standing-v2">Bài 01</a><a href="#tabletop-v2">Bài 02 mới</a>');
review=review.replace('Bài 01 bên dưới đã được phát triển với năm hình riêng và nội dung từng bước; hai bài còn lại là đề cương.','Bài 01–02 bên dưới đã được phát triển với năm hình riêng mỗi bài và nội dung từng bước. Bài 03 giữ ở mức đề cương.');
review=review.replace('Chất liệu dự kiến: Bò–Mèo<br>5 khung · đọc khoảng 4 phút','Bò–Mèo · bản biên tập để đánh giá<br>5 bước · 5 hình riêng · đọc khoảng 4 phút');
review=review.replace('<li>Nhận biết điểm bắt đầu</li><li>Nhìn một phần của chuyển động</li><li>Theo dõi đoạn chuyển</li><li>Xem một phương án khác</li><li>Trở về và kết thúc</li>',draft.steps.map(s=>`<li>${esc(s.title)}</li>`).join(''));
review=review.replace('Bài 01 có nội dung hoàn chỉnh để đánh giá và năm hình riêng. Bản mẫu có mục lục, phóng to đúng hình từng bước, xem lại và đường quay về Hôm nay. Hai bài còn lại giữ ở mức đề cương.','Bài 01–02 có nội dung để đánh giá và năm hình riêng mỗi bài. Bản mẫu dùng chung mục lục, phóng to đúng hình từng bước, xem lại và đường quay về Hôm nay. Bài 03 giữ ở mức đề cương.');
await save('review.html',review);
process.stdout.write('Tabletop draft synchronized: five steps and five distinct image paths.\n');
