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
const VIBER_CHAT_URL = "viber://chat?number=%2B375445002929";

type SavedContactDraft = {
  phone?: string;
  name?: string;
  venueType?: VenueType;
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
  const contactDraft = useMemo(() => readContactDraft(serializedDraft), [serializedDraft]);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [viberStatus, setViberStatus] = useState("");
  const messengerMessage = buildMessengerMessage(stage, contactDraft);
  const telegramHref = `https://t.me/EnteroMinsk?text=${encodeURIComponent(messengerMessage)}`;

  const handleFile = (file: File | null) => {
    setFileName("");
    setFileError("");
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

        <label className="thanks-file" data-has-file={Boolean(fileName) || undefined}>
          <input type="file" accept={LEAD_FILE_ACCEPT} onChange={(event) => handleFile(event.target.files?.[0] ?? null)} />
          <Paperclip size={21} weight="light" aria-hidden="true" />
          <span>{fileName || "Прикрепить документ дополнительно"}</span>
        </label>
        {fileError && <p className="lead-error">{fileError}</p>}

        <a className="thanks-return" href={`/?stage=${stage}`}>
          <ArrowLeft size={19} weight="light" aria-hidden="true" />
          Вернуться на сайт
        </a>
        <p className="lead-demo-note">Демо-режим — заявка и новый файл пока не отправляются.</p>
      </div>
    </section>
  );
}
