import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { readOpenRouterModels } from "../_shared/openRouter.ts";
import { readBoundedJson, RequestBodyTimeoutError, RequestBodyTooLargeError } from "../_shared/boundedRequest.ts";
import {
  createOwnerControlPlaneHandler,
  type OwnerControlPlaneClients,
} from "../_shared/ownerControlPlane.ts";

function clients(authorization: string): OwnerControlPlaneClients {
  const url = Deno.env.get("SUPABASE_URL");
  const publishable = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
  const serverKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !publishable || !serverKey) throw new Error("backend_unavailable");
  const user = createClient(url, publishable, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const server = createClient(url, serverKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  return {
    user: user as unknown as OwnerControlPlaneClients["user"],
    server: server as unknown as OwnerControlPlaneClients["server"],
  };
}

Deno.serve(createOwnerControlPlaneHandler({
  env: name => Deno.env.get(name),
  clients,
  readModels: readOpenRouterModels,
  readJson: readBoundedJson,
  isBodyTooLarge: error => error instanceof RequestBodyTooLargeError,
  isBodyTimeout: error => error instanceof RequestBodyTimeoutError,
}));
