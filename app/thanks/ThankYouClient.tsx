"use client";

import { ArrowLeft, CheckCircle, Paperclip } from "@phosphor-icons/react";
import { useMemo, useState, useSyncExternalStore } from "react";
import type { StageId } from "../entero-content";
import {
  isValidLeadFile,
  LEAD_FILE_ACCEPT,
  MAX_LEAD_FILE_SIZE,
  stageFormCopy,
  venueTypes,
  type VenueType,
} from "../lead-preview";

const DRAFT_STORAGE_KEY = "entero-contact-draft";
const THANKS_STORAGE_KEY = "entero-thanks-context";
const VIBER_CHAT_URL = "viber://chat?number=%2B375445002929";

type SavedContactDraft = {
  phone?: string;
  name?: string;
  venueType?: VenueType;
};

type ThanksContext = {
  requestId?: string;
  uploadToken?: string;
  fileWarning?: string;
  stage?: StageId;
};

function readContactDraft(serializedDraft: string | null): SavedContactDraft | null {
  try {
    return JSON.parse(serializedDraft ?? "null") as SavedContactDraft | null;
  } catch {
    return null;
  }
}

function subscribeToContactDraft() {
  return () => undefined;
}

function getContactDraftSnapshot() {
  return sessionStorage.getItem(DRAFT_STORAGE_KEY);
}

function getServerContactDraftSnapshot() {
  return null;
}

function getThanksContextSnapshot() {
  return sessionStorage.getItem(THANKS_STORAGE_KEY);
}

function readThanksContext(serialized: string | null): ThanksContext | null {
  try {
    return JSON.parse(serialized ?? "null") as ThanksContext | null;
  } catch {
    return null;
  }
}

function buildMessengerMessage(stage: StageId, draft: SavedContactDraft | null) {
  const venue = venueTypes.find((item) => item.value === draft?.venueType)?.label ?? "не указан";
  return [
    "Здравствуйте! Хочу получить расчет комплексного оснащения.",
    `Имя: ${draft?.name?.trim() || "не указано"}`,
    `Телефон: ${draft?.phone?.trim() || "не указан"}`,
    `Объект: ${venue}`,
    `Форма: ${stageFormCopy[stage].title}`,
  ].join("\n");
}

function copyWithFallback(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "0 auto auto -9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

export function ThankYouClient({ stage }: { stage: StageId }) {
  const serializedDraft = useSyncExternalStore(
    subscribeToContactDraft,
    getContactDraftSnapshot,
    getServerContactDraftSnapshot,
  );
  const serializedThanksContext = useSyncExternalStore(
    subscribeToContactDraft,
    getThanksContextSnapshot,
    getServerContactDraftSnapshot,
  );
  const contactDraft = useMemo(() => readContactDraft(serializedDraft), [serializedDraft]);
  const thanksContext = useMemo(() => readThanksContext(serializedThanksContext), [serializedThanksContext]);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [fileStatus, setFileStatus] = useState("");
  const [fileUploading, setFileUploading] = useState(false);
  const [viberStatus, setViberStatus] = useState("");
  const messengerMessage = buildMessengerMessage(stage, contactDraft);
  const telegramHref = `https://t.me/EnteroMinsk?text=${encodeURIComponent(messengerMessage)}`;

  const handleFile = async (file: File | null) => {
    setFileName("");
    setFileError("");
    setFileStatus("");
    if (!file) return;
    if (!isValidLeadFile(file)) {
      setFileError("Подойдут PDF, Excel, Word, JPG или PNG.");
      return;
    }
    if (file.size > MAX_LEAD_FILE_SIZE) {
      setFileError("Размер файла не должен превышать 20 МБ.");
      return;
    }
    setFileName(file.name);
    if (!thanksContext?.uploadToken) {
      setFileError("Ссылка на заявку недоступна. Отправьте документ менеджеру через Telegram или Viber.");
      return;
    }

    setFileUploading(true);
    const body = new FormData();
    body.set("uploadToken", thanksContext.uploadToken);
    body.set("attachmentId", typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `file-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    body.set("file", file);
    try {
      const response = await fetch("/api/leads/attachments", { method: "POST", body });
      const result = await response.json().catch(() => null) as { ok?: boolean; message?: string } | null;
      if (!response.ok || !result?.ok) throw new Error(result?.message || "Файл не загрузился.");
      setFileStatus("Документ добавлен в вашу заявку.");
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Файл не загрузился. Попробуйте ещё раз.");
    } finally {
      setFileUploading(false);
    }
  };

  const handleViber = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(messengerMessage);
        copied = true;
      }
    } catch {
      // The synchronous fallback below covers browsers that block Clipboard API access.
    }
    if (!copied) copied = copyWithFallback(messengerMessage);
    setViberStatus(copied
      ? "Текст обращения скопирован — вставьте его в Viber."
      : "Не удалось скопировать текст автоматически — вставьте данные вручную.");
    window.location.href = VIBER_CHAT_URL;
  };

  return (
    <section className="thanks-section" aria-labelledby="thanks-title">
      <div className="thanks-grid" aria-hidden="true" />
      <div className="thanks-inner">
        <CheckCircle size={44} weight="light" aria-hidden="true" />
        <p className="thanks-kicker">ENTERO · Ваш запрос отправлен</p>
        <h1 id="thanks-title">Спасибо. Мы получили ваши вводные.</h1>
        <p className="thanks-message">
          Свяжемся с Вами в течение 1 рабочего дня. Если срочно —{" "}
          <a className="thanks-phone-link" href="tel:+375445002929">звоните</a>{" "}
          или пишите в удобный для Вас мессенджер:
        </p>

        <div className="thanks-messengers" aria-label="Связаться с ENTERO">
          <a href={telegramHref} target="_blank" rel="noreferrer">Telegram</a>
          <a href={VIBER_CHAT_URL} onClick={handleViber}>Viber</a>
        </div>
        <p className="thanks-copy-status" role="status" aria-live="polite">{viberStatus}</p>

        {thanksContext?.fileWarning && <p className="thanks-file-warning" role="status">{thanksContext.fileWarning}</p>}
        <label className="thanks-file" data-has-file={Boolean(fileName) || undefined} data-uploading={fileUploading || undefined}>
          <input
            type="file"
            accept={LEAD_FILE_ACCEPT}
            disabled={fileUploading}
            onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
          />
          <Paperclip size={21} weight="light" aria-hidden="true" />
          <span>{fileUploading ? "Добавляем документ…" : fileName || "Прикрепить документ дополнительно"}</span>
        </label>
        {fileError && <p className="lead-error">{fileError}</p>}
        {fileStatus && <p className="thanks-file-success" role="status">{fileStatus}</p>}

        <a className="thanks-return" href={`/?stage=${stage}`}>
          <ArrowLeft size={19} weight="light" aria-hidden="true" />
          Вернуться на сайт
        </a>
      </div>
    </section>
  );
}
