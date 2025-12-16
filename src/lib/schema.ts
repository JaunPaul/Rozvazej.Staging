import { z } from "zod";
import { t } from "./i18n/i18n.svelte";
function isValidCzechBirthNumber(raw: string): boolean {
  if (!raw) return false;
  const digits = raw.replace(/[^\d]/g, ""); // strip slash, spaces, dashes

  // 9 digits (<= 1953) or 10 digits (>= 1954)
  if (!/^\d{9}$|^\d{10}$/.test(digits)) return false;

  const yy = Number(digits.slice(0, 2));
  let mm = Number(digits.slice(2, 4));
  const dd = Number(digits.slice(4, 6));

  // Month adjustments:
  //  +50 → female (all years)
  //  +20 → extension since 2004 (both genders)
  //  +70 → 50+20 for females since 2004
  if (mm > 70) mm -= 70; // female + extension
  else if (mm > 50) mm -= 50; // female
  else if (mm > 20) mm -= 20; // extension

  if (mm < 1 || mm > 12) return false;

  // Infer full year (heuristic commonly used in CZ):
  // - 9-digit RČ ⇒ 1900–1953
  // - 10-digit RČ ⇒ 1954–1999 when yy >= 54, else 2000–2053
  let year: number;
  if (digits.length === 9) {
    year = 1900 + yy;
  } else {
    year = yy >= 54 ? 1900 + yy : 2000 + yy;
  }

  // Validate calendar date
  const d = new Date(year, mm - 1, dd);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== mm - 1 ||
    d.getDate() !== dd
  ) {
    return false;
  }

  // Mod 11 check (only for 10-digit RČ)
  if (digits.length === 10) {
    // For births before 1985, remainder 10 used to be allowed (encoded as 0),
    // after 1985 remainder must be 0.
    const n = Number(digits);
    const rem = n % 11;
    if (year >= 1985) return rem === 0;
    return rem === 0 || rem === 10;
  }

  return true; // 9-digit legacy numbers have no mod-11 requirement
}

/** Optional: return normalized with a slash if valid (YYMMDD/XXXX or YYMMDD/XXX) */
export function normalizeCzechBirthNumber(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (!isValidCzechBirthNumber(raw)) return null;
  const left = digits.slice(0, 6);
  const right = digits.slice(6);
  return `${left}/${right}`;
}
// helper for file arrays
const fileArray = (min: number) =>
  z
    .array(z.instanceof(File), { error: t("errors.files") })
    .min(min, { message: `${t("errors.files")}${min}` });

export const formSchema = z.object({
  // step1
  firstName: z
    .string({ error: t("errors.firstName") })
    .min(1, { error: t("errors.firstName") }),
  lastName: z.string().min(1, { error: t("errors.lastName") }),
  phone: z.string().min(1, { error: t("errors.phone") }),
  email: z.email({ error: t("errors.email") }),
  applyAsCompany: z.boolean({ error: t("errors.applyAsCompany") }),

  // step2
  companyId: z.string().min(1, { error: t("errors.companyId") }),
  country: z.string().min(1, { error: t("errors.country") }),
  nationalId: z
    .string()
    .trim()
    .refine(isValidCzechBirthNumber, { message: t("errors.nationalId") })
    .transform((s) => normalizeCzechBirthNumber(s)!),
  passportOrId: z.string().min(1, { error: t("errors.passportOrId") }),
  street: z.string().min(1, { error: t("errors.street") }),
  houseNumber: z.string().min(1, { error: t("errors.houseNumber") }),
  city: z.string().min(1, { error: t("errors.city") }),
  zip: z.string().min(1, { error: t("errors.zip") }),
  bankPrefix: z.string().max(6, { error: t("errors.bank.prefix") }),
  bankNumber: z
    .string()
    .min(1, { error: t("errors.bank.number") })
    .max(10, { error: t("errors.bank.number") }),
  bankCode: z.string().min(1, { error: t("errors.bank.code") }),

  filesNationalId: fileArray(2),
  filesEuPassport: fileArray(2),
  filesNonEu: fileArray(2),
  filesDriversLicense: fileArray(1),

  // step3
  deliveryCity: z.string().min(1, { error: t("errors.deliveryCity") }),
  transport: z.string().min(1, { error: t("errors.transport") }),
  gender: z.string().min(1, { error: t("errors.gender") }),
  birthDate: z
    .string()
    .min(1, { error: t("errors.birthDate") })
    .refine(
      (value) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return false;

        const today = new Date();
        const cutoff = new Date(
          today.getFullYear() - 15,
          today.getMonth(),
          today.getDate()
        );
        return date <= cutoff;
      },
      {
        message: t("errors.birthDateTooYoung"),
      }
    ),
  documentExpiryDate: z
    .string()
    .min(1, { error: t("errors.documentExpiryDate") }),
  permanentResidenceStreet: z.string().min(1, { error: t("errors.street") }),
  permanentResidenceStreetNumber: z
    .string()
    .min(1, { error: t("errors.houseNumber") }),
  permanentResidenceCity: z.string().min(1, { error: t("errors.city") }),
  permanentResidenceCountry: z.string().min(1, { error: t("errors.country") }),
  placeOfBirth: z.string().min(1, { error: t("errors.placeOfBirth") }),
  insurance: z.string().min(1, { error: t("errors.insurance") }),
  pinkStatement: z.coerce.boolean({ error: t("errors.pinkStatement") }),
  documentNumber: z.string().min(1, { error: t("errors.documentNumber") }),
  documentIssuingCountry: z.string().min(1, { error: t("errors.country") }),
});

export const verifyResponseSchema = z.object({
  courierId: z.string(),
  contractSigned: z.boolean(),
});

export type VerifyResponse = z.infer<typeof verifyResponseSchema>;
export type FormSchema = z.infer<typeof formSchema>;
