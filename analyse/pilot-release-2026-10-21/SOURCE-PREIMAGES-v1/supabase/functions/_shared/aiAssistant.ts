import { aiSpendGateOpen } from "./aiGates.ts";
import { containsDirectIdentifiers } from "./aiPrivacy.ts";
import { containsUnsafeMedicalAdvice } from "./aiSafety.ts";

const GATEWAY_CHAT_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const AI_CONSENT_VERSION = "ai-processing-review-1.0";
const STAGING_SUPABASE_URL = "https://mhumbczqrzutdnraafhs.supabase.co";
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
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AiConfig = {
  enabled: boolean;
  model_id: string;
  system_prompt: string;
  temperature: number;
  max_output_tokens: number;
};

export type AiAssistantClients = {
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
      error: { message?: string } | null;
    }>;
  };
};

export type AiAssistantDependencies = {
  env(name: string): string | undefined;
  clients(authorization: string): AiAssistantClients;
  readModels(apiKey: string): Promise<Array<{ id: string }>>;
  fetchGateway(input: string | URL | Request, init?: RequestInit): Promise<Response>;
  readJson(request: Request, maxBytes: number): Promise<unknown>;
  isBodyTooLarge(error: unknown): boolean;
  isBodyTimeout(error: unknown): boolean;
  newRequestId(): string;
};

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validTokenCount(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100_000 ? value : null;
}

async function readBoundedGatewayJson(response: Response, maxBytes: number): Promise<unknown> {
  const declaredLength = response.headers.get("content-length");
  if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > maxBytes)) {
    throw new Error("gateway_response_too_large");
  }
  if (!response.body) throw new Error("empty_gateway_response");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new Error("gateway_response_too_large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

export function createAiAssistantHandler(dependencies: AiAssistantDependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (request.method !== "POST") return json(405, { error: "method_not_allowed" });

    const authorization = request.headers.get("Authorization") ?? "";
    const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return json(401, { error: "authentication_required" });
    if (!aiSpendGateOpen({
      supabaseUrl: dependencies.env("SUPABASE_URL"),
      stagingEnabled: dependencies.env("MCY_AI_ENABLE_STAGING"),
      spendControlApproved: dependencies.env("MCY_AI_SPEND_CONTROL_APPROVED"),
      gatewayApiKey: dependencies.env("AI_GATEWAY_API_KEY"),
    })) {
      return json(404, { error: "ai_temporarily_unavailable" });
    }

    let actorId = "";
    let requestId = "";
    let serverClient: AiAssistantClients["server"] | null = null;
    let usageStarted = false;
    let usageStatus: "succeeded" | "failed" = "failed";
    let modelUsed = "";
    let inputTokens: number | null = null;
    let outputTokens: number | null = null;
    let errorCode = "request_failed";

    try {
      const { user, server } = dependencies.clients(authorization);
      serverClient = server;
      const { data: userData, error: authError } = await user.auth.getUser(token);
      if (authError || !userData.user?.id || !userData.user.email_confirmed_at) {
        return json(401, { error: "authentication_required" });
      }
      actorId = userData.user.id;

      let parsedPayload: unknown;
      try {
        parsedPayload = await dependencies.readJson(request, 8192);
      } catch (error) {
        if (dependencies.isBodyTooLarge(error)) return json(413, { error: "request_too_large" });
        if (dependencies.isBodyTimeout(error)) return json(408, { error: "request_timeout" });
        return json(400, { error: "invalid_request" });
      }
      if (!isRecord(parsedPayload)) return json(400, { error: "invalid_request" });
      const payload = parsedPayload;
      const message = typeof payload.message === "string" ? payload.message.trim() : "";
      const context = isRecord(payload.context) ? payload.context : null;
      const turns = safeTurns(payload.turns ?? []);
      const locale = context?.locale;
      const minutes = context?.minutes;
      const energy = context?.energy;
      const intent = context?.intent;
      const regions = context?.regions;
      if (!message || message.length > 500 || !turns || turns.length > 0
        || (locale !== "vi-VN" && locale !== "en-US")
        || !Number.isInteger(minutes) || (minutes as number) < 1 || (minutes as number) > 60
        || (energy !== null && !["Rất thấp", "Thấp", "Bình thường", "Khá ổn", "Tràn đầy"].includes(String(energy)))
        || !["Thả lỏng", "Bắt nhịp", "Tập trung"].includes(String(intent))
        || !Array.isArray(regions) || regions.length > 20
        || regions.some(region => typeof region !== "string" || !SAFE_REGION_CODES.has(region))) {
        return json(400, { error: "invalid_request" });
      }
      if (containsDirectIdentifiers(message)) {
        return json(400, { error: "message_contains_identifiers" });
      }

      const gatewayKey = dependencies.env("AI_GATEWAY_API_KEY");
      if (!gatewayKey?.trim()) return json(503, { error: "ai_provider_not_configured" });

      requestId = typeof payload.requestId === "string" && UUID_PATTERN.test(payload.requestId)
        ? payload.requestId
        : dependencies.newRequestId();
      const { data: configData, error: beginError } = await server.rpc("mcy_ai_begin_request", {
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
      const config = configData as AiConfig | null;
      if (!config || typeof config !== "object" || !config.enabled
        || typeof config.model_id !== "string" || !/^[a-z0-9][a-z0-9._/-]{1,200}$/.test(config.model_id)
        || typeof config.system_prompt !== "string" || config.system_prompt.trim().length < 40 || config.system_prompt.length > 6000
        || typeof config.temperature !== "number" || !Number.isFinite(config.temperature)
        || config.temperature < 0 || config.temperature > 0.7
        || typeof config.max_output_tokens !== "number" || !Number.isInteger(config.max_output_tokens)
        || config.max_output_tokens < 64 || config.max_output_tokens > 512) {
        errorCode = "invalid_configuration";
        return json(503, { error: "ai_temporarily_unavailable" });
      }

      let models: Array<{ id: string }>;
      try {
        models = await dependencies.readModels(gatewayKey);
      } catch {
        errorCode = "model_catalog_unavailable";
        return json(503, { error: "ai_temporarily_unavailable" });
      }
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
        currentMessage: message,
      };
      const gatewayResponse = await dependencies.fetchGateway(GATEWAY_CHAT_URL, {
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

      let completion: Record<string, unknown>;
      try {
        const responseBody: unknown = await readBoundedGatewayJson(gatewayResponse, 32_768);
        if (!isRecord(responseBody)) throw new Error("invalid_model_response");
        completion = responseBody;
      } catch {
        errorCode = "invalid_model_response";
        return json(502, { error: "ai_temporarily_unavailable" });
      }
      const usage = isRecord(completion.usage) ? completion.usage : null;
      inputTokens = validTokenCount(usage?.prompt_tokens);
      outputTokens = validTokenCount(usage?.completion_tokens);
      const choices = completion.choices;
      const firstChoice = Array.isArray(choices) && isRecord(choices[0]) ? choices[0] : null;
      const assistantMessage = firstChoice && isRecord(firstChoice.message) ? firstChoice.message : null;
      const content = assistantMessage?.content;
      if (typeof content !== "string") {
        errorCode = "invalid_model_response";
        return json(502, { error: "ai_temporarily_unavailable" });
      }
      let parsed: { reply?: unknown };
      try {
        const responseValue: unknown = JSON.parse(content);
        if (!isRecord(responseValue)) throw new Error("invalid_model_response");
        parsed = responseValue;
      } catch {
        errorCode = "invalid_model_response";
        return json(502, { error: "ai_temporarily_unavailable" });
      }
      const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
      if (Object.keys(parsed).length !== 1 || !reply || reply.length > 360 || containsDirectIdentifiers(reply)) {
        errorCode = "invalid_model_response";
        return json(502, { error: "ai_temporarily_unavailable" });
      }
      if (containsUnsafeMedicalAdvice(reply)) {
        errorCode = "unsafe_model_response";
        return json(502, { error: "ai_temporarily_unavailable" });
      }

      usageStatus = "succeeded";
      errorCode = "";
      return json(200, { reply, requestId, consentPolicyVersion: AI_CONSENT_VERSION });
    } catch {
      return json(503, { error: "ai_temporarily_unavailable" });
    } finally {
      if (usageStarted && actorId && requestId && serverClient) {
        try {
          const result = await serverClient.rpc("mcy_ai_finish_request", {
            p_actor_id: actorId,
            p_request_id: requestId,
            p_model_id: modelUsed,
            p_input_tokens: inputTokens,
            p_output_tokens: outputTokens,
            p_status: usageStatus,
            p_error_code: usageStatus === "succeeded" ? null : errorCode || "request_failed",
          });
          if (result.error || result.data !== true) return json(503, { error: "ai_temporarily_unavailable" });
        } catch {
          return json(503, { error: "ai_temporarily_unavailable" });
        }
      }
    }
  };
}
