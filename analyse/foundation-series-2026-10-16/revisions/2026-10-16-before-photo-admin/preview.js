"use strict";

// Standalone design preview: all data below is editorial; state exists only in memory.
const lessons = [
  null,
  null,
  { id:"rest", title:"Nghỉ và kết thúc buổi tập", short:"Nghỉ và kết thúc", subtitle:"Dừng lại cũng là một phần của buổi tập.", minutes:3, image:"assets/rest-concept.png", alt:"Hình concept nhìn nghiêng: một người nằm ngửa trên thảm màu đất nung, hai gối gập, bàn chân trên thảm và hai tay bên người; đầu tựa trên vật liệu gấp màu sáng.", intro:"Xem trước lựa chọn nghỉ, đường chuyển ra và cách nhìn lại trải nghiệm bằng lời của mình.", goal:["Tìm được lựa chọn nghỉ và phần kết thúc.","Hiểu rằng không có nghĩa vụ phải cảm thấy tốt hơn."], material:"Một tư thế nghỉ có điểm tựa là chất liệu dự kiến. Giáo viên sẽ chốt tư thế, dụng cụ và lựa chọn không nằm nếu phù hợp; hình concept chưa xác nhận các chi tiết đó.", alternative:"Các lựa chọn nghỉ nằm, nghiêng hoặc ngồi sẽ do giáo viên quyết định. Bản mẫu chưa xác nhận đối tượng phù hợp, vị trí dụng cụ hoặc thời gian nghỉ.", steps:[
    ["Chọn cách nghỉ","Khung đầu sẽ đặt các lựa chọn nghỉ được duyệt cạnh nhau, để người học hiểu rằng mình có quyền lựa chọn.","Bối cảnh và dụng cụ cần nhìn rõ. Không gắn nhãn một lựa chọn là đúng nhất cho mọi người."],
    ["Chuẩn bị điểm tựa","Phần chuẩn bị sẽ được giải thích như một phần chính của bài học, gồm dụng cụ và điểm đặt đã được xác nhận.","Dụng cụ và cách đặt trong hình concept chỉ là hướng thị giác; chưa phải chỉ dẫn giải phẫu hoặc kỹ thuật."],
    ["Để chỗ cho cảm nhận của bạn","Phần nội dung này sẽ nhắc rằng người học không cần đạt một cảm giác nhất định, cùng lựa chọn điều chỉnh hoặc dừng.","Không đặt sẵn số phút, chu kỳ thở hoặc yêu cầu nhắm mắt. Không dùng hiệu ứng hình ảnh để hứa tác dụng."],
    ["Xem cách kết thúc","Đường chuyển ra sẽ có phần hướng dẫn riêng, với thứ tự rõ và media bổ sung nếu hình tĩnh chưa đủ.","Giáo viên sẽ chốt trình tự, hỗ trợ và phạm vi; không mặc định mọi người phải chuyển ra theo cùng một cách."],
    ["Chọn điều tiếp theo","Khung cuối sẽ để người học lựa chọn kết thúc, xem lại hoặc bỏ qua phản hồi, mà không tạo áp lực phải hoàn thành.","Bản mẫu kết thúc phần đọc. Không tạo huy hiệu sức khỏe, buổi tập hoặc phản hồi tích cực từ việc mở hết khung."]
  ]}
];

const draftLesson = draft => ({
 ...draft,
 completeDraft:true,
 steps:draft.steps.map(step=>[step.title,step.body,step.detail]),
 stepImages:draft.steps.map(step=>({image:step.image,alt:step.alt,caption:step.caption})),
 stepAlternatives:draft.steps.map(step=>step.alternative)
});
lessons[0] = draftLesson(standingLessonDraft);
lessons[1] = draftLesson(tabletopLessonDraft);
const state = { route:"discover", lesson:0, step:0, context:"discover", format:"illustration", resume:new Map(), understanding:new Map(), returnScroll:0 };
const app = document.querySelector("#app");
const screen = document.querySelector("#screen");
const header = document.querySelector("#app-header");
const footer = document.querySelector("#app-footer");
const stepsDialog = document.querySelector("#steps-dialog");
const imageDialog = document.querySelector("#image-dialog");
const announcement = document.querySelector("#announcement");
const esc = value => String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const arrow = '<span aria-hidden="true">→</span>';
const primary = (label,action,extra="") => `<button type="button" class="primary" data-action="${action}" ${extra}>${label}${arrow}</button>`;
const pill = text => `<span class="pill">${text}</span>`;
const lessonImage = (lesson,extra="") => `<img src="${lesson.image}" alt="${esc(lesson.alt)}" ${extra}>`;
const title = () => lessons[state.lesson];
const stepMedia = (lesson,index=state.step) => lesson.stepImages?.[index] ?? {...lesson,caption:"Hình concept của bài · khung chi tiết chưa được hoàn thiện."};
const hasContext = () => ["plan","today"].includes(state.context);
const contextLabel = () => state.context === "today" ? "Trở về Hôm nay" : "Trở về buổi đang xem";

function nav(active) {
  const items = [["today","Hôm nay"],["journey","Hành trình"],["discover","Khám phá"],["profile","Cá nhân"]];
  return `<nav class="bottom-nav" aria-label="Điều hướng chính">${items.map(([key,label])=>`<button type="button" data-action="nav" data-route="${key}" ${active===key?'aria-current="page"':""}>${label}</button>`).join("")}</nav>`;
}
function brandHeader() { return '<div class="wordmark"><img src="assets/brand-mark.svg" alt="">Một chút yoga</div><span class="header-label">Vạn chút an yên</span>'; }
function childHeader(label,action="back",menu=false) { return `<button type="button" class="header-back" data-action="${action}" aria-label="Quay lại"><span class="back-arrow" aria-hidden="true">‹</span>Quay lại</button><span class="header-label">${label}</span>${menu?'<button type="button" class="header-action" data-action="steps">Các bước</button>':'<span aria-hidden="true"></span>'}`; }
function resumeCard() {
  const entries = [...state.resume.entries()];
  if (!entries.length) return "";
  const [index,step] = entries.at(-1); const lesson=lessons[index];
  return `<button type="button" class="resume" data-action="resume" data-lesson="${index}"><small>ĐANG ĐỌC TRONG PHIÊN NÀY · BƯỚC ${step+1}/5</small><strong>Đọc tiếp · ${lesson.short} ${arrow}</strong></button>`;
}
function discover() {
  return `<p class="eyebrow">KHÁM PHÁ</p><h1>Học theo cách<br>hợp với bạn.</h1><p class="lead">Một bài ngắn để nhìn kỹ, hiểu rõ hơn và tự chọn điều tiếp theo.</p>
  <div class="format-tabs" aria-label="Định dạng nội dung"><button type="button" data-action="format" data-format="illustration" aria-pressed="${state.format==="illustration"}">Minh họa từng bước</button><button type="button" data-action="format" data-format="video" aria-pressed="${state.format==="video"}">Video hướng dẫn</button></div>
  ${state.format==="illustration"?`${resumeCard()}<section class="featured" aria-labelledby="feature-title"><div class="featured-art">${lessonImage(lessons[0])}${pill("HỌC BẰNG HÌNH")}</div><div class="featured-copy"><p class="eyebrow">SERIES NỀN TẢNG</p><h2 id="feature-title">Một chút nền tảng</h2><p>Hiểu từng bước.<br>Chọn nhịp của bạn.</p><div class="meta"><span>3 bài mẫu</span><span>5 khung mỗi bài</span><span>Tự chọn thứ tự</span></div>${primary("Xem series","series")}</div></section><p class="caption">Bài 01–02 đã có nội dung và 5 hình riêng mỗi bài · bản nháp để đánh giá.</p><button type="button" class="link-row" data-action="how"><span><strong>Học bằng hình như thế nào?</strong><small>Xem trước, nhìn kỹ, quay lại khi cần.</small></span><span class="row-arrow" aria-hidden="true">→</span></button>`:
  `<div class="video-preview">${pill("THƯ VIỆN HIỆN CÓ")}<h3>Video hướng dẫn</h3><p>Nhóm video hiện tại tiếp tục có chỗ riêng trong Khám phá. Bản mẫu này tập trung vào luồng minh họa và không mở trình phát.</p></div><button type="button" class="link-row" data-action="format" data-format="illustration"><span><strong>Xem nội dung minh họa mới</strong><small>Trở lại Một chút nền tảng.</small></span><span class="row-arrow" aria-hidden="true">→</span></button>`}`;
}
function series() {
 return `<div class="series-intro">${pill("MINH HỌA TỪNG BƯỚC")}<h1>Một chút nền tảng</h1><p class="lead">Một hình để nhìn kỹ. Một ý để hiểu rõ. Bạn có thể xem lại, đổi bài hoặc dừng ở đây.</p><div class="meta"><span>3 bài mẫu</span><span>Thứ tự học tùy chọn</span></div></div>${resumeCard()}<div class="section-heading"><h2>Bắt đầu ở đâu cũng được</h2></div><div class="lesson-list">${lessons.map((lesson,i)=>`<button type="button" class="lesson-card" data-action="lesson" data-lesson="${i}">${lessonImage(lesson,'loading="lazy"')}<span class="lesson-card-copy"><span class="eyebrow">BÀI ${String(i+1).padStart(2,"0")}</span><h3>${lesson.title}</h3><p>${lesson.subtitle}</p><small>${lesson.completeDraft?"5 bước · 5 hình riêng":"5 khung · đề cương"} · đọc khoảng ${lesson.minutes} phút</small></span></button>`).join("")}</div><p class="caption">Thời gian đọc là ước lượng. Ba bài chưa tạo thành một chuỗi thực hành hoàn chỉnh.</p><details class="plain-details"><summary>Về nội dung và hình minh họa</summary><p>Bài 01–02 đã có lời hướng dẫn và năm hình riêng mỗi bài. Bài 03 còn ở mức đề cương với hình concept. Nội dung có AI hỗ trợ và chưa được giáo viên thẩm định; đây là bản để đánh giá trước khi tích hợp.</p></details>`;
}
function overview() {
 const lesson=title();
 if(lesson.completeDraft) return `<p class="eyebrow">MỘT CHÚT NỀN TẢNG · BÀI ${String(state.lesson+1).padStart(2,"0")}</p><h1>${lesson.title}</h1><p class="lead">${lesson.intro}</p><div class="meta"><span>5 hình minh họa riêng</span><span>Đọc khoảng ${lesson.minutes} phút</span></div><p class="content-pending">Bản biên tập để đánh giá · chưa được giáo viên thẩm định.</p><div class="desktop-grid"><div><div class="series-art">${lessonImage(lesson)}</div><p class="caption">${esc(lesson.readTimeNote)}</p>${hasContext()?`<button type="button" class="return-context" data-action="return-plan">${contextLabel()}</button>`:""}<section class="lesson-preparation"><h2>Trước khi bắt đầu</h2><p>${esc(lesson.audience)}</p><ul>${lesson.preparation.map(item=>`<li>${esc(item)}</li>`).join("")}</ul><p class="stop-cue">${esc(lesson.stopCue)}</p></section></div><div><section class="objectives"><h2>Bạn sẽ tìm hiểu</h2><ul>${lesson.goal.map(goal=>`<li>${esc(goal)}</li>`).join("")}</ul></section><h2>Năm bước của bài</h2><div class="illustrated-outline">${lesson.steps.map((step,i)=>`<button type="button" data-action="open-step" data-step="${i}">${lessonImage(stepMedia(lesson,i),'loading="lazy"')}<span><small>BƯỚC ${i+1}</small><strong>${esc(step[0])}</strong></span></button>`).join("")}</div><details class="plain-details"><summary>Về bài và các lựa chọn</summary><p>${esc(lesson.material)}</p><p>${esc(lesson.alternative)}</p></details></div></div>`;
 return `<p class="eyebrow">MỘT CHÚT NỀN TẢNG · BÀI ${String(state.lesson+1).padStart(2,"0")}</p><h1>${lesson.title}</h1><p class="lead">${lesson.intro}</p><div class="meta"><span>Minh họa từng bước</span><span>5 khung</span><span>Đọc khoảng ${lesson.minutes} phút</span></div><div class="desktop-grid"><div><div class="series-art">${lessonImage(lesson)}</div><p class="caption">Một hình concept cho cả bài · chưa phải chỉ dẫn thực hành.</p>${hasContext()?`<button type="button" class="return-context" data-action="return-plan">${contextLabel()}</button>`:""}</div><div><section class="objectives"><h2>Bạn sẽ tìm hiểu</h2><ul>${lesson.goal.map(goal=>`<li>${goal}</li>`).join("")}</ul></section><h2>Năm khung của bài</h2><ol class="outline">${lesson.steps.map(step=>`<li>${step[0]}</li>`).join("")}</ol><details class="plain-details"><summary>Chất liệu và phần chuẩn bị dự kiến</summary><p>${lesson.material}</p><p>Đối tượng phù hợp, điều kiện chuẩn bị và lưu ý kỹ thuật sẽ được giáo viên bổ sung.</p></details><p class="content-pending">Bản mẫu để xem cấu trúc nội dung. Các khung chi tiết và hướng dẫn kỹ thuật chưa được duyệt.</p></div></div>`;
}
function reader() {
 const lesson=title(), step=lesson.steps[state.step], media=stepMedia(lesson);
 return `<article class="reader"><div class="reader-topline"><p class="eyebrow">BƯỚC ${state.step+1} / 5</p><div class="step-dots" aria-hidden="true">${lesson.steps.map((_,i)=>`<span class="${i===state.step?'current':''}"></span>`).join("")}</div></div><h1>${step[0]}</h1><div class="desktop-grid"><figure class="reader-figure"><button type="button" data-action="zoom" aria-label="Xem hình minh họa lớn">${lessonImage(media)}<span class="zoom-label">Xem hình lớn</span></button><figcaption>${esc(media.caption)}</figcaption></figure><div><div class="reader-copy"><p class="editorial-label">${lesson.completeDraft?"HƯỚNG DẪN TRONG BẢN NHÁP":"NỘI DUNG DỰ KIẾN"}</p><p>${step[1]}</p></div><details class="plain-details"><summary>Xem kỹ bước này</summary><p>${step[2]}</p></details><details class="plain-details"><summary>Một lựa chọn khác</summary><p>${lesson.stepAlternatives?.[state.step]??lesson.alternative}</p></details>${lesson.completeDraft?'':'<p class="audio-note">Chưa có audio trong bản mẫu. Phần chữ đang mô tả nội dung biên tập dự kiến.</p>'}${hasContext()?`<button type="button" class="return-context" data-action="return-plan">${contextLabel()}</button>`:'<button type="button" class="return-context" data-action="stop-reading">Dừng xem · về danh sách bài</button>'}</div></div></article>`;
}
function finish() {
 const lesson=title(), response=state.understanding.get(state.lesson);
 const finishLead=lesson.id==="standing"?"Nhận biết điểm tựa, giữ quyền điều chỉnh và chọn điều tiếp theo theo nhịp của bạn.":lesson.ending?.replace(/^Bạn đã đến cuối phần đọc\.\s*/,"");
 if(lesson.completeDraft) return `<article class="finish"><div class="finish-art">${lessonImage(stepMedia(lesson,4))}</div><p class="eyebrow">KẾT THÚC PHẦN ĐỌC</p><h1>Bạn đã đến cuối phần đọc.</h1><p class="lead">${esc(finishLead)}</p><p class="choice-question">Phần nào bạn muốn nhìn kỹ hơn?</p><div class="review-step-choices">${lesson.reviewOptions.map((label,i)=>`<button type="button" class="secondary" data-action="open-step" data-step="${i}">${esc(label)}</button>`).join("")}</div><p class="caption">Chọn để mở lại bước tương ứng. Bạn có thể bỏ qua.</p><p class="note">Việc xem bài không được tính là đã thực hành và không tạo bản ghi Hành trình.</p><div class="stack finish-actions">${hasContext()?primary(contextLabel(),"return-plan"):primary("Về danh sách bài","series")}<button type="button" class="secondary" data-action="restart">Xem lại từ đầu</button>${state.lesson<2?`<button type="button" class="text-button full" data-action="lesson" data-lesson="${state.lesson+1}">${lessons[state.lesson+1].completeDraft?"Xem bài":"Xem đề cương bài"} ${state.lesson+2}: ${lessons[state.lesson+1].short}</button>`:""}</div></article>`;
 return `<article class="finish"><div class="finish-art">${lessonImage(lesson)}</div><p class="eyebrow">KẾT THÚC PHẦN ĐỌC</p><h1>Bạn đã đến cuối phần đọc.</h1><p class="lead">Xem lại phần bạn cần, chọn bài khác hoặc kết thúc ở đây.</p><div class="note"><p>Việc xem bài không được tính là đã thực hành và không tạo bản ghi Hành trình.</p></div><p class="choice-question" id="understanding-label">Cách trình bày có dễ hiểu không? <span class="muted">(Tùy chọn)</span></p><div class="understanding" role="group" aria-labelledby="understanding-label">${["Đã rõ","Còn một chỗ chưa rõ","Chưa muốn trả lời"].map((label,i)=>`<button type="button" data-action="understanding" data-value="${i}" aria-pressed="${response===i}">${label}</button>`).join("")}</div><p class="caption">Lựa chọn chỉ hiện trong phiên xem trước này.</p><div class="stack finish-actions">${hasContext()?primary(contextLabel(),"return-plan"):primary("Về danh sách bài","series")}<button type="button" class="secondary" data-action="restart">Xem lại từ đầu</button>${state.lesson<2?`<button type="button" class="text-button full" data-action="lesson" data-lesson="${state.lesson+1}">Xem trước bài ${state.lesson+2}: ${lessons[state.lesson+1].short}</button>`:""}</div></article>`;
}
function today() {
 return `<p class="eyebrow">MỖI BUỔI BẮT ĐẦU TỪ HÔM NAY</p><h1>Một chút thời gian<br>cho chính mình.</h1><p class="lead">Ghi lại điều bạn muốn cho hôm nay, rồi tự chọn một bài học. Bạn không cần đăng nhập để xem bài.</p><div class="series-art">${lessonImage(lessons[0])}</div>${primary("Bắt đầu check-in","checkin-scope")}<p class="caption">Không cần check-in để duyệt bài học.</p><button type="button" class="link-row" data-action="today-lesson"><span><strong>Tìm hiểu trước khi tập</strong><small>Đứng và nhận biết điểm tựa · 5 khung.</small></span><span class="row-arrow" aria-hidden="true">→</span></button>${resumeCard()}<button type="button" class="link-row" data-action="plan"><span><strong>Xem kế hoạch minh họa</strong><small>Vị trí đề xuất cho liên kết trong một buổi tập.</small></span><span class="row-arrow" aria-hidden="true">→</span></button><p class="caption">Bài 01 là bản nháp với 5 hình riêng. Kế hoạch minh họa là trạng thái đề xuất.</p>`;
}
function checkinScope(){return `<p class="eyebrow">LUỒNG CHECK-IN HIỆN CÓ</p><h1>Bắt đầu từ cảm nhận hôm nay.</h1><p class="lead">Nút check-in vẫn giữ vai trò chính trên Hôm nay. Bản mẫu này chỉ xây luồng nội dung minh họa, nên không tái tạo hoặc lưu check-in.</p><div class="note">Bạn có thể trở về Hôm nay hoặc tìm hiểu bài nền tảng mà không cần trả lời về cơ thể.</div><div class="stack">${primary("Về Hôm nay","nav",'data-route="today"')}<button type="button" class="secondary" data-action="today-lesson">Tìm hiểu trước khi tập</button></div>`;}
function plan() {
 return `<p class="eyebrow">KẾ HOẠCH MINH HỌA · TRẠNG THÁI ĐỀ XUẤT</p><h1>Bắt đầu thật vừa đủ.</h1><p class="lead">Đây là vị trí đề xuất cho liên kết giúp bạn hiểu thêm trước buổi tập.</p><div class="series-art">${lessonImage(lessons[0])}</div><div class="plan-position">Đang xem: phần chuẩn bị · không có trình phát hoạt động.</div><section class="objectives"><h2>Tìm hiểu trước buổi tập</h2><p class="quiet">Đứng và nhận biết điểm tựa</p><p>Nhìn tổng thể và điểm bắt đầu qua bài minh họa.</p>${primary("Xem từng bước","context-lesson")}</section><p class="note">Khi quay lại từ bài nền tảng, bạn trở về đúng phần chuẩn bị này. Không tự phát nội dung hoặc ghi nhận đã tập.</p><button type="button" class="text-button" data-action="nav" data-route="today">Về Hôm nay</button>`;
}
function journey() {
 return `<p class="eyebrow">HÀNH TRÌNH</p><h1>Những điều bạn<br>chủ động ghi lại.</h1><p class="lead">Hoạt động đọc và cảm nhận sau tập có ý nghĩa khác nhau.</p><div class="empty"><h2>Chưa có dữ liệu thực hành trong bản mẫu.</h2><p>Mở bài, chuyển bước hay xem hết nội dung không tạo một buổi tập hoặc bản ghi sức khỏe.</p><p>Vị trí đang đọc chỉ giúp bạn quay lại nội dung trong phiên này.</p></div>${primary("Tiếp tục khám phá","nav",'data-route="discover"')}<p class="caption">Không kết nối tài khoản hoặc dữ liệu Hành trình thật.</p>`;
}
function profile() {
 return `<p class="eyebrow">CÁ NHÂN</p><h1>Một bản mẫu<br>để cùng xem xét.</h1><p class="lead">Bạn đang xem đề xuất nội dung và luồng đọc của Một chút nền tảng.</p><section class="empty"><h2>Trong phiên này</h2><p>Vị trí đọc và lựa chọn phản hồi được giữ tạm trong bộ nhớ. Tải lại trang sẽ bắt đầu phiên mới.</p><p>Không đăng nhập, không lưu thông tin cơ thể, không đồng bộ hoặc gửi dữ liệu đi.</p></section><button type="button" class="secondary" data-action="clear-session">Xóa vị trí đọc và lựa chọn trong phiên</button><p class="caption" id="session-note">Chỉ tác động đến bản xem trước này.</p><details class="plain-details"><summary>Về bản nháp nội dung</summary><p>Bài 01–02 đã có nội dung từng bước và năm hình riêng mỗi bài. Bài 03 giữ ở mức đề cương. Chưa có audio hoặc thẩm định chuyên môn; bản xem trước dùng để đánh giá trước khi tích hợp.</p></details>`;
}
function how() {
 return `<p class="eyebrow">HỌC BẰNG HÌNH</p><h1>Một phần nhỏ,<br>theo nhịp của bạn.</h1><p class="lead">Xem toàn bộ trước, nhìn kỹ từng khung và quay lại phần bạn cần.</p><ol class="outline"><li>Chọn một bài theo điều muốn tìm hiểu.</li><li>Xem mục tiêu và phần chuẩn bị của bài.</li><li>Dùng Bước trước, Bước tiếp hoặc danh sách Các bước.</li><li>Mở hình lớn và nội dung giải thích khi cần.</li><li>Kết thúc phần đọc hoặc chọn xem lại.</li></ol><div class="note">Không có bài bị khóa, không tự chuyển bước và không tính việc đọc là đã tập.</div>${primary("Xem series","series")}`;
}
function render({focus=true,scroll=0}={}) {
 const mainRoutes=["today","discover","journey","profile"];
 const views={discover,series,overview,reader,finish,today,plan,journey,profile,how,"checkin-scope":checkinScope};
 header.innerHTML=mainRoutes.includes(state.route)?brandHeader():childHeader(state.route==="reader"?`Bài ${state.lesson+1} · Nền tảng`:state.route==="plan"?"Hôm nay":state.route==="series"?"Khám phá":"Một chút nền tảng","back",state.route==="reader");
 screen.innerHTML=views[state.route]();
 announcement.textContent=state.route==="reader"?`Bước ${state.step+1} trong 5: ${title().steps[state.step][0]}`:"";
 if(mainRoutes.includes(state.route)) footer.innerHTML=nav(state.route);
 else if(state.route==="overview") footer.innerHTML=`<div class="action-footer">${primary(state.resume.has(state.lesson)?`Đọc tiếp · bước ${state.resume.get(state.lesson)+1}/5`:"Xem từng bước","start-reader")}</div>`;
 else if(state.route==="reader") footer.innerHTML=`<div class="action-footer"><div class="reader-actions"><button type="button" class="secondary" data-action="previous" ${state.step===0?'disabled':''}>Bước trước</button>${primary(state.step===4?"Kết thúc phần đọc":"Bước tiếp","next")}</div></div>`;
 else footer.innerHTML="";
 screen.scrollTop=scroll;
 if(focus){const heading=screen.querySelector("h1");if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
}
function go(route,options={}){state.route=route;render(options);}
function openLesson(index,context=state.context){state.lesson=index;state.context=context;go("overview");}
function remember(){state.resume.delete(state.lesson);state.resume.set(state.lesson,state.step);}
function showSteps(){document.querySelector("#steps-list").innerHTML=title().steps.map((step,i)=>`<button type="button" class="step-menu-button" data-action="jump" data-step="${i}" ${state.step===i?'aria-current="step"':''}><span>${String(i+1).padStart(2,"0")}</span><span>${step[0]}</span></button>`).join("");stepsDialog.showModal();}
function back(){
 if(state.route==="reader"||state.route==="finish")go("overview");
 else if(state.route==="overview")go(hasContext()?state.context:"series");
 else if(state.route==="plan"||state.route==="checkin-scope")go("today");
 else go("discover",{scroll:state.returnScroll});
}
document.addEventListener("click",event=>{
 const button=event.target.closest("button[data-action]");if(!button||button.disabled)return;
 const action=button.dataset.action;
 if(action==="nav"){state.context="discover";go(button.dataset.route);}
 else if(action==="review-discover"){state.context="discover";state.format="illustration";go("discover");}
 else if(action==="review-today"){state.context="discover";go("today");}
 else if(action==="review-standing")openLesson(0,"discover");
 else if(action==="review-tabletop")openLesson(1,"discover");
 else if(action==="series"){if(state.route==="discover")state.returnScroll=screen.scrollTop;state.context="discover";go("series");}
 else if(action==="format"){state.format=button.dataset.format;render({focus:false});screen.querySelector(`[data-format="${state.format}"]`)?.focus({preventScroll:true});}
 else if(action==="lesson")openLesson(Number(button.dataset.lesson),state.context);
 else if(action==="context-lesson")openLesson(0,"plan");
 else if(action==="today-lesson")openLesson(0,"today");
 else if(action==="checkin-scope")go("checkin-scope");
 else if(action==="start-reader"){state.step=state.resume.get(state.lesson)??0;remember();go("reader");}
 else if(action==="open-step"){state.step=Number(button.dataset.step);remember();go("reader");}
 else if(action==="resume"){state.lesson=Number(button.dataset.lesson);state.step=state.resume.get(state.lesson)??0;state.context=state.route==="today"?"today":"discover";remember();go("reader");}
 else if(action==="next"){if(state.step===4)go("finish");else{state.step++;remember();render();}}
 else if(action==="previous"){state.step=Math.max(0,state.step-1);remember();render();}
 else if(action==="steps")showSteps();
 else if(action==="jump"){state.step=Number(button.dataset.step);remember();stepsDialog.close();render();}
 else if(action==="close-steps")stepsDialog.close();
 else if(action==="zoom"){const media=stepMedia(title());const image=document.querySelector("#zoom-image");image.src=media.image;image.alt=media.alt;document.querySelector("#image-title").textContent=title().completeDraft?`Bước ${state.step+1} · ${title().steps[state.step][0]}`:"Hình concept của bài";document.querySelector("#image-caption").textContent=media.caption;imageDialog.showModal();}
 else if(action==="close-image")imageDialog.close();
 else if(action==="back")back();
 else if(action==="stop-reading"){state.context="discover";go("series");}
 else if(action==="return-plan")go(hasContext()?state.context:"today");
 else if(action==="plan")go("plan");
 else if(action==="restart"){state.step=0;remember();go("reader");}
 else if(action==="how")go("how");
 else if(action==="understanding"){state.understanding.set(state.lesson,Number(button.dataset.value));screen.querySelectorAll('[data-action="understanding"]').forEach(item=>item.setAttribute("aria-pressed",String(item===button)));announcement.textContent="Lựa chọn được giữ trong phiên xem trước.";}
 else if(action==="clear-session"){state.resume.clear();state.understanding.clear();document.querySelector("#session-note").textContent="Đã xóa vị trí đọc và lựa chọn của phiên này.";announcement.textContent="Đã xóa vị trí đọc và lựa chọn của phiên này.";}
});
document.querySelector("#viewport").addEventListener("change",event=>{app.dataset.mode=event.target.value;});
const entryParams=new URLSearchParams(location.search);
const entryLesson=lessons.findIndex(lesson=>lesson.id===entryParams.get("lesson"));
if(entryLesson>=0){
 state.lesson=entryLesson;
 state.route="overview";
 const entryStep=Number(entryParams.get("step"));
 if(Number.isInteger(entryStep)&&entryStep>=1&&entryStep<=5){state.step=entryStep-1;state.route="reader";remember();}
}
render({focus:false});
