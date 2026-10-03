import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { readAiGatewayModels } from "../_shared/aiGateway.ts";
import { createAiAssistantHandler } from "../_shared/aiAssistant.ts";
import { readBoundedJson, RequestBodyTimeoutError, RequestBodyTooLargeError } from "../_shared/boundedRequest.ts";

const handler = createAiAssistantHandler({
  env: name => Deno.env.get(name),
  clients: authorization => {
    const url = Deno.env.get("SUPABASE_URL");
    const publishable = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
    const serviceSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !publishable || !serviceSecret) throw new Error("backend_unavailable");
    const options = { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } };
    const user = createClient(url, publishable, {
      ...options,
      global: { headers: { Authorization: authorization } },
    });
    const server = createClient(url, serviceSecret, options);
    return { user, server };
  },
  readModels: readAiGatewayModels,
  fetchGateway: (input, init) => fetch(input, init),
  readJson: readBoundedJson,
  isBodyTooLarge: error => error instanceof RequestBodyTooLargeError,
  isBodyTimeout: error => error instanceof RequestBodyTimeoutError,
  newRequestId: () => crypto.randomUUID(),
});

Deno.serve(handler);
