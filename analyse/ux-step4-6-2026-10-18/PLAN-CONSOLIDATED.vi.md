# Kế hoạch tiếp nối4.6 — Cá nhân

18/10/2026 · User duyệt4.5 và giao4.6 theo lifecycle. **4.6 intake đang chờ QC/rootGO, chưa appcandidate. STOP user review trước4.7.** Xem [intake](TASK-INTAKE.vi.md) cho trace/ownership/checks/risks và [lifecycle](../../docs/quality/TASK_LIFECYCLE.md). Không sửa old frozen status để biểu diễn approval mới.

| Phần | Hiện tại |
|---|---|
| 4.1–4.5 | User đã duyệt trong dòng isolated candidate;4.5 source f57/evidence a81 là baseline |
| 4.6 Cá nhân | R1 presentation intake; independentQC→rootGO trước implementation |
| 4.7 Responsive backlog | Chưa bắt đầu; chờ user sau handoff4.6 |
| Foundation/content/CMS | Draft/ảnhAI/expert/rights/schema/reader/publish giữ task/gate riêng, không tích hợp |
| Native/web | NativeHALTED/webBLOCKED; không rollout từ localUX |

Mục tiêu đúng [plan14/10](../ux-implementation-2026-10-14/PLAN.vi.md) và auditS10: Profile ưu tiên chức năng đang dùng, không bán cảm giác capability chưa có. Hierarchy cụ thể: hero guest/account gọn → Hồ sơ/dữ liệu (edit/privacy/memory) → Tài khoản/hướng dẫn (security/help, signout accessible) → lower-priority capability/status group (notification preferences nhưng chưa scheduling, free/paid access, sharing chưa lớp, export limitation). Mọi explanatory route cũ vẫn reachable, privacy/revoke không giấu sau capability disclosure. Không fake progress/streak/purchase/About/contact, không derive consent badge từ defaultfalse/loading.

Triển khai sau GO chỉ candidate `.vercel/ux-step4-6-20261018` từ approved `.vercel/ux-step4-5-20261017`, không dirtyroot/HEAD. Chỉ ProfileScreen return JSX/copy hẹp, CSS `.mcy-account-home` scoped và focusedtests. Preserve signOut implementation/callbacks/routes/AccountDetail/shared AccountRow/backend/Auth/consent/runtime bytewise. Shared-file/type/helper expansion phải có addendum trước; permission/contract thay đổi phải phân loại lại, không tự hưởng R1.

Checks theo impact: focused guest/syntheticaccount/loading/error/signout/locale/consent/route truthful reachability; mapped account-access/timezone/help/security/notification/delayed guards; regression4.1–4.5/save/Journey; baseline runtime/catalogue/typecheck/build/Sites/scanner/isolation. Mock local `.invalid` only, no envfile/live/emails. No arbitrary full suite, screenshot evidence cwd riêng, preserve failures. Validators fail-fast/fileexist/hashmap đúng candidate vs harnessroot; không chấp nhận falsePASS do nonterminating shell.

Independent appQC trên finalfreeze rồi rootdirect pins/pixels/keyboard/safearea/longtext/320–desktop/simulators trước báo cáo. Localpass không fulla11y/physical/live/release.4.5P3editor và invalidrootrecord giữ lịch sử; không mở scope sửa. Fresh dirtyroot inventory riêng vì root hôm nay có thể khác17/10. Rollback giữ approved4.5, không integrate4.6; không data/APK/deploy. **Handoff xong WAITING_USER trước4.7**, không extra approval cho4.6 đã được giao.
