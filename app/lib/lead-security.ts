type UploadTokenPayload = { dealId: number; requestId: string; expiresAt: number };

function base64UrlEncode(value: Uint8Array | string) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmac(value: string) {
  const secret = process.env.LEAD_UPLOAD_SECRET?.trim();
  if (!secret || secret.length < 32) throw new Error("LEAD_UPLOAD_SECRET must contain at least 32 characters");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

export async function createUploadToken(dealId: number, requestId: string) {
  const payload = base64UrlEncode(JSON.stringify({ dealId, requestId, expiresAt: Date.now() + 48 * 60 * 60 * 1000 }));
  return `${payload}.${base64UrlEncode(await hmac(payload))}`;
}

export async function verifyUploadToken(token: string): Promise<UploadTokenPayload | null> {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = base64UrlEncode(await hmac(payload));
  if (expected.length !== signature.length) return null;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) mismatch |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  if (mismatch !== 0) return null;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as UploadTokenPayload;
    if (!Number.isInteger(parsed.dealId) || parsed.dealId <= 0 || !parsed.requestId || parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}
