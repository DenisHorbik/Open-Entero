const MAX_E164_DIGITS = 15;

export function sanitizePhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, MAX_E164_DIGITS);
  return digits ? `+${digits}` : "";
}

export function phoneCandidate(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 9) return `+375${digits}`;
  if (digits.length === 11 && digits.startsWith("80")) return `+375${digits.slice(2)}`;
  return `+${digits}`;
}
