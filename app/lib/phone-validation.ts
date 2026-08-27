import parsePhoneNumber from "libphonenumber-js/max";
import { phoneCandidate } from "./phone";

export function normalizeInternationalPhone(value: string) {
  const candidate = phoneCandidate(value);
  if (!candidate) return null;
  const parsed = parsePhoneNumber(candidate);
  return parsed?.isValid() ? parsed.number : null;
}

export function isValidInternationalPhone(value: string) {
  return normalizeInternationalPhone(value) !== null;
}
