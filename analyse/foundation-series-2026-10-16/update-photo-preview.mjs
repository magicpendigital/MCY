import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root=path.dirname(fileURLToPath(import.meta.url));
const media=JSON.parse(await readFile(path.join(root,'assets/photo-media.json'),'utf8'));
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const evidence=[];
for(const id of ['standing','tabletop']) {
 if(media[id]?.length!==5) throw new Error(`${id}: expected five separate images`);
 for(const [index,item] of media[id].entries()) {
  if(item.image!==`assets/${id}-photo-${String(index+1).padStart(2,'0')}.png` || !item.alt) throw new Error('Unexpected media path or absent alt');
  const bytes=await readFile(path.join(root,item.image));
  if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a') throw new Error('Not a PNG');
  evidence.push({image:item.image,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
 }
}
if(new Set(evidence.map(item=>item.sha256)).size!==10) throw new Error('Duplicate media');
await writeFile(path.join(root,'photo-media.js'),`"use strict";\n// Photo overlay: original lesson copy and illustration files stay unchanged.\nconst photoMediaDraft = ${JSON.stringify(media,null,2)};\n`);

let report=await readFile(path.join(root,'review.html'),'utf8');
report=report.replace(/<nav aria-label="Mục trong đề xuất">.*?<\/nav>/,'<nav aria-label="Mục trong đề xuất"><a href="#photo-v3">Ảnh mới</a><a href="#series">Cấu trúc series</a><a href="#design">UI/UX</a><a href="#content-admin">Quản trị &amp; duyệt</a><a class="mini-cta" href="preview.html?lesson=tabletop">Mở bản tương tác ↗</a></nav>');
const groups=[['standing','01 · Đứng và nhận biết điểm tựa'],['tabletop','02 · Làm quen chuyển động Bò–Mèo']];
const photoSection=`<!-- PHOTO-V3-START -->
<section class="section" id="photo-v3" aria-labelledby="photo-v3-title">
 <div class="section-head"><div><p class="eyebrow">CẬP NHẬT PHONG CÁCH · V3 / PHOTO-DRAFT</p><h2 id="photo-v3-title">Gần với cảm giác<br>của màn Start.</h2></div><p>Mười ảnh AI riêng, giữ nhân vật, trang phục olive–kem và ánh sáng tự nhiên. Bộ minh họa v2 vẫn được giữ để so sánh. Đây là bản nháp thị giác, chưa được giáo viên thẩm định.</p></div>
 ${groups.map(([id,label])=>`<h3 class="photo-group-title">${label}</h3><div class="photo-strip">${media[id].map((item,i)=>`<a href="preview.html?lesson=${id}&amp;step=${i+1}"><img src="${escape(item.image)}" alt="${escape(item.alt)}" width="1536" height="1024" loading="lazy"><span>Bước ${i+1} · mở trong bài ↗</span></a>`).join('')}</div>`).join('')}
 <p class="small-note">Trong bản tương tác, chọn “Phong cách → Minh họa” để so với bộ v2 trên cùng bước. Thay ảnh tạo phiên bản nội dung mới và cần duyệt lại. Các storyboard bên dưới giữ nguyên bộ minh họa v2 để tham khảo.</p>
</section>
<!-- PHOTO-V3-END -->`;
report=report.replace(/<!-- PHOTO-V3-START -->[\s\S]*?<!-- PHOTO-V3-END -->\s*/,'');
report=report.replace('    <section class="section" id="standing-v2"',`${photoSection}\n    <section class="section" id="standing-v2"`);
const adminSection=`<!-- CONTENT-ADMIN-START -->
<section class="section" id="content-admin" aria-labelledby="content-admin-title">
 <div class="section-head"><div><p class="eyebrow">VẬN HÀNH NỘI DUNG · PHƯƠNG ÁN ĐỀ XUẤT</p><h2 id="content-admin-title">Giao đúng bài.<br>Duyệt đúng phiên bản.</h2></div><p>Source đã có nền tảng phân công và phiếu duyệt; hai bài mới chưa vào CMS. Teacher collaboration, Owner review và đường xuất bản hiện chưa thành một luồng hoàn chỉnh.</p></div>
 <div class="flow"><div class="flow-step"><b>01</b><strong>Soạn nháp</strong><p>Biên tập chữ, ảnh, alt, lựa chọn khác và nguồn media theo từng bước.</p></div><div class="flow-step"><b>02</b><strong>Gửi phiên bản</strong><p>Đóng băng chữ + ảnh thành một snapshot. Bản nháp tiếp theo không sửa bản đang duyệt.</p></div><div class="flow-step"><b>03</b><strong>Giao chuyên gia</strong><p>Giao đúng bài, phiên bản, phạm vi và thời hạn. Tác giả không tự duyệt.</p></div><div class="flow-step"><b>04</b><strong>Sửa hoặc duyệt</strong><p>Nhận xét tại từng bước; duyệt chuyên môn và kiểm quyền media được ghi riêng.</p></div><div class="flow-step"><b>05</b><strong>Xuất bản riêng</strong><p>Chỉ bản đã đủ kiểm tra mới vào danh mục. Có lịch sử và đường rút bản.</p></div></div>
 <div class="actions"><a class="button" href="admin-preview.html">Thử luồng quản trị mô phỏng ↗</a><a class="text-link" href="CONTENT-ADMIN-PROPOSAL.vi.md">Đọc phương án chi tiết ↗</a><a class="text-link" href="CONTENT-ADMIN-CURRENT.vi.md">Đối chiếu source hiện có ↗</a></div>
 <p class="scope">Demo dùng danh tính giả và trạng thái trong bộ nhớ; không cấp quyền hoặc xuất bản thật. Người soạn và reviewer làm việc trong app; vận hành Owner qua Miu/trusted adapter là hướng đề xuất cần xây nối. Bài bằng hình cần loại nội dung và checklist riêng, không dùng loại “giới thiệu” để bỏ qua duyệt tư thế.</p>
</section>
<!-- CONTENT-ADMIN-END -->`;
report=report.replace(/<!-- CONTENT-ADMIN-START -->[\s\S]*?<!-- CONTENT-ADMIN-END -->\s*/,'');
report=report.replace('    <section class="section" aria-labelledby="next-title">',`${adminSection}\n    <section class="section" aria-labelledby="next-title">`);
if(!report.includes('id="photo-v3"')||!report.includes('id="content-admin"')) throw new Error('Report insertion failed');
if(!report.includes('/* photo-v3 */')) report=report.replace('</style>',`/* photo-v3 */
.photo-group-title{margin:28px 0 15px}.photo-strip{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.photo-strip a{border:1px solid var(--border);border-radius:12px;overflow:hidden;text-decoration:none;background:var(--surface)}.photo-strip img{aspect-ratio:3/2;object-fit:contain}.photo-strip span{display:block;padding:9px 10px;font-size:11px}@media(max-width:700px){.photo-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.photo-strip a:last-child{grid-column:1/-1;max-width:360px}.top nav{flex-wrap:wrap}}
</style>`);
await writeFile(path.join(root,'review.html'),report);
await writeFile(path.join(root,'PHOTO-ASSET-CHECK.json'),JSON.stringify({scope:'local prototype only',count:10,unique:10,assets:evidence},null,2)+'\n');
process.stdout.write('PASS: 10 unique PNG assets; photo overlay and report updated.\n');
