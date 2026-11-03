export type AiProviderModel = {
  id: string;
  name: string;
  provider: string;
  inputCostPerToken: string;
  outputCostPerToken: string;
};

export const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODELS_URL = "https://openrouter.ai/api/v1/models/user";

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isOpenRouterModelId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9][a-z0-9._:/-]{1,200}$/.test(value)
    && value.includes("/") && !value.startsWith("openrouter/");
}

function validPrice(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== ""
    && Number.isFinite(Number(value)) && Number(value) >= 0;
}

// Bound streamed responses too; never serialize raw provider errors to callers/logs.
export async function readOpenRouterJson(response: Response, maxBytes: number, timeoutMs = 8000): Promise<unknown> {
  const length = response.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > maxBytes)) {
    void response.body?.cancel().catch(() => undefined);
    throw new Error("provider_response_too_large");
  }
  if (!response.body) throw new Error("empty_provider_response");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error("provider_response_timeout"));
      void reader.cancel().catch(() => undefined);
    }, timeoutMs);
  });
  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(), timedOut]);
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new Error("provider_response_too_large");
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch (error) {
    void reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
}

export async function readOpenRouterModels(apiKey: string, fetcher: typeof fetch = fetch): Promise<AiProviderModel[]> {
  if (!apiKey.trim()) throw new Error("models_unavailable");
  try {
    const response = await fetcher(MODELS_URL, {
      signal: AbortSignal.timeout(8000),
      redirect: "error",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    });
    if (!response.ok) {
      void response.body?.cancel().catch(() => undefined);
      throw new Error("models_unavailable");
    }
    const body = await readOpenRouterJson(response, 4 * 1024 * 1024);
    if (!record(body) || !Array.isArray(body.data)) throw new Error("models_unavailable");
    const models: AiProviderModel[] = [];
    const seen = new Set<string>();
    for (const item of body.data) {
      if (!record(item) || !isOpenRouterModelId(item.id) || seen.has(item.id)) continue;
      const architecture = record(item.architecture) ? item.architecture : null;
      const pricing = record(item.pricing) ? item.pricing : null;
      const parameters = item.supported_parameters;
      if (!Array.isArray(architecture?.input_modalities) || !architecture.input_modalities.includes("text")
        || !Array.isArray(architecture?.output_modalities) || !architecture.output_modalities.includes("text")
        || !Array.isArray(parameters)
        || !["temperature", "max_tokens", "response_format", "structured_outputs"].every(value => parameters.includes(value))
        || !validPrice(pricing?.prompt) || !validPrice(pricing?.completion)) continue;
      seen.add(item.id);
      models.push({
        id: item.id,
        name: typeof item.name === "string" && item.name.trim() ? item.name.slice(0, 200) : item.id,
        provider: item.id.split("/")[0],
        inputCostPerToken: pricing.prompt,
        outputCostPerToken: pricing.completion,
      });
    }
    return models;
  } catch {
    throw new Error("models_unavailable");
  }
}
