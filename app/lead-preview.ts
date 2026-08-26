import type { StageId } from "./entero-content";

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
  stage: StageId;
  phone: string;
  contactMethod: ContactMethod;
  venueType: VenueType;
  name: string;
  file?: File | null;
};

export type LeadPreviewResult = {
  ok: true;
  requestId: string;
};

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
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 12;
}

/**
 * Preview adapter. The UI already uses the final provider-agnostic boundary,
 * while CRM delivery is deliberately disabled until Bitrix24 is configured.
 */
export async function submitLead(draft: LeadDraft): Promise<LeadPreviewResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 520));
  const requestId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `preview-${Date.now()}`;

  console.info("[ENTERO preview lead]", {
    requestId,
    leadType: stageFormCopy[draft.stage].leadType,
    stage: draft.stage,
    contact: {
      phone: draft.phone,
      method: draft.contactMethod,
      name: draft.name || undefined,
    },
    answers: { venueType: draft.venueType },
    file: draft.file ? { name: draft.file.name, size: draft.file.size, type: draft.file.type } : undefined,
    experiment: { concept: "A", theme: "premium-gold", heroVariant: "A1" },
    preview: true,
  });

  return { ok: true, requestId };
}
