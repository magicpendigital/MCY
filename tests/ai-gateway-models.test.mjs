import assert from "node:assert/strict";
import test from "node:test";
import { readAiGatewayModels } from "../supabase/functions/_shared/aiGateway.ts";

test("AI Gateway model catalog uses server auth and returns only priced text models", async () => {
  let requestedUrl = "";
  let authorization = "";
  const models = await readAiGatewayModels("test-only-server-key", async (url, init) => {
    requestedUrl = String(url);
    authorization = new Headers(init?.headers).get("Authorization") ?? "";
    return Response.json({ data: [
      {
        id: "provider/model-text",
        name: "Text model",
        owned_by: "provider",
        type: "language",
        temperature: true,
        supported_parameters: ["response_format"],
        modalities: { input: ["text"], output: ["text"] },
        pricing: { input: "0.000001", output: "0.000002" },
      },
      {
        id: "provider/model-image",
        type: "image",
        modalities: { input: ["image"], output: ["image"] },
        pricing: { input: "0", output: "0" },
      },
      {
        id: "provider/model-unpriced",
        type: "language",
        temperature: true,
        supported_parameters: ["response_format"],
        modalities: { input: ["text"], output: ["text"] },
      },
    ] });
  });

  assert.equal(requestedUrl, "https://ai-gateway.vercel.sh/v1/models");
  assert.equal(authorization, "Bearer test-only-server-key");
  assert.deepEqual(models, [{
    id: "provider/model-text",
    name: "Text model",
    provider: "provider",
    inputCostPerToken: "0.000001",
    outputCostPerToken: "0.000002",
  }]);
});

test("AI Gateway model catalog fails closed without a key or on provider errors", async () => {
  await assert.rejects(readAiGatewayModels("", async () => Response.json({ data: [] })), /models_unavailable/);
  await assert.rejects(readAiGatewayModels("test-only-server-key", async () => new Response("unauthorized", { status: 401 })), /models_unavailable/);
});
