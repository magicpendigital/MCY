import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { readBoundedJson, RequestBodyTimeoutError, RequestBodyTooLargeError } from "../_shared/boundedRequest.ts";
import {
  createTeacherControlPlaneHandler,
  hashTeacherInviteEmail,
  type TeacherControlPlaneClients,
} from "../_shared/teacherControlPlane.ts";

function clients(authorization: string): TeacherControlPlaneClients {
  const url = Deno.env.get("SUPABASE_URL");
  const publishable = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !publishable || !serviceKey) throw new Error("backend_unavailable");
  const user = createClient(url, publishable, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const server = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  return {
    user: user as unknown as TeacherControlPlaneClients["user"],
    server: server as unknown as TeacherControlPlaneClients["server"],
  };
}

Deno.serve(createTeacherControlPlaneHandler({
  env: name => Deno.env.get(name),
  clients,
  readJson: readBoundedJson,
  isBodyTooLarge: error => error instanceof RequestBodyTooLargeError,
  isBodyTimeout: error => error instanceof RequestBodyTimeoutError,
  hashInviteEmail: hashTeacherInviteEmail,
}));
