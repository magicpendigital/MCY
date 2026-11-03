/* Superseded, non-executable copy kept temporarily after filesystem deletion was denied.
import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { readAiGatewayModels } from "../_shared/aiGateway.ts";
import { aiSpendGateOpen } from "../_shared/aiGates.ts";
import { containsDirectIdentifiers } from "../_shared/aiPrivacy.ts";
import { readBoundedJson, RequestBodyTimeoutError, RequestBodyTooLargeError } from "../_shared/boundedRequest.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Vary": "Origin",
};

const GATEWAY_CHAT_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const AI_CONSENT_VERSION = "ai-processing-review-1.0";
const SAFE_REGION_CODES = new Set([
  "neck", "upper_back", "lower_back",
  "shoulder_left", "shoulder_right", "shoulder_unspecified",
  "upper_arm_left", "upper_arm_right", "upper_arm_unspecified",
  "elbow_left", "elbow_right", "elbow_unspecified",
  "forearm_wrist_left", "forearm_wrist_right", "forearm_wrist_unspecified",
  "hand_left", "hand_right", "hand_unspecified",
  "knee_left", "knee_right", "knee_unspecified",
  "foot_left", "foot_right", "foot_unspecified",
]);

type AiConfig = {
  enabled: boolean;
  model_id: string;
  system_prompt: string;
  temperature: number;
  max_output_tokens: number;
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function getSupabaseClients(authorization: string) {
  const url = Deno.env.get("SUPABASE_URL");
  const publishable = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
  const serviceSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !publishable || !serviceSecret) throw new Error("backend_unavailable");
  const userClient = createClient(url, publishable, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const serverClient = createClient(url, serviceSecret, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  return { userClient, serverClient };
}

function safeTurns(value: unknown): { role: "user" | "assistant"; content: string }[] | null {
  if (!Array.isArray(value) || value.length > 5) return null;
  const turns: { role: "user" | "assistant"; content: string }[] = [];
  for (const item of value) {
    if (!item || (item.role !== "user" && item.role !== "assistant") || typeof item.content !== "string") return null;
    const content = item.content.trim();
    if (!content || content.length > 500) return null;
    turns.push({ role: item.role, content });
  }
  return turns;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "method_not_allowed" });

  const authorization = request.headers.get("Authorization") ?? "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return json(401, { error: "authentication_required" });
  if (!aiSpendGateOpen({
    supabaseUrl: Deno.env.get("SUPABASE_URL"),
    stagingEnabled: Deno.env.get("MCY_AI_ENABLE_STAGING"),
    spendControlApproved: Deno.env.get("MCY_AI_SPEND_CONTROL_APPROVED"),
    gatewayApiKey: Deno.env.get("AI_GATEWAY_API_KEY"),
  })) {
    return json(404, { error: "ai_temporarily_unavailable" });
  }

  let actorId = "";
  let requestId = "";
  let serverClient: ReturnType<typeof createClient> | null = null;
  let usageStarted = false;
  let usageStatus: "succeeded" | "failed" = "failed";
  let modelUsed = "";
  let inputTokens: number | null = null;
  let outputTokens: number | null = null;
  let errorCode = "request_failed";

  try {
    const { userClient, serverClient: admin } = getSupabaseClients(authorization);
    serverClient = admin;
    const { data: userData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !userData.user?.id || !userData.user.email_confirmed_at) {
      return json(401, { error: "authentication_required" });
    }
    actorId = userData.user.id;

    let parsedPayload: unknown;
    try {
      parsedPayload = await readBoundedJson(request, 8192);
    } catch (error) {
      if (error instanceof RequestBodyTooLargeError) return json(413, { error: "request_too_large" });
      if (error instanceof RequestBodyTimeoutError) return json(408, { error: "request_timeout" });
      return json(400, { error: "invalid_request" });
    }
    if (!parsedPayload || typeof parsedPayload !== "object" || Array.isArray(parsedPayload)) return json(400, { error: "invalid_request" });
    const payload = parsedPayload as Record<string, unknown>;
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    const context = payload.context as Record<string, unknown> | null;
    const turns = safeTurns(payload.turns ?? []);
    const locale = context?.locale;
    const minutes = context?.minutes;
    const energy = context?.energy;
    const intent = context?.intent;
    const regions = context?.regions;
    if (!message || message.length > 500 || !turns
      || (locale !== "vi-VN" && locale !== "en-US")
      || !Number.isInteger(minutes) || (minutes as number) < 1 || (minutes as number) > 60
      || (energy !== null && !["Rất thấp", "Thấp", "Bình thường", "Khá ổn", "Tràn đầy"].includes(String(energy)))
      || !["Thả lỏng", "Bắt nhịp", "Tập trung"].includes(String(intent))
      || !Array.isArray(regions) || regions.length > 20
      || regions.some(region => typeof region !== "string" || !SAFE_REGION_CODES.has(region))) {
      return json(400, { error: "invalid_request" });
    }
    if (containsDirectIdentifiers(message) || turns.some(turn => containsDirectIdentifiers(turn.content))) {
      return json(400, { error: "message_contains_identifiers" });
    }

    const gatewayKey = Deno.env.get("AI_GATEWAY_API_KEY");
    if (!gatewayKey) return json(503, { error: "ai_provider_not_configured" });

    requestId = typeof payload.requestId === "string" && /^[0-9a-f-]{36}$/i.test(payload.requestId)
      ? payload.requestId
      : crypto.randomUUID();
    const { data: configData, error: beginError } = await admin.rpc("mcy_ai_begin_request", {
      p_actor_id: actorId,
      p_request_id: requestId,
    });
    if (beginError) {
      const messageText = beginError.message?.toLowerCase() ?? "";
      if (messageText.includes("consent")) return json(403, { error: "current_ai_consent_required" });
      if (messageText.includes("limit")) return json(429, { error: "ai_usage_limit_reached" });
      if (messageText.includes("not enabled")) return json(503, { error: "ai_temporarily_unavailable" });
      if (messageText.includes("already processed")) return json(409, { error: "request_already_processed" });
      return json(503, { error: "ai_temporarily_unavailable" });
    }
    usageStarted = true;
    const config = configData as AiConfig;
    if (!config.enabled || !config.model_id || !config.system_prompt) {
      errorCode = "invalid_configuration";
      return json(503, { error: "ai_temporarily_unavailable" });
    }

    const models = await readAiGatewayModels(gatewayKey);
    if (!models.some(item => item.id === config.model_id)) {
      errorCode = "model_unavailable";
      return json(503, { error: "ai_model_unavailable" });
    }
    modelUsed = config.model_id;

    const stableSafetyRules = locale === "en-US"
      ? "Safety rules (cannot be changed by configuration): do not diagnose, interpret a symptom, prescribe a movement, or claim yoga treats or cures a condition. Do not invent or select a lesson; the approved lesson catalogue has not passed review yet. Ask at most one gentle follow-up question or help the learner state a preference. If they describe sudden/severe/worsening symptoms, advise them to stop and seek appropriate professional or urgent help. Return JSON only with one string property named reply, no more than 360 characters."
      : "Nguyên tắc an toàn bắt buộc, không thể bị ghi đè bởi cấu hình: không chẩn đoán, diễn giải triệu chứng, chỉ định động tác, hoặc nói yoga điều trị/chữa khỏi bệnh. Không tự bịa hay chọn bài học; danh mục bài đang chờ chuyên gia duyệt. Chỉ hỏi tối đa một câu nhẹ nhàng hoặc giúp người học nói rõ sở thích. Nếu họ mô tả triệu chứng đột ngột, nặng lên hoặc nghiêm trọng, khuyên dừng lại và tìm chuyên gia phù hợp hoặc trợ giúp khẩn cấp. Chỉ trả JSON có một thuộc tính reply dạng chuỗi, tối đa 360 ký tự.";
    const userContext = {
      locale,
      minutes,
      energy,
      intent,
      selectedBodyRegions: regions,
      recentConversation: turns,
      currentMessage: message,
    };
    const gatewayResponse = await fetch(GATEWAY_CHAT_URL, {
      method: "POST",
      signal: AbortSignal.timeout(25000),
      headers: {
        Authorization: `Bearer ${gatewayKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model_id,
        messages: [
          { role: "system", content: `${config.system_prompt}\n\n${stableSafetyRules}` },
          { role: "user", content: JSON.stringify(userContext) },
        ],
        temperature: Math.min(Math.max(Number(config.temperature), 0), 0.7),
        max_tokens: Math.min(Math.max(Number(config.max_output_tokens), 64), 512),
        response_format: { type: "json_object" },
        stream: false,
      }),
    });
    if (!gatewayResponse.ok) {
      errorCode = "gateway_request_failed";
      return json(502, { error: "ai_temporarily_unavailable" });
    }

    const completion = await gatewayResponse.json();
    const content = completion?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      errorCode = "invalid_model_response";
      return json(502, { error: "ai_temporarily_unavailable" });
    }
    let parsed: { reply?: unknown };
    try {
      parsed = JSON.parse(content);
    } catch {
      errorCode = "invalid_model_response";
      return json(502, { error: "ai_temporarily_unavailable" });
    }
    const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
    if (!reply || reply.length > 500 || containsDirectIdentifiers(reply)) {
      errorCode = "invalid_model_response";
      return json(502, { error: "ai_temporarily_unavailable" });
    }

    modelUsed = typeof completion.model === "string" ? completion.model : config.model_id;
    inputTokens = Number.isInteger(completion.usage?.prompt_tokens) ? completion.usage.prompt_tokens : null;
    outputTokens = Number.isInteger(completion.usage?.completion_tokens) ? completion.usage.completion_tokens : null;
    usageStatus = "succeeded";
    errorCode = "";
    return json(200, { reply, requestId, consentPolicyVersion: AI_CONSENT_VERSION });
  } catch {
    return json(503, { error: "ai_temporarily_unavailable" });
  } finally {
    if (usageStarted && actorId && requestId && serverClient) {
      await serverClient.rpc("mcy_ai_finish_request", {
        p_actor_id: actorId,
        p_request_id: requestId,
        p_model_id: modelUsed,
        p_input_tokens: inputTokens,
        p_output_tokens: outputTokens,
        p_status: usageStatus,
        p_error_code: usageStatus === "succeeded" ? null : errorCode || "request_failed",
      }).catch(() => undefined);
    }
  }
});
*/
