# Independent QC — Reflection 4.5, final v2

**PASS trong phạm vi thay đổi R1 local; không còn P1/P2 được xác nhận.** Reviewer `/root/step44_independent_qc`, độc lập với implementer. Không sửa app, không chạy thao tác live/native. Root final verification và user review vẫn là bước riêng; dừng trước 4.6.

Verdict chỉ áp dụng candidate `.vercel/ux-step4-5-20261017`, [SOURCE-FREEZE-v2.json](SOURCE-FREEZE-v2.json) SHA256 `f57b2ba99aad152ffa52192ea40725ceab0a9ba6005a347323c11a880e7301a8`, và [EVIDENCE-FREEZE-v2.json](EVIDENCE-FREEZE-v2.json) SHA256 `a81bf13ee6d378600658b891c287ae3c01c59dec9b4135edb51217ed4e6b7270`. Pending fields trong hai freeze là lịch sử tại thời điểm bàn giao; không sửa frozen records để biểu diễn verdict này.

## Source và preservation

Đã đọc actual diff, intake/addenda, scoped CSS/i18n, focused test và runner/config. Chỉ ReflectionScreen return JSX, Reflection CSS, UI translation mới và focused test thay đổi; Footer chỉ thêm root class đã duyệt. So sánh trực tiếp xác nhận code trước Reflection, region handlers và Footer trở về sau giống approved 4.4 sau khi bỏ đúng root-class token. Route/footerHeight104, runtime, outcome/pace enum, snapshot, consent/Auth/backend/Sync/Journey giữ nguyên.

Không có vùng trước thật thì overall choices đứng trước và không dựng comparison rỗng. `none_now`/`uncertain` giữ self-report thật; null helper không suy được skipped/unanswered vì route đã gộp hai trạng thái. Không positive default; blank/skip/worse/uncertain giữ nghĩa hiện có. Session-only notice và worse alert không bị giấu trong details. Post-only region có readback/edit ngoài disclosure. CSS chọn Reflection scroll/footer cụ thể, không dùng retained-route ancestor làm Home/CourseDetail nhận style.

Final raw-byte guard [INDEPENDENT-FINAL-PINS.json](INDEPENDENT-FINAL-PINS.json), SHA256 `a59ff36e87503c2552d39648b707dbd74166cafd8cd367c814af2e17c39f3d62`, **exit 0**: 235 candidate inputs, 20 named harness/intake inputs, 234 approved 4.4 inputs, 228 dirty-root preimages, 33 evidence files, 79 images, 2 supporting records và 59 build files khớp. App paths resolve theo `manifest.candidate`; harness paths resolve theo project root. Own browser probes cũng kiểm pins trước/sau và khớp. Không dùng root dirty app làm baseline.

## Verification và attribution

Các kết quả sau là **implementer chạy, reviewer trực tiếp kiểm report/receipt/pins**, không gọi là independent rerun:

| Gate cuối | Kết quả |
|---|---|
| Runtime/catalogue/TypeScript/build/Sites prep/bundle/isolation | 7 commands exit 0 |
| Full focused confirmation, unchanged f57/config/assertions/25s | 38/38, exit 0; unexpected/skipped/flaky đều 0 |
| Mapped practice/reflection/account/retry/route guards | 10/10, exit 0 |
| Adjacent approved 4.1–4.4, sáu files | 84/84, exit 0 |

Đã kiểm helper [run-focused-confirmation.mjs](run-focused-confirmation.mjs) SHA `d5414cba6e1e753d65e4494f5c81fcf49f1f669232978622a842b85108270005`: output paths riêng, không nới test/config/deadline; source/harness guard trước launch. Tổng 132 cases của ba runner cuối, không phải toàn bộ repository test suite.

**Own v2 UI probe** [raw result](independent-qc-v2/probe-results.json) có **14 PASS và 1 extra diagnostic FAIL, runner exit 1**, không được gọi 15/15 PASS. Các 14 cases PASS dùng browser local/synthetic fixture với external calls bị chặn: normal và actual 28px VI/EN, actual Tab/full rect/focus ring, computed scroll padding128, mở optional/typing/no descendant overflow, iPhone/Pixel safe-area/footer bounds; null/none_now/uncertain; vùng mới/edit/delete và retained CourseDetail; unequal sides/explicit keep/uncertain clearing; skip khác blank. Hai signed-in synthetic consent off/on cases hoàn tất Worse→Sync→Journey, kiểm đúng local history gate và không có request mới sau reflection action marker. Startup fixture requests là riêng, không được gọi là cloud acceptance.

Independent P2 cũ trên source101e: normal VI/EN summary bị opaque footer che khoảng33px khi actual Tab. V2 local scroll-padding fix đã đóng cơ chế: normal/28 VI/EN đều kiểm actual full focused rect giữa header/footer, mở optional và typed textarea. Footer insets/touch/focus/safe-area được đo bằng real control rect, không chỉ `toBeVisible` hoặc main overflow.

## Failure history và residual

- Giữ initial worker30 run có2 lỗi overflow thật, old101e36 run có12 focus-helper modality failures, và own initial run có2 P2 thật +4 helper errors. Own corrected v2 nằm trong file/output riêng; không ghi đè evidence cũ.
- Giữ original v2 focused **37/38 exit1**, whole25s deadline tại Sync button stability, **nguyên nhân ban đầu chưa được chứng minh**. Exact-case supplement1/1 exit0 không đủ thay full gate; đã yêu cầu và kiểm full unchanged38/38 exit0 sau khi các independent browsers đóng. Không gọi lỗi đầu là environmental fluke.
- Extra own editor diagnostic đòi cả textarea/ring trong dialog FAIL: bottom575.859375 so với viewport/dialog568. [Bounded approved4.4 control](editor-baseline-control/results.json) **hai scenario PASS comparison/reachability, exit0**, delta top/bottom0px trên4.4 và4.5. Actual Tab tới Save làm sheet cuộn123px, Save nằm trong dialog; Enter/reopen giữ note đúng ở cả hai. **P3 preexisting shared RegionEditor/BottomSheet focus clipping**, không phải4.5 regression; chưa có full editor focus visibility/accessibility acceptance. [Disposition riêng](EDITOR-BASELINE-DISPOSITION.vi.md) giữ chi tiết và giới hạn.

Không phát hiện thêm P1/P2 trong source/UI/contracts được duyệt. PASS này không bảo đảm zero regressions và không chứng minh remote CI enforcement. Không cần full skill validator vì task4.5 không sửa skill; PyYAML gap của control review trước vẫn là lịch sử riêng, không biến thành validator PASS.

## Boundary sau QC

Local browser/simulator fixtures và synthetic signed-in state; không physical keyboard/OS keyboard/native/screen-reader/live video/actual cloud account or health-write acceptance. Không SQL/Auth/consent/AI/media/native install/deploy/release change. Root provisional manual observations chưa được dùng để thay own evidence; root cần fresh final pins và final verification riêng trên cùng bytes trước bàn giao user. Native **HALTED**, web **BLOCKED_NO_UPLOAD_OR_ALIAS**; **STOP trước4.6**. Rollback local là bỏ candidate4.5 và giữ approved4.4, không sửa history/cloud data.
