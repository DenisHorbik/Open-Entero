"use client";

import { ArrowRight, Check, Paperclip, X } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";
import type { StageId } from "./entero-content";
import {
  contactMethods,
  isValidBelarusPhone,
  isValidLeadFile,
  LEAD_FILE_ACCEPT,
  MAX_LEAD_FILE_SIZE,
  stageFormCopy,
  submitLead,
  venueTypes,
  type ContactMethod,
  type VenueType,
} from "./lead-preview";

type ContactFormProps = {
  open: boolean;
  stage: StageId;
  onClose: () => void;
};

const STORAGE_KEY = "entero-contact-draft";

function readSavedDraft() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null") as {
      phone?: string;
      name?: string;
      contactMethod?: ContactMethod;
      venueType?: VenueType;
    } | null;
  } catch {
    return null;
  }
}

export function ContactForm({ open, stage, onClose }: ContactFormProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [savedDraft] = useState(readSavedDraft);
  const [phone, setPhone] = useState(savedDraft?.phone ?? "+375 ");
  const [name, setName] = useState(savedDraft?.name ?? "");
  const [contactMethod, setContactMethod] = useState<ContactMethod>(savedDraft?.contactMethod ?? "phone");
  const [venueType, setVenueType] = useState<VenueType>(savedDraft?.venueType ?? "unsure");
  const [file, setFile] = useState<File | null>(null);
  const [phoneError, setPhoneError] = useState("");
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const copy = stageFormCopy[stage];

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ phone, name, contactMethod, venueType }));
    } catch {
      // Session storage may be unavailable in private browser modes.
    }
  }, [contactMethod, name, phone, venueType]);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  const handleFile = (nextFile: File | null) => {
    setFileError("");
    if (!nextFile) {
      setFile(null);
      return;
    }
    if (!isValidLeadFile(nextFile)) {
      setFile(null);
      setFileError("Подойдут PDF, Excel, Word, JPG или PNG.");
      return;
    }
    if (nextFile.size > MAX_LEAD_FILE_SIZE) {
      setFile(null);
      setFileError("Размер файла не должен превышать 20 МБ.");
      return;
    }
    setFile(nextFile);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPhoneError("");
    if (!isValidBelarusPhone(phone)) {
      setPhoneError("Укажите номер телефона, по которому мы сможем связаться.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitLead({ stage, phone, contactMethod, venueType, name, file });
      sessionStorage.setItem("entero-thanks-context", JSON.stringify({ requestId: result.requestId, stage }));
      window.location.assign(`/thanks?stage=${stage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="lead-dialog" role="presentation" data-swipe-ignore="true">
      <button className="lead-dialog-backdrop" type="button" aria-label="Закрыть форму" onClick={onClose} />
      <div
        ref={panelRef}
        className="lead-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="lead-panel-grid" aria-hidden="true" />
        <header className="lead-panel-header">
          <div>
            <span>ЭТАП {stage === "idea" ? "01" : stage === "space" ? "02" : "03"}</span>
            <h2 id={titleId}>{copy.title}</h2>
          </div>
          <button ref={closeRef} className="lead-close" type="button" onClick={onClose} aria-label="Закрыть форму">
            <X size={23} weight="light" aria-hidden="true" />
          </button>
        </header>

        <form className="lead-form" onSubmit={handleSubmit} noValidate>
          <div className="lead-field">
            <label htmlFor="lead-phone">Телефон <span>обязательное поле</span></label>
            <input
              id="lead-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              aria-invalid={Boolean(phoneError)}
              aria-describedby={phoneError ? "lead-phone-error" : undefined}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+375 44 500-29-29"
            />
            {phoneError && <p className="lead-error" id="lead-phone-error">{phoneError}</p>}
          </div>

          <fieldset className="lead-field lead-contact-method">
            <legend>Как удобнее связаться</legend>
            <div className="lead-options">
              {contactMethods.map((item) => (
                <label key={item.value} data-selected={contactMethod === item.value || undefined}>
                  <input
                    type="radio"
                    name="contact-method"
                    value={item.value}
                    checked={contactMethod === item.value}
                    onChange={() => setContactMethod(item.value)}
                  />
                  <span>{item.label}</span>
                  {contactMethod === item.value && <Check size={16} weight="bold" aria-hidden="true" />}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="lead-fields-row">
            <div className="lead-field">
              <label htmlFor="lead-venue">Тип объекта <span>необязательно</span></label>
              <select id="lead-venue" value={venueType} onChange={(event) => setVenueType(event.target.value as VenueType)}>
                {venueTypes.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div className="lead-field">
              <label htmlFor="lead-name">Как к вам обращаться <span>необязательно</span></label>
              <input id="lead-name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
          </div>

          <div className="lead-field">
            <label className="lead-file" data-has-file={Boolean(file) || undefined}>
              <input type="file" accept={LEAD_FILE_ACCEPT} onChange={(event) => handleFile(event.target.files?.[0] ?? null)} />
              <Paperclip size={22} weight="light" aria-hidden="true" />
              <span>
                <strong>{file ? file.name : "Прикрепить план или спецификацию"}</strong>
                <small>{file ? "Файл добавлен" : "Необязательно · до 20 МБ"}</small>
              </span>
              {file && <Check size={19} weight="bold" aria-hidden="true" />}
            </label>
            {fileError && <p className="lead-error">{fileError}</p>}
          </div>

          <div className="lead-submit-wrap">
            <button className="button lead-submit" type="submit" disabled={submitting}>
              <span>{submitting ? "Готовим запрос…" : copy.submit}</span>
              <ArrowRight size={21} weight="light" aria-hidden="true" />
            </button>
            <p className="lead-demo-note">Демо-режим — заявка пока не отправляется.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
