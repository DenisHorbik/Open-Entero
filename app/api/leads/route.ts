import { createCrmLead } from "../../lib/bitrix24";
import { createUploadToken } from "../../lib/lead-security";
import { LeadValidationError, validateLeadForm } from "../../lib/lead-validation";
import type { CrmLeadResult, ValidatedLead } from "../../lib/bitrix24";
import { assessRecaptcha } from "../../lib/recaptcha";

const attempts = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const activeRequests = new Map<string, Promise<CrmLeadResult>>();

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

function createLeadOnce(lead: ValidatedLead) {
  const running = activeRequests.get(lead.requestId);
  if (running) return running;
  const pending = createCrmLead(lead).finally(() => activeRequests.delete(lead.requestId));
  activeRequests.set(lead.requestId, pending);
  return pending;
}

export async function POST(request: Request) {
  if (rateLimited(request)) {
    return json({ ok: false, code: "rate_limit", message: "Слишком много попыток. Позвоните нам или повторите отправку через несколько минут." }, 429);
  }
  try {
    const lead = validateLeadForm(await request.formData());
    if ("honeypot" in lead) return json({ ok: true, requestId: lead.requestId, uploadToken: "" });
    const captcha = await assessRecaptcha(lead.recaptchaToken, clientIp(request));
    if (process.env.RECAPTCHA_MODE === "enforce" && captcha.status !== "passed") {
      return json({
        ok: false,
        code: "validation",
        message: "Не удалось подтвердить отправку. Обновите страницу и попробуйте ещё раз.",
      }, 400);
    }
    const result = await createLeadOnce({ ...lead, captcha });
    return json({
      ok: true,
      requestId: lead.requestId,
      uploadToken: await createUploadToken(result.dealId, lead.requestId),
      fileWarning: result.fileWarning,
    });
  } catch (error) {
    if (error instanceof LeadValidationError) return json({ ok: false, code: "validation", message: error.message }, 400);
    console.error("Lead delivery failed", error instanceof Error ? { name: error.name, message: error.message } : "unknown");
    return json({ ok: false, code: "crm_unavailable", message: "Не удалось отправить заявку. Проверьте интернет и попробуйте ещё раз или позвоните нам." }, 502);
  }
}
