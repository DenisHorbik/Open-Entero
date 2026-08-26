import { addCrmAttachment } from "../../../lib/bitrix24";
import { verifyUploadToken } from "../../../lib/lead-security";
import { LeadValidationError, validateAttachment } from "../../../lib/lead-validation";

const attempts = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function clientIp(request: Request) {
  return request.headers.get("cf-connecting-ip")
    || request.headers.get("x-real-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}

function rateLimited(request: Request) {
  const now = Date.now();
  const ip = clientIp(request);
  const recent = (attempts.get(ip) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > MAX_ATTEMPTS;
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  if (rateLimited(request)) {
    return json({ ok: false, code: "rate_limit", message: "Слишком много попыток загрузки. Отправьте документ менеджеру через Telegram или Viber." }, 429);
  }
  try {
    const { token, attachmentId, file } = validateAttachment(await request.formData());
    const payload = await verifyUploadToken(token);
    if (!payload) return json({ ok: false, code: "validation", message: "Ссылка для загрузки устарела. Отправьте документ менеджеру через Telegram или Viber." }, 400);
    await addCrmAttachment(payload.dealId, payload.requestId, attachmentId, file);
    return json({ ok: true, fileName: file.name });
  } catch (error) {
    if (error instanceof LeadValidationError) return json({ ok: false, code: "validation", message: error.message }, 400);
    console.error("Lead attachment delivery failed", error instanceof Error ? { name: error.name, message: error.message } : "unknown");
    return json({ ok: false, code: "crm_unavailable", message: "Файл не загрузился. Попробуйте ещё раз или отправьте его менеджеру через мессенджер." }, 502);
  }
}
