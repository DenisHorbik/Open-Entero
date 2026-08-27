import type { StageId } from "../entero-content";
import {
  isValidLeadFile,
  MAX_LEAD_FILE_SIZE,
  type ContactMethod,
  type VenueType,
} from "../lead-preview";
import { normalizeInternationalPhone } from "./phone-validation";
import type { LeadAttribution } from "../lead-attribution";
import type { ValidatedLead } from "./bitrix24";

const stages = new Set<StageId>(["idea", "space", "project"]);
const contactMethods = new Set<ContactMethod>(["phone", "telegram", "viber"]);
const venueTypes = new Set<VenueType>([
  "unsure", "restaurant", "canteen", "bakery", "coffee", "hotel", "sanatorium", "production", "other",
]);

export class LeadValidationError extends Error {}

function field(formData: FormData, name: string, max: number) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseAttribution(value: string, stage: StageId): LeadAttribution {
  let raw: Record<string, unknown> = {};
  try {
    raw = JSON.parse(value || "{}") as Record<string, unknown>;
  } catch {
    throw new LeadValidationError("Некорректные данные источника заявки.");
  }
  const text = (key: string, max = 1500) => typeof raw[key] === "string" ? String(raw[key]).slice(0, max) : "";
  const initialStage = text("initialStage", 20);
  return {
    landingUrl: text("landingUrl"),
    referrer: text("referrer"),
    initialStage: stages.has(initialStage as StageId) ? initialStage as StageId : stage,
    currentStage: stage,
    utmSource: text("utmSource", 500) || undefined,
    utmMedium: text("utmMedium", 500) || undefined,
    utmCampaign: text("utmCampaign", 500) || undefined,
    utmContent: text("utmContent", 500) || undefined,
    utmTerm: text("utmTerm", 500) || undefined,
    gclid: text("gclid", 500) || undefined,
    yclid: text("yclid", 500) || undefined,
    ymclid: text("ymclid", 500) || undefined,
    concept: "A",
    theme: "premium-gold",
    heroVariant: "A1",
  };
}

export function validateLeadForm(formData: FormData): ValidatedLead | { honeypot: true; requestId: string } {
  const requestId = field(formData, "idempotencyKey", 100);
  if (!/^[a-zA-Z0-9_-]{8,100}$/.test(requestId)) throw new LeadValidationError("Не удалось подготовить заявку. Обновите страницу и попробуйте ещё раз.");
  if (field(formData, "website", 200)) return { honeypot: true, requestId };

  const stage = field(formData, "stage", 20) as StageId;
  const phoneInput = field(formData, "phone", 40);
  const contactMethod = field(formData, "contactMethod", 20) as ContactMethod;
  const venueType = field(formData, "venueType", 30) as VenueType;
  const name = field(formData, "name", 100);
  if (!stages.has(stage)) throw new LeadValidationError("Не определена стадия проекта.");
  if (!/^\+\d{7,15}$/.test(phoneInput)) {
    throw new LeadValidationError("Телефон должен содержать только знак +, код страны и цифры.");
  }
  const phone = normalizeInternationalPhone(phoneInput);
  if (!phone) throw new LeadValidationError("Введите полный номер с кодом страны, например +375445002929.");
  if (!contactMethods.has(contactMethod)) throw new LeadValidationError("Выберите удобный способ связи.");
  if (!venueTypes.has(venueType)) throw new LeadValidationError("Выберите тип объекта.");

  const fileValue = formData.get("file");
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  if (file && (!isValidLeadFile(file) || file.size > MAX_LEAD_FILE_SIZE)) {
    throw new LeadValidationError("Подойдут PDF, Excel, Word, JPG или PNG размером до 20 МБ.");
  }

  return {
    requestId,
    stage,
    phone,
    contactMethod,
    venueType,
    name,
    recaptchaToken: field(formData, "recaptchaToken", 4096),
    file,
    attribution: parseAttribution(field(formData, "attribution", 10_000), stage),
  };
}

export function validateAttachment(formData: FormData) {
  const token = field(formData, "uploadToken", 2500);
  const attachmentId = field(formData, "attachmentId", 100);
  const fileValue = formData.get("file");
  if (!token || !/^[a-zA-Z0-9_-]{8,100}$/.test(attachmentId)) throw new LeadValidationError("Ссылка для загрузки устарела.");
  if (!(fileValue instanceof File) || !fileValue.size || !isValidLeadFile(fileValue) || fileValue.size > MAX_LEAD_FILE_SIZE) {
    throw new LeadValidationError("Подойдут PDF, Excel, Word, JPG или PNG размером до 20 МБ.");
  }
  return { token, attachmentId, file: fileValue };
}
