import type { StageId } from "./entero-content";
import type { LeadAttribution } from "./lead-attribution";

export type ContactMethod = "phone" | "telegram" | "viber";
export type VenueType =
  | "unsure"
  | "restaurant"
  | "canteen"
  | "bakery"
  | "coffee"
  | "hotel"
  | "sanatorium"
  | "production"
  | "other";

export type LeadDraft = {
  idempotencyKey: string;
  stage: StageId;
  phone: string;
  contactMethod: ContactMethod;
  venueType: VenueType;
  name: string;
  website?: string;
  attribution: LeadAttribution;
  file?: File | null;
};

export type LeadSubmitSuccess = {
  ok: true;
  requestId: string;
  uploadToken: string;
  fileWarning?: string;
};

export type LeadSubmitFailure = {
  ok: false;
  code: "validation" | "rate_limit" | "crm_unavailable";
  message: string;
};

export type LeadSubmitResult = LeadSubmitSuccess | LeadSubmitFailure;

export class LeadDeliveryError extends Error {
  constructor(readonly code: LeadSubmitFailure["code"], message: string) {
    super(message);
  }
}

export const MAX_LEAD_FILE_SIZE = 20 * 1024 * 1024;
export const LEAD_FILE_ACCEPT = ".pdf,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png";

export const contactMethods: Array<{ value: ContactMethod; label: string }> = [
  { value: "phone", label: "Позвонить" },
  { value: "telegram", label: "Telegram" },
  { value: "viber", label: "Viber" },
];

export const venueTypes: Array<{ value: VenueType; label: string }> = [
  { value: "unsure", label: "Пока не определился" },
  { value: "restaurant", label: "Ресторан / кафе" },
  { value: "canteen", label: "Столовая" },
  { value: "bakery", label: "Пекарня" },
  { value: "coffee", label: "Кофейня" },
  { value: "hotel", label: "Гостиница" },
  { value: "sanatorium", label: "Санаторий" },
  { value: "production", label: "Пищевое производство" },
  { value: "other", label: "Другое" },
];

export const stageFormCopy: Record<StageId, { title: string; submit: string; leadType: string }> = {
  idea: {
    title: "Прикинуть бюджет оборудования",
    submit: "Получить ориентир по бюджету",
    leadType: "budget_orientation",
  },
  space: {
    title: "Обсудить проект помещения",
    submit: "Пригласить специалиста",
    leadType: "site_visit",
  },
  project: {
    title: "Разобрать спецификацию и подобрать оборудование",
    submit: "Отправить запрос на подбор",
    leadType: "equipment_selection",
  },
};

export function isValidLeadFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return Boolean(extension && ["pdf", "xls", "xlsx", "doc", "docx", "jpg", "jpeg", "png"].includes(extension));
}

export function isValidBelarusPhone(value: string) {
  return normalizeBelarusPhone(value) !== null;
}

export function normalizeBelarusPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 9) return `+375${digits}`;
  if (digits.length === 11 && digits.startsWith("80")) return `+375${digits.slice(2)}`;
  if (digits.length === 12 && digits.startsWith("375")) return `+${digits}`;
  return null;
}

export async function submitLead(draft: LeadDraft): Promise<LeadSubmitSuccess> {
  const body = new FormData();
  body.set("idempotencyKey", draft.idempotencyKey);
  body.set("stage", draft.stage);
  body.set("phone", draft.phone);
  body.set("contactMethod", draft.contactMethod);
  body.set("venueType", draft.venueType);
  body.set("name", draft.name);
  body.set("website", draft.website || "");
  body.set("attribution", JSON.stringify(draft.attribution));
  if (draft.file) body.set("file", draft.file);

  let response: Response;
  try {
    response = await fetch("/api/leads", { method: "POST", body });
  } catch {
    throw new LeadDeliveryError("crm_unavailable", "Нет соединения с сервером. Проверьте интернет и попробуйте ещё раз.");
  }
  const result = await response.json().catch(() => null) as LeadSubmitResult | null;
  if (!response.ok || !result || !result.ok) {
    throw new LeadDeliveryError(
      result && !result.ok ? result.code : "crm_unavailable",
      result && !result.ok ? result.message : "Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.",
    );
  }
  return result;
}
