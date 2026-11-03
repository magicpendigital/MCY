import assert from "node:assert/strict";
import test from "node:test";
import { readOpenRouterModels, readOpenRouterJson } from "../supabase/functions/_shared/openRouter.ts";

test("OpenRouter catalogue uses the key-scoped endpoint and returns only bounded structured text models", async () => {
  let requestedUrl = "";
  let authorization = "";
  const models = await readOpenRouterModels("test-only-server-key", async (url, init) => {
    requestedUrl = String(url);
    authorization = new Headers(init?.headers).get("Authorization") ?? "";
    assert.equal(init.redirect, "error");
    assert.ok(init.signal instanceof AbortSignal);
    return Response.json({ data: [
      {
        id: "provider/model-text",
        name: "Text model",
        supported_parameters: ["response_format", "structured_outputs", "temperature", "max_tokens"],
        architecture: { input_modalities: ["text"], output_modalities: ["text"] },
        pricing: { prompt: "0.000001", completion: "0.000002" },
      },
      {
        id: "provider/model-image",
        architecture: { input_modalities: ["image"], output_modalities: ["image"] },
        pricing: { prompt: "0", completion: "0" },
      },
      {
        id: "provider/model-unpriced",
        supported_parameters: ["response_format"],
        architecture: { input_modalities: ["text"], output_modalities: ["text"] },
      },
    ] });
  });

  assert.equal(requestedUrl, "https://openrouter.ai/api/v1/models/user");
  assert.equal(authorization, "Bearer test-only-server-key");
  assert.deepEqual(models, [{
    id: "provider/model-text",
    name: "Text model",
    provider: "provider",
    inputCostPerToken: "0.000001",
    outputCostPerToken: "0.000002",
  }]);
});

test("OpenRouter catalogue fails closed without a key, on HTTP errors, redirects or malformed data", async () => {
  let calls = 0;
  await assert.rejects(readOpenRouterModels(" ", async () => { calls++; return Response.json({ data: [] }); }), /models_unavailable/);
  assert.equal(calls, 0);
  for (const status of [301, 401, 402, 403, 429, 500]) {
    await assert.rejects(readOpenRouterModels("fixture-key", async () => new Response("PRIVATE_PROVIDER_ERROR", { status })), /^Error: models_unavailable$/);
  }
  for (const value of [null, [], {}, { data: null }]) {
    await assert.rejects(readOpenRouterModels("fixture-key", async () => Response.json(value)), /models_unavailable/);
  }
  await assert.rejects(readOpenRouterModels("fixture-key", async () => { throw new Error("PRIVATE_KEY_OR_PROVIDER_DETAILS"); }), /^Error: models_unavailable$/);
});

test("OpenRouter catalogue excludes unsafe IDs, unsupported parameters, invalid prices and duplicates", async () => {
  const base = {
    id: "provider/model:free", name: "Model",
    architecture: { input_modalities: ["text"], output_modalities: ["text"] },
    supported_parameters: ["response_format", "structured_outputs", "temperature", "max_tokens"],
    pricing: { prompt: "0", completion: "0.000002" },
  };
  const data = [base, base, null, [],
    { ...base, id: "openrouter/auto" }, { ...base, id: "bad id" },
    { ...base, id: "provider/no-schema", supported_parameters: ["response_format", "temperature", "max_tokens"] },
    { ...base, id: "provider/bad-params", supported_parameters: "response_format" },
    { ...base, id: "provider/negative", pricing: { prompt: "-1", completion: "0" } },
    { ...base, id: "provider/nonfinite", pricing: { prompt: "Infinity", completion: "0" } },
    { ...base, id: "provider/unpriced", pricing: { prompt: "", completion: "0" } },
    { ...base, id: "provider/array-modality", architecture: { input_modalities: "text", output_modalities: ["text"] } },
  ];
  const models = await readOpenRouterModels("fixture-key", async () => Response.json({ data }));
  assert.deepEqual(models.map(model => model.id), [base.id]);
  assert.equal(models[0].inputCostPerToken, "0");
});

test("provider response reader rejects declared/streamed oversize and cancels unfinished bodies", async () => {
  let cancelled = false;
  const large = new Response(new ReadableStream({
    start(controller) { controller.enqueue(new TextEncoder().encode("x".repeat(40))); },
    cancel() { cancelled = true; },
  }));
  await assert.rejects(readOpenRouterJson(large, 32), /provider_response_too_large/);
  assert.equal(cancelled, true);
  await assert.rejects(readOpenRouterJson(new Response("{}", { headers: { "content-length": "100" } }), 32), /provider_response_too_large/);
  cancelled = false;
  const stalled = new Response(new ReadableStream({ cancel() { cancelled = true; } }));
  await assert.rejects(readOpenRouterJson(stalled, 32, 20), /provider_response_timeout/);
  assert.equal(cancelled, true);
});
