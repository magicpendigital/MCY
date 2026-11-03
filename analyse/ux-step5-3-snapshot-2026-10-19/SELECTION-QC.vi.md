# QC độc lập actual snapshot selection — 19/10/2026

Reviewer `/root/qc53_rebind_final`, thay reviewer trước do capacity error. **PASS_SOURCE_SELECTION_SCOPE**; không có P1/P2 còn mở trong phạm vi thay pin và probe. Đây là clearance nguồn để root quyết định invocation GO, chưa là test/final acceptance.

Đã đọc skill `skills/mcy-change-review/SKILL.md`, lifecycle/risk matrix, intake, baseline, intake QC, actual adapter, probe và kế hoạch Node13. R3 áp dụng cho allowlist Node của Owner reader nháp. Quyền hiện tại chỉ đồng bộ snapshot cục bộ và kiểm tra; không mở thêm quyền nội dung/chuyên môn/rights/release.

Tôi tự SHA256 toàn bộ **255 source +59 built client +71 canonical dependency** trong freeze mới: tất cả khớp; so bytes source mới với source cũ xác nhận chỉ `server/contentReview/selectedSnapshot.json` thay đổi, 254 source còn lại nguyên vẹn. Tự hash thêm35 root dirty và6 preserved evidence: không lệch. So recursive JSON độc lập xác nhận đúng8 field: `capturedUtc`, `units.0.sha256`, `units.1.sha256`, `units.2.sha256`, `units.3.sha256`, `units.6.sha256`, `units.11.sha256`, `units.12.sha256`. Chúng đúng bảy path cobra/cobra-gentle/cow-face/downward-dog/high-lunge/three-legged-dog/warrior-ii. Không thêm/bớt ID, revision, locale, paths, assets, contract hoặc inventory. Nội dung thực giữ14 unit,55 asset,25 identity_blocked, flags false/unpublished và approvalRecords rỗng.

Pin kiểm tra trực tiếp:

- Candidate freeze `6af8eb4daf3838d8abd44edfaa0009619e54b1ad42001c4c5b4869a6b9dabc5e`; snapshot mới `2e9ffee39872c08891bedce9ed5a93f93ec4af4d878ce50d47b09aaa8d71a937`.
- Intake `56105bf265256e4c5adcdcb6a61ef654d71e3534b23386b18fb88a34a6e31509`; baseline `ad9ae5385a517c5b0f078d2b875d77c3b3641dd23657dace0dfa4f7f8e35fd10`; intake QC `e811b52b3a051bef99c8631d0849941424948acc70b075aa1604015ceea55412`.
- Adapter unchanged `6438ba0ba3725861df14169d3622f72361711ff85d7da8da476a6f442488570e`; adapter test unchanged `383ca7c964a43beb39cfb821ba91f8e9f3f667c0922e99f8f4312e888c1ab895`.
- ReviewModel unchanged `bc0f0cdca4b11767739e99a1939625973aa5868e46d7856b0f089e19496880be`; model test `c920174603d9790e8fc0a8f2fcbbb97abd1669ee7bffa38033b1b52fc814cedf`.
- Server unchanged `40fa6ac7b1935486664a9d6d9239fb1c228e86834f64cc22e7f90d1fc91223c9`; server test `a015f88ecc31f6dad161b56ab8dd63178cd1064b2fef76a07763e1abe54c5d04`.
- Probe `d8c3f363c476d71a396437e7bf7bbbcd578cc81aa9ed5fc50375b453ecdde30d`; Node13 plan `076dee3994b5b92588642fc5b3726e5de293480b602a54c77efd7d7e4f0a0494`.

Đọc toàn probe xác nhận chỉ fs read/JSON clone/assert và gọi pure adapter; không HTTP/server/UI/cloud/write. Dynamic import adapter xảy ra **trước**8-field asserts, vì vậy adapter phải được pin trước child; không tuyên bố import sau guard. Probe kiểm14 selection mới, selection cũ đúng7 SOURCE_CHANGED +7 matched và list bị từ chối, identity/MIME sai bị từ chối, một blocked media bị từ chối; Node13 vẫn phải kiểm đủ55 image buffer/25 unavailable cùng path/schema/identity/drift và model/server guards. Adapter không có top-level side effect ngoài constants/imports. Không bypass hash/MIME/status/current recheck.

Kế hoạch execution phù hợp: root GO riêng, safe OS environment, child timeout60s Node13 và30s probe, pre/post pins, lưu stdout/stderr/exit/receipt; PASS chỉ sau process exit0 và kết quả đúng, không skip. Chưa chạy probe hay Node13 tại thời điểm tài liệu này. Source-only hash discovery không được gọi là kiểm thử adapter.

Build/frontend/UI15/mapped12 trước đây chỉ được reuse trong phạm vi exact unchanged consumed inputs: Node-only snapshot đổi, tất cả254 source khác/config/package/lock và59 client giữ byte. Không gán fresh full-suite PASS. Final QC sẽ xem receipt mới và root vẫn cần trực tiếp browser bảy unit/blocked labels rồi STOP chờ Owner trước bước6. Native HALTED/currentActorVerified=false và web BLOCKED_NO_UPLOAD_OR_ALIAS không đổi. Rollback là dừng dùng candidate mới; không xóa canonical/history hoặc gọi candidate cũ đang từ chối7unit là restored preview.

## Wrapper v2 trước invocation

Đã đọc toàn bộ actual `run-node13-v2.ps1`, tự hash `2caca1408248b6a1358656b20a8fba738b8abcd697e5b152cac3ce5e9d661524`, cùng `NODE13-PLAN-v2.vi.md` hash `6bf2f32cf94ea6ec29f4877098741092f38eee655f06fc2a8dcecf285ddb4c3b`. Root phát hiện mismatch reporter mặc định/TAP trước invocation; v2 chọn rõ `--test-reporter=tap` ở child ArgumentList và receipt. Source/test/assertions không thay đổi. Wrapper bind exact future root GO, freeze và baseline; từ chối output cũ, quét pre/post255/59/71/root35/old evidence/source/client, clear child env chỉ sáu OS key, timeout60s và chỉ kill child do wrapper tạo. PASS cần child exit0,13pass/0fail/0skip/0cancel và không drift. Không có P1/P2 trong wrapper v2; clearance invocation chỉ cho v2 sau root GO, không cho bản nháp v1.
