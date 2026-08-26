"use client";

import { ArrowLeft, CheckCircle, Paperclip } from "@phosphor-icons/react";
import { useState } from "react";
import type { StageId } from "../entero-content";
import { isValidLeadFile, LEAD_FILE_ACCEPT, MAX_LEAD_FILE_SIZE } from "../lead-preview";

const messages: Record<StageId, string> = {
  idea: "Следующий шаг — уточнить формат и ориентир бюджета.",
  space: "Следующий шаг — обсудить помещение и задачу проекта.",
  project: "Следующий шаг — разобрать спецификацию и варианты оборудования.",
};

export function ThankYouClient({ stage }: { stage: StageId }) {
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");

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

  return (
    <section className="thanks-section" aria-labelledby="thanks-title">
      <div className="thanks-grid" aria-hidden="true" />
      <div className="thanks-inner">
        <CheckCircle size={44} weight="light" aria-hidden="true" />
        <p className="thanks-kicker">ENTERO · запрос подготовлен</p>
        <h1 id="thanks-title">Спасибо. Мы получили ваши вводные.</h1>
        <p className="thanks-message">{messages[stage]}</p>

        <div className="thanks-messengers" aria-label="Связаться с ENTERO">
          <a href="https://t.me/EnteroMinsk" target="_blank" rel="noreferrer">Telegram</a>
          <a href="viber://chat?number=%2B375445002929">Viber</a>
        </div>

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
