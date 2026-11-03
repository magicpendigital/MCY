# Adjacent15 mock-frame: môi trường chạy v1 và v2

V1 giữ nguyên [ef06 supplement](COURSE-MOCK-SUPPLEMENT-FREEZE.json), command/results/log `course-mock-final-*`: **15FAIL, process exit1**. Cả15 fail trước test body (2–5ms) tại `browserType.launch: Target page, context or browser has been closed`; Edge sandbox temporary profile báo `DualEngine/SiteList` replace `error=-5`, taskkill thiếu credentials. Không có assertion app/mock-frame được chạy; không gán lỗi cho Profile. Historical adjacent original strict-CSP vẫn 13PASS/2FAIL/exit1.

V2 chỉ copy runner/config với output mới `course-mock-escalated-v2-*`, bind original source freeze01d và supplement ef06. Giữ đủ15 test gốc, wrapper/guard/setup, CSP synthetic-frame exact, proxy deny,45s/case/12min process cap. Không đổi browser flags, bypass CSP, assertion, timeout, app, test, original harness; không chạm Edge người dùng hoặc kill toàn cục. Scoped `require_escalated` là thay đổi quyền chạy local do sandbox Edge launch failure; pre-invocation independentQC và rootGO bắt buộc trước invocation. V2 kết quả process thực tế sẽ có receipt riêng, không ghi đè v1 hoặc original.

No live backend/provider/media/account/native/deployment action. Preview4194 strict frame-src none riêng và phải được kiểm sau browser clear.
