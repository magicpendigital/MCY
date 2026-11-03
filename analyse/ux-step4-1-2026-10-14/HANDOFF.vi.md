# Bàn giao bước 4.1 — Home

Ngày14/10/2026. Candidate: `.vercel/ux-step4-1-20261014`, copy230 input đúng candidate bước1–3 (228baseline+2test). Root app và candidate cũ không sửa; snapshot xác nhận230oldcandidate/228rootexisting input byte-unchanged. Phạm vi R1: Home UI đọc state sẵn có, hai nút gọi navigation hiện có. Chưa tích hợp/phát hành.

Home đặt primarycheck-in và secondarytự chọn video trước ảnh. Giới thiệu ngắn, bỏ ba bước lặp và lời ghi nhớ cá nhân hóa. AIoff/checking/notready mô tả ghi nhận+tự chọn; AIready mô tả đúng lựa chọn saucheck-in. Không tạo buổi/gợi ý giả, không bậtAI/inference. Ảnh hiện có giữ tỷ lệ tự nhiên và đủ đầu/mặt; không sinh/thayasset. CopyHome VI+EN; English vẫn preview từng phần qua disclosure hiện có.

“Tiếp tục check-in” chỉ cho nháp khách còn trong phiên trước khi handoff sang practice/manualflow; lựa chọn/step giữ nguyên khi mở lại. Không hứa resume authenticatedpending-save, consent/account hoặc persist qua reload. Completedpractice/lastReflection và baseline được loại khỏi nhãnnháp. Primarykhông reset bất kỳ check-in/account/consent state; save/latecontinuation/Journeyguards giữ nguyên. Khác source chỉ `src/Prototype.tsx` (HomeScreen) và7rule HomeCSS; thêm focused `tests/ux-home.spec.ts`.

Final checks: build/TypeScript/runtime28/catalog0 PASS; clientscanner23 PASS; Sites4+isolation1 PASS; Home9PASS; relevantregressions82PASS, tất cả process exit0. Command/hashes/groupcounts trong `evidence.json`; sourcepin trong `source-freeze.json`; diff `home.patch`. Không coi old167PASS là finalstep4 acceptance. Ba test practiceexportảnh tới oldfolder được loại tránh overwritefrozen evidence. Intermediate prepareguard/browserlaunch/selector failures và một deliberatelyinterruptedrun được giữ/labeled trong evidence, không dùng làmPASS.

Ảnh final: `home-360.png`, `home-390.png`, `home-desktop.png`, `home-iphone.png`, `home-pixel.png`; implementer đã xem360/desktop. Focused9 kiểm actualguestdraft, independentmanualnavigation, oneprimary, AIoff/ready khônginference, Englishpreview, naturalratio và horizontaloverflow trên5viewport/preset. Kiểm82 có mainloopVI/EN/keyboard/safearea/save17/Journeyselection. Physicalnative, screen-reader toàn diện, WCAG và realbackend đều CHƯA CHẠY. Vitechunk>500kB warning còn nguyên.

Preview đang chạy `http://127.0.0.1:4188/?mode=web`, session88396. Nếu cần restart: `node analyse/ux-step4-1-2026-10-14/preview.mjs` từ root. Harness dùng `.invalid`, xóa inheritedVITE, envDircandidate/.invalid, fsallowcandidate+rootnode_modules; port4192 cho tests và awaitserver.close teardown. Có thể dừng riêng sessionpreview để bỏcandidate; không có cloudrollback vì noexternal effects.

Sourcefrozen để QC độc lập và root kiểm trực tiếp; sau bước này dừng chờ Owner. Không làm check-inbody, course, reflection/profile, native/staging/email/deploy/paidmedia; packetnative/web hiện hành vẫn riêng.
