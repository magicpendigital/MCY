-- LOCAL-ONLY forward repair; applying this file needs separate staging approval.
-- Replace exactly one business-conflict SQLSTATE, not a real serialization failure.
-- Single DO statement is atomic and refuses definition/ACL drift. No data writes,
-- new grants, DROP, AI enablement or other pending migrations are bundled here.
do $repair$
declare
  v_oid oid := pg_catalog.to_regprocedure(
    'public.mcy_ai_save_owner_config(uuid,integer,boolean,text,text,numeric,integer,integer,integer)'
  );
  v_definition text;
  v_fingerprint text;
  v_before record;
  v_after record;
begin
  if v_oid is null then
    raise exception using errcode = 'P0001', message = 'Owner conflict repair requires the reviewed existing RPC';
  end if;

  select p.proowner, p.proacl, p.proconfig, p.prosecdef into strict v_before
  from pg_catalog.pg_proc p where p.oid = v_oid;
  v_definition := pg_catalog.pg_get_functiondef(v_oid);
  v_fingerprint := pg_catalog.md5(v_definition);
  -- These are definition fingerprints, not credential or user-data digests.
  if v_fingerprint not in (
    '1591e77afdfc0dacb6b39200d7bbefc2', -- reviewed deployed definition
    '5ad67fe52caf79bd07c51caa0c30db92'  -- same definition, only PT409 substituted
  ) then
    raise exception using errcode = 'P0001', message = 'Owner conflict repair refused definition drift';
  end if;
  if pg_catalog.pg_get_userbyid(v_before.proowner) <> 'postgres'
     or v_before.proacl::text is distinct from '{postgres=X/postgres,service_role=X/postgres}'
     or pg_catalog.has_function_privilege('anon', v_oid, 'EXECUTE')
     or pg_catalog.has_function_privilege('authenticated', v_oid, 'EXECUTE')
     or not pg_catalog.has_function_privilege('service_role', v_oid, 'EXECUTE')
     or pg_catalog.has_schema_privilege('anon', 'private', 'USAGE')
     or pg_catalog.has_schema_privilege('authenticated', 'private', 'USAGE')
     or pg_catalog.has_schema_privilege('service_role', 'private', 'USAGE') then
    raise exception using errcode = 'P0001', message = 'Owner conflict repair refused permission drift';
  end if;

  if v_fingerprint = '1591e77afdfc0dacb6b39200d7bbefc2' then
    v_definition := pg_catalog.replace(v_definition, 'errcode = ''40001''', 'errcode = ''PT409''');
    if pg_catalog.md5(v_definition) <> '5ad67fe52caf79bd07c51caa0c30db92' then
      raise exception using errcode = 'P0001', message = 'Owner conflict repair refused an unexpected replacement';
    end if;
    -- The only executable text is the exact fingerprint-checked existing definition.
    -- CREATE OR REPLACE preserves its identity, owner and ACL; no DROP or re-grant.
    execute v_definition;
  end if;

  select p.proowner, p.proacl, p.proconfig, p.prosecdef into strict v_after
  from pg_catalog.pg_proc p where p.oid = v_oid;
  if pg_catalog.to_jsonb(v_after) is distinct from pg_catalog.to_jsonb(v_before)
     or pg_catalog.md5(pg_catalog.pg_get_functiondef(v_oid)) <> '5ad67fe52caf79bd07c51caa0c30db92' then
    raise exception using errcode = 'P0001', message = 'Owner conflict repair failed preservation checks';
  end if;
end
$repair$;
