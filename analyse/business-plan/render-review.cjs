// Generates the review document only; does not build or modify the application.
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const files = fs.readdirSync(root).filter(n => /^0[1-6]_.*\.md$/.test(n)).sort();
if (files.length !== 6) throw new Error('Expected six review chapters');
const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
function inline(s) {
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => `@@CODE${codes.push(c)-1}@@`);
  s = escape(s).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return s.replace(/@@CODE(\d+)@@/g, (_, i) => '<code>'+escape(codes[+i])+'</code>');
}
function render(md, chapter) {
  const lines = md.replaceAll('\r\n','\n').split('\n');
  let output = [], toc = [], title = '', i = 0, h = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('```')) {
      let block = []; i++;
      while (i < lines.length && !lines[i].startsWith('```')) block.push(lines[i++]);
      i++; output.push('<pre><code>'+escape(block.join('\n'))+'</code></pre>'); continue;
    }
    const heading = /^(#{1,3}) (.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length, id = `c${chapter}-h${++h}`;
      if (level === 1) title = heading[2];
      if (level === 2) toc.push({id,text:heading[2]});
      output.push(`<h${level} id="${id}">${inline(heading[2])}</h${level}>`); i++; continue;
    }
    if (line.startsWith('|')) {
      const rows=[];
      while (i < lines.length && lines[i].startsWith('|')) {
        const cells=lines[i++].trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());
        if (cells.every(c=>/^:?-+:?$/.test(c))) continue;
        rows.push(cells);
      }
      const width=rows[0].length;
      if (rows.some(r=>r.length!==width)) throw new Error('Inconsistent table in chapter '+chapter);
      output.push('<div class="table-wrap" role="region" tabindex="0" aria-label="Bảng có thể cuộn ngang"><table><thead><tr>'+rows[0].map(c=>'<th scope="col">'+inline(c)+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(1).map(r=>'<tr>'+r.map(c=>'<td>'+inline(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'); continue;
    }
    if (/^(\d+\. |[-*] )/.test(line)) {
      const ordered=/^\d+\. /.test(line), tag=ordered?'ol':'ul', items=[];
      const pattern=ordered?/^\d+\. /:/^[-*] /;
      while (i < lines.length && pattern.test(lines[i])) items.push('<li>'+inline(lines[i++].replace(pattern,''))+'</li>');
      output.push('<'+tag+'>'+items.join('')+'</'+tag+'>'); continue;
    }
    const paragraph=[];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3} |\||```|\d+\. |[-*] )/.test(lines[i])) paragraph.push(lines[i++]);
    output.push('<p>'+inline(paragraph.join(' '))+'</p>');
  }
  return {title,toc,html:output.join('\n')};
}
const chapters=files.map((file,i)=>render(fs.readFileSync(path.join(root,file),'utf8'),i+1));
const base=fs.readFileSync(path.join(root,'archive/v0.1/MCY_BUSINESS_PLAN_REVIEW.html'),'utf8');
let css=base.match(/<style>([\s\S]*?)<\/style>/)[1];
css+='\n@media(max-width:1050px){.layout{display:block}nav{position:static;max-height:340px;margin-bottom:24px;padding:20px;background:#eef1e7;border-radius:12px}.chapter{padding:28px 24px}}.loop{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;list-style:none;padding:0;margin:28px 0 0;max-width:1080px}.loop li{margin:0;border:1px solid #bbc8b5;background:#f6f8ef;border-radius:10px;padding:14px;font-size:13px;line-height:1.5}.loop b{display:block;font-size:16px;margin-bottom:5px}.loop span{display:block;color:#52684f}.quick-link{display:inline-block;font-weight:700;margin:8px 0}.chapter{scroll-margin-top:20px}.version-note{font-size:13px;color:#596b5c}@media(max-width:650px){.loop{grid-template-columns:1fr}.loop li{display:grid;grid-template-columns:145px 1fr;gap:10px}.loop b{font-size:14px;margin:0}.chapter{padding:22px 17px}}@media print{.loop{grid-template-columns:repeat(5,1fr)}.loop li{display:block;padding:7px;font-size:8pt}.loop b{font-size:10pt}nav{display:none}}';
const nav=chapters.map((c,i)=>`<details ${i===0?'open':''}><summary>${escape(c.title)}</summary><div><a href="#chapter-${i+1}">Tổng quan phần ${i+1}</a>${c.toc.map(t=>`<a href="#${t.id}">${escape(t.text)}</a>`).join('')}</div></details>`).join('');
const body=chapters.map((c,i)=>`<article class="chapter" id="chapter-${i+1}"><div class="chapter-label">PHẦN ${String(i+1).padStart(2,'0')} · KẾ HOẠCH 0.2</div>${c.html}<a class="back" href="#top">Về đầu tài liệu ↑</a></article>`).join('\n');
const html=`<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MCY — Vòng lặp AI và kế hoạch phát triển 0.2</title><style>${css}</style></head>
<body><div class="progress" aria-hidden="true"></div><header class="cover" id="top"><div class="cover-inner"><div class="kicker">MỘT CHÚT YOGA / A LITTLE YOGA</div><h1>Hôm nay tập gì?<br>Lần sau tiếp tục ra sao?</h1><p class="intro">Một buổi tập vừa sức hôm nay → một phản hồi trung thực → một lựa chọn phù hợp hơn cho lần tiếp theo.</p><span class="status">BẢN 0.2 · ĐỂ REVIEW · 24/09/2026</span><ol class="loop" aria-label="Vòng lặp trải nghiệm"><li><b>01 · Check-in</b><span>Hoàn cảnh hôm nay</span></li><li><b>02 · Cùng AI chọn</b><span>Trao đổi ngắn, có căn cứ</span></li><li><b>03 · Thực hành</b><span>Nội dung giáo viên đã duyệt</span></li><li><b>04 · Phản hồi thật</b><span>Như cũ, chưa rõ cũng hợp lệ</span></li><li><b>05 · Lần tiếp theo</b><span>Dùng phản hồi để chọn phù hợp</span></li></ol><div class="stats"><div class="stat"><strong>AI trong core</strong><span>Khóa và thư viện hỗ trợ vòng lặp</span></div><div class="stat"><strong>1 người · 2 lớp</strong><span>Việt Nam trước · Organic</span></div><div class="stat"><strong>Cuối 2026 → đầu 2027</strong><span>Pilot trả phí nếu đạt điều kiện</span></div><div class="stat"><strong>Prototype hiện có</strong><span>Tiếp tục từ nền thiết kế đã có</span></div></div><a class="quick-link" href="#chapter-6">Đọc trước: trải nghiệm hai buổi và phần prototype cần phát triển →</a><br><button type="button" onclick="window.print()">In / lưu thành PDF</button></div></header>
<div class="layout"><nav aria-label="Mục lục"><div class="nav-title">NỘI DUNG REVIEW</div>${nav}</nav><main><aside class="review-note"><p><strong>Điều đã chốt:</strong> check-in → trao đổi với AI → kế hoạch hôm nay → tập → phản hồi → điều chỉnh lần sau là trải nghiệm chính.</p><p><strong>Điều chỉnh bản 0.1:</strong> AI tham gia lựa chọn ngay trong MVP. Doanh thu ưu tiên thử gói đồng hành tự tập; khóa học, lớp giáo viên và thư viện là các lớp hỗ trợ.</p><p><strong>Còn để phản biện:</strong> phạm vi nội dung, chọn nguyên buổi hay ghép block, quyền ghi nhớ, gói 30 ngày, giá, nền tảng và nguồn lực. Các con số là giả định, chưa phải cam kết.</p><p class="version-note">Tài liệu và storyboard để review; chưa triển khai ứng dụng. Bản 0.1 được lưu riêng trong archive/v0.1.</p></aside>${body}</main></div><footer>MCY · Bản 0.2 · Sáu phần kế hoạch · Nguồn và trạng thái bằng chứng ở từng phần</footer>
<script>const bar=document.querySelector('.progress');function progress(){const max=document.documentElement.scrollHeight-innerHeight;bar.style.width=(max>0?scrollY/max*100:0)+'%'}addEventListener('scroll',progress,{passive:true});addEventListener('resize',progress);progress();</script></body></html>`;
fs.writeFileSync(path.join(root,'MCY_BUSINESS_PLAN_REVIEW.html'),html,'utf8');
console.log(JSON.stringify({chapters:chapters.length,tables:(html.match(/<table>/g)||[]).length,headings:chapters.reduce((n,c)=>n+c.toc.length,0),bytes:Buffer.byteLength(html)}));
