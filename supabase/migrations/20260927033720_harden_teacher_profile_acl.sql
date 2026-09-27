-- Keep teacher profiles readable through the existing active/owner SELECT policy,
-- but make all teacher-role writes server-controlled. RLS does not replace SQL
-- privileges: TRUNCATE and other table privileges can bypass row policies.
REVOKE ALL PRIVILEGES ON TABLE public.teachers FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.teachers TO anon, authenticated;

DROP POLICY IF EXISTS teachers_insert_owner ON public.teachers;
DROP POLICY IF EXISTS teachers_update_owner ON public.teachers;
DROP POLICY IF EXISTS teachers_delete_owner ON public.teachers;
