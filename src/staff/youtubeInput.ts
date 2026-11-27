// Turns what a teacher pastes into the 11-character YouTube video id the content workspace stores. Accepts the bare id or a link on a
// known YouTube host (watch?v=, youtu.be/, /shorts/, /embed/, /live/, /v/). Anything else returns null; the server still checks the id.
const idPattern = /^[A-Za-z0-9_-]{11}$/;
const hosts = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com", "youtu.be", "www.youtu.be"]);
const pathKinds = new Set(["shorts", "embed", "live", "v"]);

export function youtubeIdFrom(input: string): string | null {
  const text = input.trim();
  if (idPattern.test(text)) return text;
  if (!text) return null;
  let url: URL;
  try { url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`); } catch { return null; }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase();
  if (!hosts.has(host)) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  let candidate: string | null = null;
  if (host === "youtu.be" || host === "www.youtu.be") candidate = parts[0] ?? null;
  else if (parts[0] === "watch") candidate = url.searchParams.get("v");
  else if (parts.length >= 2 && pathKinds.has(parts[0])) candidate = parts[1];
  return candidate && idPattern.test(candidate) ? candidate : null;
}
