# Independent R3 bootstrap Origin correction — v4

Reviewer `/root/profile46_qc`,18/10/2026. **PASS_SOURCE_FOR_BOUNDED_V4_CONTROLS_AND_ROOT_FORM_RETEST_AFTER_GO**; chưa invocation v4 từ QC. [Freeze v4](CONTROL-SOURCE-FREEZE-v4.json) SHA `8fa517d08d99f938b76f93b11f07fe00ee8dd302155205a2fa13d6e2e0ca7c97`; [correction](CONTROL-CORRECTION-v4.vi.md) SHA `ff9cf50d4998bd773899ed6ec05eccc9d3390cdd0c580898c6bd3338b541b574`. Independent hash/size command **actual exit0** UTC16:45:54Z:9source+71canonical+2v3preimages match.

Đọc exact diff: chỉ GET bootstrap HTML override `Referrer-Policy: same-origin` qua existing extra headers. Default send, POST303, session/API/static/media vẫn no-referrer; Host/Origin/Sec-Fetch-Site/form type/one-use capability/CSP/no-store không đổi. Null Origin không được chấp nhận. Hai POST negative dùng capability hợp lệ nhưng Origin null/wrong phải403, sau đó positive cùng origin vẫn303; GET header/CSP/no-store assertions mới nằm trong existing group. Tổng Node13 groups, không phải14.

Independent primary-source check [Fetch Standard §3.2](https://fetch.spec.whatwg.org/#origin-header) xác nhận non-CORS non-GET/HEAD có serialized Origin null khi policy no-referrer; same-origin policy không hạ origin cho cùng origin. Cách sửa giữ strict guard và xử lý đúng document request policy; không quy lỗi IAB/proxy. Node headers không thay actual browser form proof: cần root bootstrap bằng capability mới, exact4260, sau Node13v4 và rootGO/pins.

Own5negative v3 execution và oldNode13v3 vẫn là lịch sử; guards của chúng unchanged theo diff, nhưng root yêu cầu rebind own5 vào finalv4 và chạy riêng sau frozen probe review. Probe mới không mở scope hoặc thêm hooks. Previous Owner readonly checkpoint là conditional source clearance, actual form đã fail và phải retest; không coi lần đó là successful Owner acceptance.

Không cần rebuild app chỉ vì một Node response header; compiled59 và UI frontend giữ pin. Test proxy/managed browser workflow là gate riêng. Final5.3handoff vẫn BLOCKED đến clean15UI+12mapped và root verification; Owner inspection không human5.2/clinical/rights/role/release approval. NativeHALTED/webBLOCKED; STOP trước6.
