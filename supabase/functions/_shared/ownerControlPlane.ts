import { aiSpendGateOpen } from "./aiGates.ts";
import { handleContentReview } from "./contentReview.ts";

export type OwnerControlPlaneClients = {
  user: {
    auth: {
      getUser(token: string): Promise<{
        data: { user: { id?: string | null; email_confirmed_at?: string | null } | null };
        error: unknown | null;
      }>;
    };
  };
  server: {
    rpc(name: string, args: Record<string, unknown>): PromiseLike<{
      data: unknown;
      error: { code?: string; message?: string } | null;
    }>;
    // Private bucket access for the reading-unit preview images; optional so older adapters keep working.
    storage?: {
      from(bucket: string): {
        createSignedUrls(paths: string[], expiresIn: number): PromiseLike<{
          data: Array<{ path: string | null; signedUrl: string; error: string | null }> | null;
          error: unknown | null;
        }>;
      };
    };
  };
};

export type OwnerControlPlaneDependencies = {
  env(name: string): string | undefined;
  clients(authorization: string): OwnerControlPlaneClients;
  readModels(apiKey: string): Promise<Array<{ id: string }>>;
  readJson(request: Request, maxBytes: number): Promise<unknown>;
  isBodyTooLarge(error: unknown): boolean;
  isBodyTimeout(error: unknown): boolean;
};

const STAGING_SUPABASE_URL = "https://mhumbczqrzutdnraafhs.supabase.co";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Vary": "Origin",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

export function createOwnerControlPlaneHandler(dependencies: OwnerControlPlaneDependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (request.method !== "POST") return json(405, { error: "method_not_allowed" });
    const authorization = request.headers.get("Authorization") ?? "";
    const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return json(401, { error: "authentication_required" });
    if (dependencies.env("SUPABASE_URL")?.replace(/\/$/, "") !== STAGING_SUPABASE_URL) {
      return json(404, { error: "workspace_not_available" });
    }

    try {
      const { user, server } = dependencies.clients(authorization);
      const { data: identity, error: authError } = await user.auth.getUser(token);
      if (authError || !identity.user?.id || !identity.user.email_confirmed_at) {
        return json(401, { error: "authentication_required" });
      }
      let parsedPayload: unknown;
      try {
        parsedPayload = await dependencies.readJson(request, 32768);
      } catch (error) {
        if (dependencies.isBodyTooLarge(error)) return json(413, { error: "request_too_large" });
        if (dependencies.isBodyTimeout(error)) return json(408, { error: "request_timeout" });
        return json(400, { error: "invalid_request" });
      }
      if (!parsedPayload || typeof parsedPayload !== "object" || Array.isArray(parsedPayload)) {
        return json(400, { error: "invalid_request" });
      }
      const payload = parsedPayload as Record<string, unknown>;

      const review = await handleContentReview(payload, identity.user.id, server);
      if (review) return json(review.status, review.body);

      if (payload.action === "read_ai") {
        const { data: config, error } = await server.rpc("mcy_ai_get_owner_config", { p_actor_id: identity.user.id });
        if (error || !config) return json(403, { error: "owner_access_required" });
        const providerKey = dependencies.env("OPENROUTER_API_KEY");
        const spendControlApproved = dependencies.env("MCY_AI_SPEND_CONTROL_APPROVED") === "true";
        const enableGateOpen = aiSpendGateOpen({
          supabaseUrl: dependencies.env("SUPABASE_URL"),
          stagingEnabled: dependencies.env("MCY_AI_ENABLE_STAGING"),
          spendControlApproved: dependencies.env("MCY_AI_SPEND_CONTROL_APPROVED"),
          providerApiKey: providerKey,
        });
        // Owner catalogue readiness is a read, independent of inference admission.
        // Keep the DB switch, spend gate and learner cohort closed while choosing.
        const providerModels = dependencies.env("SUPABASE_URL")?.replace(/\/$/, "") === "https://mhumbczqrzutdnraafhs.supabase.co" && providerKey
          ? await dependencies.readModels(providerKey).catch(() => null) : null;
        // Applied Owner RPC cannot persist ':' variants; do not offer them.
        const models = providerModels?.filter(model => /^[a-z0-9][a-z0-9._/-]{1,200}$/.test(model.id)) ?? null;
        return json(200, {
          config,
          models,
          modelCatalogAvailable: Array.isArray(models),
          provider: "openrouter",
          providerKeyConfigured: Boolean(providerKey?.trim()),
          // Older AI-off clients may still read this field; never imply a Gateway key is configured.
          gatewayKeyConfigured: false,
          spendControlApproved,
          enableGateOpen,
          environment: "staging",
        });
      }

      if (payload.action === "save_ai") {
        const config = payload.config as Record<string, unknown> | null;
        if (!config || typeof config.enabled !== "boolean"
          || typeof config.model_id !== "string"
          || typeof config.system_prompt !== "string"
          || typeof config.temperature !== "number"
          || !Number.isInteger(config.max_output_tokens)
          || !Number.isInteger(config.per_user_daily_limit)
          || !Number.isInteger(config.global_daily_limit)
          || !Number.isInteger(config.version_no)) {
          return json(400, { error: "invalid_configuration" });
        }
        if (config.enabled && !aiSpendGateOpen({
          supabaseUrl: dependencies.env("SUPABASE_URL"),
          stagingEnabled: dependencies.env("MCY_AI_ENABLE_STAGING"),
          spendControlApproved: dependencies.env("MCY_AI_SPEND_CONTROL_APPROVED"),
          providerApiKey: dependencies.env("OPENROUTER_API_KEY"),
        })) {
          return json(409, { error: "ai_staging_gate_closed" });
        }
        if (config.enabled) {
          const { data: currentConfig, error: ownerError } = await server.rpc("mcy_ai_get_owner_config", { p_actor_id: identity.user.id });
          if (ownerError || !currentConfig) return json(403, { error: "owner_access_required" });
          if (Number((currentConfig as Record<string, unknown>).version_no) !== config.version_no) {
            return json(409, { error: "configuration_conflict" });
          }
          let availableModels: Array<{ id: string }>;
          try {
            availableModels = await dependencies.readModels(dependencies.env("OPENROUTER_API_KEY") ?? "");
          } catch {
            return json(503, { error: "model_catalog_unavailable" });
          }
          if (!availableModels.some(item => item.id === config.model_id)) {
            return json(400, { error: "unsupported_model" });
          }
        }
        const { data: saved, error } = await server.rpc("mcy_ai_save_owner_config", {
          p_actor_id: identity.user.id,
          p_expected_version: config.version_no,
          p_enabled: config.enabled,
          p_model_id: config.model_id,
          p_system_prompt: config.system_prompt,
          p_temperature: config.temperature,
          p_max_output_tokens: config.max_output_tokens,
          p_per_user_daily_limit: config.per_user_daily_limit,
          p_global_daily_limit: config.global_daily_limit,
        });
        if (error || !saved) {
          // A real serialization failure is infrastructure, not a business conflict.
          // Never retry here or infer a 409 from its potentially overlapping message.
          if (error?.code === "40001") return json(503, { error: "owner_service_unavailable" });
          if (error?.code === "PT409" || (!error?.code && error?.message?.includes("changed; reload"))) {
            return json(409, { error: "configuration_conflict" });
          }
          if (error?.code === "42501" || (!error?.code && error?.message?.includes("Owner role"))) {
            return json(403, { error: "owner_access_required" });
          }
          return json(400, { error: "configuration_rejected" });
        }
        return json(200, { config: saved });
      }

      return json(400, { error: "unsupported_action" });
    } catch {
      return json(503, { error: "owner_service_unavailable" });
    }
  };
}
