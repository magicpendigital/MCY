import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const base=path.resolve('.vercel/ux-step4-6-20261018'),p=path.join(base,'src/Prototype.tsx');let text=fs.readFileSync(p,'utf8');
const from=text.indexOf('  return <MobileScroll className="mcy-scroll"><main className="mcy-page mcy-account-home">',text.indexOf('function ProfileScreen()'));
const to=text.indexOf('\n}\n\nfunction AccountRow',from);assert(from>0&&to>from);
text=text.slice(0,from)+`  return <MobileScroll className="mcy-scroll mcy-profile-scroll"><main className="mcy-page mcy-account-home">
    <header className="mcy-profile-heading"><Eyebrow>CÁ NHÂN · {state.signedIn ? "TÀI KHOẢN HỌC VIÊN" : "KHÁCH"}</Eyebrow><h1>{state.signedIn ? \`Chào\${state.displayName ? \`, \${state.displayName}\` : " bạn"}.\` : "Một nơi cho những lựa chọn của bạn."}</h1><p className="mcy-lead">{state.signedIn ? state.accountEmail : "Xem và thực hành như khách. Tạo tài khoản khi bạn muốn lưu những điều mình chọn chia sẻ."}</p></header>
    {!state.signedIn && <div className="mcy-profile-card"><span className="mcy-tag">TÀI KHOẢN</span><strong>Giữ hành trình của riêng bạn</strong><p>Đăng nhập để lưu hồ sơ, lựa chọn quyền và check-in có đồng ý.</p><button onClick={() => { update({ authMode: "create", authReturnTo: "profile" }); flow.push(ROUTES.authEmail); }}>Tạo tài khoản hoặc đăng nhập</button></div>}
    <section className="mcy-account-group mcy-profile-primary" aria-labelledby="profile-data-title"><h2 id="profile-data-title">Hồ sơ và dữ liệu</h2><p className="mcy-profile-group-note">Thông tin của bạn và cách ứng dụng sử dụng dữ liệu.</p>
      <AccountRow title="Thông tin cá nhân" detail={state.displayName || "Tên tùy chọn · ngôn ngữ · hình minh họa"} onClick={() => flow.push(ROUTES.editProfile)} />
      <AccountRow title="Quyền riêng tư và đồng ý" detail="Xem từng mục đích · thay đổi hoặc rút đồng ý" onClick={() => flow.push(ROUTES.privacy)} />
      <AccountRow title="AI và điều được nhớ" detail={feedback ? "Có phản hồi để xem nguồn và cách rút lại" : "Chưa có thông tin được nhớ"} onClick={() => flow.push(ROUTES.memory)} />
    </section>
    <section className="mcy-account-group" aria-labelledby="profile-account-title"><h2 id="profile-account-title">Tài khoản và hướng dẫn</h2>
      <AccountRow title="Bảo mật tài khoản" detail="Email và đăng nhập bằng tài khoản khác" onClick={() => flow.push(ROUTES.security)} />
      <AccountRow title="Hướng dẫn và liên hệ" detail="Đọc hướng dẫn · chưa gửi yêu cầu trong ứng dụng" onClick={() => flow.push(ROUTES.help)} />
      {state.signedIn && <div className="mcy-profile-session"><p>Đăng xuất chỉ kết thúc phiên trên thiết bị này.</p><button disabled={signingOut} onClick={() => { void signOut(); }}>{signingOut ? "Đang đăng xuất…" : "Đăng xuất thiết bị này"}</button></div>}
      {error && <div className="mcy-form-error" role="alert">{error}</div>}
    </section>
    <section className="mcy-account-group mcy-profile-capabilities" aria-labelledby="profile-features-title"><h2 id="profile-features-title">Tính năng và trạng thái hiện có</h2><p className="mcy-profile-group-note">Xem lựa chọn đang có và những phần chưa mở.</p>
      <AccountRow title="Tùy chọn thông báo" detail="Lưu lựa chọn nhận tin · chưa đặt lịch nhắc tập" onClick={() => flow.push(ROUTES.notifications)} />
      <AccountRow title="Nội dung và quyền đang có" detail="Bài học miễn phí đang có · khóa trả phí chưa mở" onClick={() => flow.push(ROUTES.access)} />
      <AccountRow title="Chia sẻ với giáo viên" detail="Chưa kết nối lớp · xem và quản lý lựa chọn chia sẻ" onClick={() => flow.push(ROUTES.sharing)} />
      <AccountRow title="Xuất hoặc xóa dữ liệu" detail="Xem hướng dẫn · chưa tiếp nhận yêu cầu trong ứng dụng" onClick={() => flow.push(ROUTES.help)} />
    </section>
    <DemoNote>Bạn quyết định những gì mình chia sẻ. Mở Quyền riêng tư và đồng ý để xem phạm vi và thay đổi lựa chọn.</DemoNote>
  </main></MobileScroll>;`+text.slice(to);fs.writeFileSync(p,text);
const css=path.join(base,'src/prototype.css');fs.appendFileSync(css,`
/* Profile 4.6: presentation scoped to this retained route. */
.mcy-account-home { padding-top:24px; padding-bottom:36px; }
.mcy-account-home .mcy-profile-heading { margin-bottom:24px; }
.mcy-account-home .mcy-profile-heading h1 { margin:10px 0 12px; font-size:clamp(30px,7.8vw,38px); line-height:1.15; overflow-wrap:anywhere; }
.mcy-account-home .mcy-profile-heading .mcy-lead { margin:0; font-size:14px; line-height:1.55; overflow-wrap:anywhere; }
.mcy-account-home .mcy-profile-card { margin:0 0 28px; padding:20px; background:var(--color-sage-soft); border-color:transparent; border-radius:20px; }
.mcy-account-home .mcy-profile-card strong { margin-top:10px; font:24px/1.25 var(--font-editorial); }
.mcy-account-home .mcy-profile-card p { margin:10px 0 8px; font-size:14px; line-height:1.5; color:var(--color-text-muted); }
.mcy-account-home .mcy-profile-card button { min-height:48px; margin-top:8px; padding:12px 16px; border-radius:12px; background:var(--color-terracotta-action); color:var(--color-on-dark); font-size:14px; line-height:1.45; }
.mcy-account-home .mcy-account-group { max-width:none; margin:28px 0 0; }
.mcy-account-home .mcy-account-group h2 { margin:0 0 10px; color:var(--mcy-ink); font:24px/1.25 var(--font-editorial); }
.mcy-account-home .mcy-profile-group-note { margin:0 0 12px; color:var(--mcy-muted); font-size:14px; line-height:1.5; }
.mcy-account-home .mcy-account-row { min-height:80px; gap:16px; padding:16px 8px; border-color:var(--color-border); border-radius:0; }
.mcy-account-home .mcy-account-row strong { color:var(--color-ink); font-size:16px; line-height:1.45; font-weight:600; overflow-wrap:anywhere; }
.mcy-account-home .mcy-account-row small { color:var(--mcy-muted); font-size:14px; line-height:1.5; overflow-wrap:anywhere; }
.mcy-account-home .mcy-account-row > svg { width:18px; height:18px; color:var(--color-forest); }
.mcy-account-home .mcy-profile-primary { padding:20px 16px 4px; border:1px solid var(--color-border); border-radius:20px; background:var(--color-surface); }
.mcy-account-home .mcy-profile-session { margin:16px 0 0; }
.mcy-account-home .mcy-profile-session p { margin:0; font-size:14px; line-height:1.5; color:var(--mcy-muted); }
.mcy-account-home .mcy-profile-session button { min-height:48px; margin-top:8px; padding:12px 16px; border:1px solid var(--color-border-strong); border-radius:12px; background:var(--color-surface); color:var(--color-forest); font-size:14px; font-weight:600; line-height:1.5; }
.mcy-account-home .mcy-profile-session button:disabled { opacity:.65; cursor:wait; }
.mcy-account-home .mcy-form-error { font-size:14px; line-height:1.5; overflow-wrap:anywhere; }
.mcy-account-home .mcy-profile-capabilities { padding-top:24px; border-top:1px solid var(--color-border); }
.mcy-account-home .mcy-profile-capabilities h2 { font-size:22px; }
.mcy-account-home .mcy-demo-note { margin-top:24px; font-size:13px; line-height:1.5; }
.mcy-account-home :is(button,a) { scroll-margin-block:24px; }
.mcy-profile-scroll .mobile-scroll { scroll-padding-block:24px; }
@container mcy-app-viewport (min-width:620px) { .mcy-account-home { max-width:760px; padding-inline:40px; padding-top:32px; } }
`);console.log('Profile return JSX and scoped CSS updated.');
