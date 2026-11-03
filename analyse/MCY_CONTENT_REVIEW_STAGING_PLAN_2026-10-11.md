# MCY — phạm vi staging đã được Owner yêu cầu, 11/10/2026

Kế hoạch này đã thực thi cho scope migration/Owner Edge/Preview. [Nghiệm thu cuối](MCY_CONTENT_REVIEW_STAGING_ACCEPTANCE_2026-10-11.md) và [receipt](MCY_CONTENT_REVIEW_STAGING_EVIDENCE_2026-10-11.json) là trạng thái hiện hành; các con số trước apply bên dưới là preflight lịch sử. Upload Preview bắt đầu khi live API smoke đang chạy; chỉ nghiệm thu sau khi cả smoke14/14, deployment READY và hosted artifact probes đạt. Hosted browser UI chưa nghiệm thu do attach timeout.

Owner đã mở Docker Desktop bằng Administrator và yêu cầu tiếp tục kiểm thử database, triển khai bản mới khi kiểm tra đạt. Đây là thao tác staging riêng cho duyệt nội dung, không phải chứng nhận hay phát hành Production.

## Artifact và target

- Supabase `mcy-staging` / `mhumbczqrzutdnraafhs`, MagicpenDigital `rzbpjfrndhrtxagpgdre`, ap-southeast-1; fresh project readback ACTIVE_HEALTHY.
- Chỉ migration `20261010113419_owner_content_review.sql`, SHA256 `a206a63d3daa86747d8e3447193235ad88534775676a3582ac3ccd92472191c1`. Hash `ff225000…efa8c3` là candidate cũ chưa apply, có lỗi expiry-read đã tái hiện. Không bundle năm candidate khác; không `db push`.
- Official CLI2.119.0: isolated workdir 19 applied + duy nhất candidate này; fresh list19 aligned/0 remote-only/1pending trong workdir. Repo đầy đủ vẫn19aligned/6pending trước thao tác.
- Owner Edge import graph9files được chụp riêng, JWT vẫn bật; chỉ thêm workflow duyệt nội dung và OpenRouter model metadata adapter đã review, không inference/admission/check-in/teacher API.
- Vercel project `prj_gTioLZWajGyQMkaPS1qapwoBOUnA`, team `team_BGXDJYYYe7LSDoGDjWRBFlJH`; CLI xác nhận linked project. Deploy Build Output API v3 Preview từ đúng `dist/client` đã test, không upload env/source repo. Artifact56files/8,201,479bytes, SHA256 `e823d02822d6f935b875d357419024f054b7fe7683882d343d39c2536c1d2794`; [manifest](MCY_CONTENT_REVIEW_WEB_ARTIFACT_2026-10-11.json). 137builtfiles checkpoint cũ không drift; 111sourceinputs chỉ migration đổi. Git vẫn dirty, HEAD cũ không đại diện toàn bộ source candidate.
- Domain review `motchutyoga.magicpendigital.com`, Preview branch `codex-mcy-p1-preview`; fresh binding verified. Không đổi Production, DNS, bảo vệ deployment hoặc general release-profile allowlist.

## Gates

Fresh schema-only export public/private SHA256 `8b83f85adae601acc5c29ab561f0db017096028ded476b329266a181f219eb18`; không lấy row dữ liệu thật. Docker PostgreSQL17.6.1.139/PostgREST14.13, mạng internal không publish port/mount host, fixture giả. [Receipt](MCY_CONTENT_REVIEW_DOCKER_2026-10-11.json) PASS11/11 + cleanup xác nhận absence. Minor platform/Auth scaffold khác staging; không gọi là full hosted-stack certification.

Đã tái hiện đọc Owner sau role expiry trong khi chờ khóa unchanged row; [receipt FAIL cũ](MCY_CONTENT_REVIEW_DOCKER_EXPIRY_REGRESSION_2026-10-11.json). Bản mới khóa verified Auth identity và kiểm lại clock sau role/profile locks. Docker kiểm cả Owner-role và teacher-profile wait, version contention, quota contention, đủ ba RPC qua HTTP, teacher khác, old Owner read compatible. Independent reviewer `/root/owner_repair_review` xác nhận newSHA, tự chạy PGlite9/9 + Owner/content/catalog20/20, không còn P1/P2 trong scope.

Primary clean-schema PGlite + Owner/content/catalog29/29 exit0. Runtime28 và bundle scanner21 PASS. UI lần đầu10/11, một timeout `page.goto`20s khi cold Vite cùng Docker; final rerun11/11 exit0 giữ nguyên timeout/assertions. Historical full fixture103/103 source frontend không đổi; không dùng fixture làm chứng cứ real roles. Trước apply đã kiểm hash đúng SQL, harness,9Edgefiles,56Previewfiles và bản copy trong isolated workdir.

Owner vừa refresh năm sessions: Auth200/verified/distinct; SQL independently maps actual roles. Helper `LEARNER_A` là global content_reviewer, `REVIEWER` là learner, `TEACHER` global teacher nhưng profile chưa active, `OWNER` current verified global Owner. Không sửa token file hoặc cấp/gia hạn role. Temporary roles hết hạn `2026-10-11T10:47:49.876065Z`; kiểm lại tại smoke.

## Thứ tự và điều kiện dừng

1. Final UI/manifest/hash đúng, independent R3 local đạt.
2. Apply duy nhất migration bằng official CLI explicit-project isolated workdir; dừng nếu target/ledger/artifact drift.
3. Readback ngay: ledger20, đúng6function/tableowner trustedpostgres, RLS/EXECUTE/ACL/private USAGE; oldOwnerMD5/OID/owner không đổi; AIoff/version1/audit4; mới0reviewrows/events. Dừng trước Edge nếu ownership/ACL/definition sai.
4. Deploy chỉ Owner Edge với JWT enabled; live read/negative smoke trên năm actors verified. Không tạo approval/assignment thật, không successful Owner AI config save. Probe impossible review revision phải409, không state/event commit. Owner `read_ai` có thể đọc danh mục model provider, không inference.
5. Deploy Preview exact static artifact; xác minh domain/HTTPS/asset hashes, public draft và Owner sign-in UI. Không tắt bảo vệ để thử; dùng CLI authenticated curl khi cần.

## Stop và khôi phục

Previous Owner Edge v4 source+metadata đã chụp vào task temp, verify_jwt=true. Nếu smoke mới sai: deploy lại đúng source trước đó (version mới chứa code cũ), không lùi Owner repair về40001. Giữ migration additive và review audit records; không drop table/audit/role để rollback. Old `mcy_ai_get_owner_config` HTTP200 AIoff/version1 đã kiểm thử sau upgrade trong Docker.

Previous Preview Ready `dpl_6N2BWPT3yKTfWiKEow6ArVNUpfvo`, `mcy-r08il6elv-magicpens-projects.vercel.app`, branch alias `mcy-git-codex-mcy-p1-preview-magicpens-projects.vercel.app` đã readback. Nếu web smoke sai, giữ/khôi phục domain review về deployment này; không promote Production. Giữ app AIoff/cohort empty/catalog0, không bật server AI hay publish content.

Apply/deploy scope này đã hoàn tất và được ghi trong nghiệm thu cuối. Chưa có active teacher profile/nguồn buổi tập được duyệt chuyên môn/rights; assignment teacher positive thật và gợi ý tập AI thật vẫn chưa mở.
