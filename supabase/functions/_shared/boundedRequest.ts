export class RequestBodyTooLargeError extends Error {
  constructor() {
    super("request_body_too_large");
    this.name = "RequestBodyTooLargeError";
  }
}

export class RequestBodyTimeoutError extends Error {
  constructor() {
    super("request_body_timeout");
    this.name = "RequestBodyTimeoutError";
  }
}

const DEFAULT_REQUEST_BODY_TIMEOUT_MS = 15_000;

/** Read and parse a JSON request only after enforcing a byte limit on the stream. */
export async function readBoundedJson(
  request: Request,
  maxBytes: number,
  timeoutMs = DEFAULT_REQUEST_BODY_TIMEOUT_MS,
): Promise<unknown> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > maxBytes)) {
    throw new RequestBodyTooLargeError();
  }
  if (!request.body) throw new SyntaxError("empty_request_body");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new RequestBodyTimeoutError()), timeoutMs);
  });
  const cancelReader = () => { void reader.cancel().catch(() => undefined); };

  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(), timeout]);
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        cancelReader();
        throw new RequestBodyTooLargeError();
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof RequestBodyTimeoutError) cancelReader();
    throw error;
  } finally {
    if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}
