# MCY — independent technical staging review, 2026-10-11

This record summarizes the existing independently authorized reviewer `/root/owner_repair_review`. It supersedes the 2026-10-10 local-only review for the exact final content-review migration and deployed readback. It does not certify the wider dirty tree, clinical expertise, media rights or Production release.

Final SQL SHA256: `a206a63d3daa86747d8e3447193235ad88534775676a3582ac3ccd92472191c1`. Final Docker harness SHA256: `e1819bdeb71534bb07bece597b63c550eea47dbe5d75cd76b65f949866fada5d`.

The parent reproduced a real row-lock wait allowing an expired unchanged Owner-role row to authorize a read. The old unapplied SQL (`ff225000…efa8c3`) failed this regression. Final SQL locks the verified Auth identity and refreshes wall-clock expiry after role/profile locks. The reviewer inspected the final change and the exact Docker 11/11 receipt, and independently reran PGlite 9/9 plus Owner/content/catalog 20/20. No remaining P1/P2 was reported in this technical scope.

Independent direct cloud readback around 2026-10-10 18:36 UTC confirmed:

- All six deployed `prosrc` function bodies exactly match the final SQL; the identity lock and post-lock clock checks are present.
- All new functions and tables are owned by `postgres`; three public RPCs are SECURITY DEFINER with empty search_path and service-only EXECUTE. Private helpers remain SECURITY INVOKER and denied to client/service callers.
- Three private tables have RLS enabled, zero policies, no client/service private USAGE or table privileges. The reviewer checked all seven table privileges, including TRUNCATE, REFERENCES and TRIGGER.
- Official ledger is20 shared/aligned, 0 remote-only, 5 pending; target is the same healthy mcy-staging project in MagicpenDigital.
- Old Owner configuration function retains OID 19270, MD5 `5ad67fe52caf79bd07c51caa0c30db92`, trusted owner, ACL and empty search_path.
- AI remains off/version 1/model unset; review states/events/assignments remain 0 and audit rows 4.

The reviewer made no cloud mutation or RPC call. Parent-run hosted actor 14/14, focused UI 11/11, deployed Edge-source equality and Vercel artifact probes are separate evidence; they were not independently rerun by this reviewer. Actual expert/media-rights approval and a positive live assigned-teacher path remain untested. No successful live AI configuration save was performed.
