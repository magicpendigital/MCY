export type AiGatewayModel = {
  id: string;
  name: string;
  provider: string;
  inputCostPerToken: string;
  outputCostPerToken: string;
};

type ModelRecord = {
  id: string;
  name?: string;
  owned_by?: string;
  type?: string;
  temperature?: boolean;
  supported_parameters?: string[];
  modalities?: { input?: string[]; output?: string[] };
  pricing?: { input?: string; output?: string };
};

const GATEWAY_MODELS_URL = "https://ai-gateway.vercel.sh/v1/models";

function isUsableModel(value: unknown): value is ModelRecord {
  if (!value || typeof value !== "object") return false;
  const item = value as ModelRecord;
  const params = item.supported_parameters ?? [];
  return typeof item.id === "string"
    && item.type === "language"
    && item.modalities?.input?.includes("text") === true
    && item.modalities?.output?.includes("text") === true
    && item.temperature === true
    && (params.includes("response_format") || params.includes("structured_outputs"))
    && typeof item.pricing?.input === "string"
    && typeof item.pricing?.output === "string";
}

export async function readAiGatewayModels(apiKey: string, fetcher: typeof fetch = fetch): Promise<AiGatewayModel[]> {
  if (!apiKey.trim()) throw new Error("models_unavailable");
  const response = await fetcher(GATEWAY_MODELS_URL, {
    signal: AbortSignal.timeout(8000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("models_unavailable");
  const body: unknown = await response.json();
  if (!body || typeof body !== "object" || !Array.isArray((body as { data?: unknown }).data)) {
    throw new Error("models_unavailable");
  }
  return (body as { data: unknown[] }).data.filter(isUsableModel).map(item => ({
    id: item.id,
    name: item.name ?? item.id,
    provider: item.owned_by ?? "",
    inputCostPerToken: item.pricing!.input!,
    outputCostPerToken: item.pricing!.output!,
  }));
}
