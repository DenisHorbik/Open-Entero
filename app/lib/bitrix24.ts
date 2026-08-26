import type { StageId } from "../entero-content";
import { stageFormCopy, venueTypes, type ContactMethod, type VenueType } from "../lead-preview";
import type { LeadAttribution } from "../lead-attribution";

type BitrixResponse<T> = { result?: T; error?: string; error_description?: string };

type CompanyRecord = {
  ID: string;
  TITLE?: string;
  ASSIGNED_BY_ID?: string;
  DATE_MODIFY?: string;
};

export type ValidatedLead = {
  requestId: string;
  stage: StageId;
  phone: string;
  contactMethod: ContactMethod;
  venueType: VenueType;
  name: string;
  attribution: LeadAttribution;
  file: File | null;
};

export type CrmLeadResult = {
  dealId: number;
  companyId: number;
  fileWarning?: string;
};

const SOURCE_NEW = "open.entero.by:new-company";
const SOURCE_EXISTING = "open.entero.by:existing-company";
const ORIGINATOR_ID = "open.entero.by";

export class BitrixError extends Error {
  constructor(message: string, readonly code = "BITRIX_ERROR") {
    super(message);
  }
}

function env(name: string, fallback?: string) {
  const value = process.env[name]?.trim() || fallback;
  if (!value) throw new BitrixError(`Missing server configuration: ${name}`, "CONFIGURATION");
  return value;
}

function webhookBase() {
  const value = env("BITRIX24_WEBHOOK_URL");
  const allowLocalHttp = process.env.BITRIX24_ALLOW_INSECURE_LOCAL === "1"
    && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//i.test(value);
  if (!/^https:\/\//i.test(value) && !allowLocalHttp) {
    throw new BitrixError("Bitrix24 webhook must use HTTPS", "CONFIGURATION");
  }
  return value.endsWith("/") ? value : `${value}/`;
}

async function callBitrix<T>(method: string, params: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(`${webhookBase()}${method}.json`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null) as BitrixResponse<T> | null;
    if (!response.ok || !payload || payload.error || payload.result === undefined) {
      throw new BitrixError(payload?.error_description || payload?.error || `Bitrix24 returned HTTP ${response.status}`);
    }
    return payload.result;
  } catch (error) {
    if (error instanceof BitrixError) throw error;
    if (error instanceof Error && error.name === "AbortError") throw new BitrixError("Bitrix24 request timed out", "TIMEOUT");
    throw new BitrixError("Bitrix24 is unavailable", "NETWORK");
  } finally {
    clearTimeout(timeout);
  }
}

function venueLabel(value: VenueType) {
  const label = venueTypes.find((item) => item.value === value)?.label;
  return value === "unsure" || !label ? "объект HoReCa" : label.toLowerCase();
}

function stageTask(stage: StageId) {
  if (stage === "idea") return "Прикинуть бюджет";
  if (stage === "space") return "Проект помещения / выезд";
  return "Подбор оборудования";
}

function contactMethodLabel(method: ContactMethod) {
  if (method === "telegram") return "Telegram";
  if (method === "viber") return "Viber";
  return "Позвонить";
}

function trimmed(value: string | undefined, max = 500) {
  return value?.trim().slice(0, max) || "";
}

function dealComment(lead: ValidatedLead, companyMatchCount: number) {
  const a = lead.attribution;
  return [
    "Заявка с open.entero.by",
    `Форма: ${stageFormCopy[lead.stage].title}`,
    `Стадия клиента: ${lead.stage}`,
    `Имя: ${lead.name || "не указано"}`,
    `Телефон: ${lead.phone}`,
    `Предпочтительный способ связи: ${contactMethodLabel(lead.contactMethod)}`,
    `Тип объекта: ${venueLabel(lead.venueType)}`,
    `Первая стадия сайта: ${a.initialStage}`,
    `Текущая стадия сайта: ${a.currentStage}`,
    companyMatchCount > 1 ? `Найдено компаний с таким телефоном: ${companyMatchCount}. Выбрана последняя изменённая.` : "",
    `Первая страница: ${trimmed(a.landingUrl, 1500) || "не определена"}`,
    `Referrer: ${trimmed(a.referrer, 1500) || "прямой переход"}`,
    `UTM source: ${trimmed(a.utmSource) || "—"}`,
    `UTM medium: ${trimmed(a.utmMedium) || "—"}`,
    `UTM campaign: ${trimmed(a.utmCampaign) || "—"}`,
    `UTM content: ${trimmed(a.utmContent) || "—"}`,
    `UTM term: ${trimmed(a.utmTerm) || "—"}`,
    `GCLID: ${trimmed(a.gclid) || "—"}`,
    `YCLID: ${trimmed(a.yclid) || "—"}`,
    `YMCLID: ${trimmed(a.ymclid) || "—"}`,
    `Эксперимент: ${a.concept} / ${a.theme} / ${a.heroVariant}`,
    `ID заявки: ${lead.requestId}`,
  ].filter(Boolean).join("\n");
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
}

async function filePayload(file: File) {
  return [file.name.slice(0, 180), toBase64(new Uint8Array(await file.arrayBuffer()))];
}

async function findDealByOrigin(requestId: string) {
  const deals = await callBitrix<Array<{ ID: string; COMPANY_ID?: string }>>("crm.deal.list", {
    order: { ID: "DESC" },
    filter: { ORIGINATOR_ID, ORIGIN_ID: requestId },
    select: ["ID", "COMPANY_ID"],
  });
  return deals[0] || null;
}

async function findCompanyCreatedForRequest(requestId: string) {
  const companies = await callBitrix<CompanyRecord[]>("crm.company.list", {
    order: { ID: "DESC" },
    filter: { ORIGINATOR_ID, ORIGIN_ID: requestId },
    select: ["ID", "TITLE", "ASSIGNED_BY_ID", "DATE_MODIFY"],
  });
  return companies[0] || null;
}

async function findCompaniesByPhone(phone: string) {
  const duplicates = await callBitrix<Record<string, Array<number | string>>>("crm.duplicate.findbycomm", {
    entity_type: "COMPANY",
    type: "PHONE",
    values: [phone],
  });
  const ids = (duplicates.COMPANY || []).map(String).filter(Boolean);
  if (!ids.length) return [];
  return callBitrix<CompanyRecord[]>("crm.company.list", {
    order: { DATE_MODIFY: "DESC", ID: "DESC" },
    filter: { "@ID": ids },
    select: ["ID", "TITLE", "ASSIGNED_BY_ID", "DATE_MODIFY"],
  });
}

async function createCompany(lead: ValidatedLead) {
  const person = lead.name || lead.phone;
  return callBitrix<number>("crm.company.add", {
    fields: {
      TITLE: `${person} — открывает ${venueLabel(lead.venueType)}`,
      COMPANY_TYPE: "CUSTOMER",
      PHONE: [{ VALUE: lead.phone, VALUE_TYPE: "WORK" }],
      COMMENTS: `Создана из заявки open.entero.by (${lead.requestId})`,
      ORIGINATOR_ID,
      ORIGIN_ID: lead.requestId,
    },
    params: { REGISTER_SONET_EVENT: "N" },
  });
}

async function timelineHasMarker(dealId: number, marker: string) {
  const comments = await callBitrix<Array<{ COMMENT?: string }>>("crm.timeline.comment.list", {
    filter: { ENTITY_ID: dealId, ENTITY_TYPE: "deal" },
    select: ["ID", "COMMENT"],
    order: { ID: "DESC" },
  });
  return comments.some((comment) => comment.COMMENT?.includes(marker));
}

async function addTimelineComment(dealId: number, comment: string, marker: string, file?: File | null) {
  if (await timelineHasMarker(dealId, marker)) return;
  const fields: Record<string, unknown> = {
    ENTITY_ID: dealId,
    ENTITY_TYPE: "deal",
    COMMENT: `${comment}\n\n[${marker}]`,
  };
  if (file) fields.FILES = [await filePayload(file)];
  await callBitrix<number>("crm.timeline.comment.add", { fields });
}

export async function createCrmLead(lead: ValidatedLead): Promise<CrmLeadResult> {
  const duplicateDeal = await findDealByOrigin(lead.requestId);
  if (duplicateDeal) {
    const dealId = Number(duplicateDeal.ID);
    let fileWarning: string | undefined;
    try {
      await addTimelineComment(dealId, dealComment(lead, 0), `open-entero-lead:${lead.requestId}`, lead.file);
    } catch {
      fileWarning = lead.file ? "Сделка создана, но файл не загрузился. Прикрепите его ещё раз ниже." : undefined;
    }
    return { dealId, companyId: Number(duplicateDeal.COMPANY_ID || 0), fileWarning };
  }

  const requestCompany = await findCompanyCreatedForRequest(lead.requestId);
  const matches = requestCompany ? [] : await findCompaniesByPhone(lead.phone);
  const existingCompany = requestCompany || matches[0] || null;
  const isNewCompany = Boolean(requestCompany) || !existingCompany;
  const companyId = existingCompany ? Number(existingCompany.ID) : await createCompany(lead);
  const sourceDescription = isNewCompany ? SOURCE_NEW : SOURCE_EXISTING;

  const fields: Record<string, unknown> = {
    TITLE: `open.entero.by — ${stageTask(lead.stage)} — ${lead.name || lead.phone} — ${venueLabel(lead.venueType)}`,
    CATEGORY_ID: Number(env("BITRIX24_DEAL_CATEGORY_ID", "0")),
    STAGE_ID: env("BITRIX24_DEAL_STAGE_ID", "NEW"),
    COMPANY_ID: companyId,
    SOURCE_ID: env("BITRIX24_SOURCE_ID", "WEB"),
    SOURCE_DESCRIPTION: sourceDescription,
    COMMENTS: dealComment(lead, matches.length),
    ORIGINATOR_ID,
    ORIGIN_ID: lead.requestId,
    UTM_SOURCE: trimmed(lead.attribution.utmSource),
    UTM_MEDIUM: trimmed(lead.attribution.utmMedium),
    UTM_CAMPAIGN: trimmed(lead.attribution.utmCampaign),
    UTM_CONTENT: trimmed(lead.attribution.utmContent),
    UTM_TERM: trimmed(lead.attribution.utmTerm),
  };
  if (!isNewCompany && existingCompany?.ASSIGNED_BY_ID) fields.ASSIGNED_BY_ID = Number(existingCompany.ASSIGNED_BY_ID);

  const dealId = await callBitrix<number>("crm.deal.add", {
    fields,
    params: { REGISTER_SONET_EVENT: "Y" },
  });

  let fileWarning: string | undefined;
  try {
    await addTimelineComment(dealId, dealComment(lead, matches.length), `open-entero-lead:${lead.requestId}`, lead.file);
  } catch {
    fileWarning = lead.file ? "Заявка принята, но файл не загрузился. Прикрепите его ещё раз ниже." : undefined;
  }
  return { dealId, companyId, fileWarning };
}

export async function addCrmAttachment(dealId: number, requestId: string, attachmentId: string, file: File) {
  await addTimelineComment(
    dealId,
    `Дополнительный документ к заявке ${requestId}`,
    `open-entero-attachment:${attachmentId}`,
    file,
  );
}
