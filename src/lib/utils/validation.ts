import { z } from "zod";
import { fields, steps } from "./stateMachine";
import { formSchema } from "../schema";
import {
  validateCompany,
  validateEmail,
  validateLocation,
  validateName,
  validatePhone,
} from "../foxentry";
import { t } from "../i18n/i18n.svelte";

// Track fields the user actually saw (populate this in your renderer per step)
type FxChecker = (data: any) => Promise<string | undefined>;

// Map only the fields Foxentry can validate
const fxValidators: Record<string, FxChecker> = {
  firstName: async (d) => {
    if (!d.firstName) return;
    const r = await validateName(d.firstName, "name");
    if (!("isValid" in r)) return undefined; // It's an error object
    return r.isValid ? undefined : t("errors.fox.firstName");
  },
  lastName: async (d) => {
    if (!d.lastName) return;
    const r = await validateName(d.lastName, "surname");
    if (!("isValid" in r)) return undefined;
    return r.isValid ? undefined : t("errors.fox.lastName");
  },
  email: async (d) => {
    if (!d.email) return;
    const r = await validateEmail(d.email);
    return r.isValid ? undefined : t("errors.fox.email");
  },
  phone: async (d) => {
    if (!d.phone) return;
    const r = await validatePhone(d.phone);
    return r.isValid ? undefined : t("errors.fox.phone");
  },
  companyId: async (d) => {
    if (d.applyAsCompany !== true) return; // not visible/required in this branch
    if (!d.companyId) return;
    const r = await validateCompany({
      name: d.companyName, // optional if you have it
      country: "CZ",
      registrationNumber: d.companyId, // IČO as string
    });
    return r.isValid ? undefined : t("errors.fox.company");
  },
  // You can add address-related checks if you have a single-line API:
  // address: async (d) => { ... }
};
type FieldErrors = Record<string, string[]>;
type FxGroupChecker = (data: any, visible: string[]) => Promise<FieldErrors>;

const FOX_TO_LOCAL: Record<string, string[]> = {
  street: ["street"],
  "number.full": ["houseNumber"],
  streetWithNumber: ["street", "houseNumber"],
  city: ["city"],
  zip: ["zip"],
  country: ["country"],
};

const collectInvalidFoxKeys = (raw: any): string[] => {
  const set = new Set<string>();
  const inv = raw?.dataTypes?.invalid;
  if (Array.isArray(inv)) inv.forEach((k: string) => set.add(k));
  const errs = raw?.errors;
  if (Array.isArray(errs)) {
    for (const e of errs)
      (e?.relatedTo ?? []).forEach((k: string) => set.add(k));
  }
  return [...set];
};
type FoxErrorTypes = "INVALID" | "EMPTY";
const collectFoxErrors = (raw: any) => {
  const set = new Set();
};

const addressGroupValidator = async (d: any, visible: string[]) => {
  const out: Record<string, string[]> = {};
  const needs =
    visible.includes("street") &&
    visible.includes("houseNumber") &&
    !d.applyAsCompany;
  if (!needs) return out;

  if (d.__addressFromSuggestion) return out;
  // Change here where we remove all validators except zip and city
  // street: d.street,
  //  houseNumber: d.houseNumber,
  const r = await validateLocation({
    city: d.city,
    postalCode: d.zip,
    countryCode: d.country || "CZ",
  });

  if (!r.isValid) {
    const foxKeys = collectInvalidFoxKeys(r.raw);

    const generic = t("errors.fox.address");
    if (foxKeys.length === 0) {
      out.houseNumber = [generic];
    } else {
      for (const k of foxKeys) {
        const locals = FOX_TO_LOCAL[k] || [];
        for (const f of locals)
          (out[f] ??= []).push(t(`errors.fox.${f}`) ?? generic);
      }
    }
  } else if (r.location) {
    // normalize if you want
    d.street = r.location.street ?? d.street;
    d.houseNumber = r.location.streetNumber ?? d.houseNumber;
    d.city = r.location.city ?? d.city;
    d.zip = r.location.postalCode ?? d.zip;
    d.__addressFromSuggestion = true;
  }
  return out;
};

// register any group validators here
const fxGroupValidators: FxGroupChecker[] = [addressGroupValidator];

const everVisible = new Set<string>();
const root = formSchema;
export function getVisibleIds(
  stepId: "step1" | "step2" | "step3" | "step4" | "phase2",
  data: any
): string[] {
  return steps[stepId].filter((id) => {
    return fields[id].visibleWhen(data);
  });
}
export function getRequiredIds(visibleIds: string[], data: any): string[] {
  return visibleIds.filter((id) => fields[id].requiredWhen(data));
}

function makeStepSchema(visibleIds: string[], requiredIds: string[]) {
  const requiredPart = root.pick(
    Object.fromEntries(requiredIds.map((k) => [k, true]))
  );
  const optionalPart = root
    .pick(
      Object.fromEntries(
        visibleIds.filter((k) => !requiredIds.includes(k)).map((k) => [k, true])
      )
    )
    .partial();
  return z.object({}).merge(requiredPart).merge(optionalPart);
}

function pick<T extends object>(obj: T, keys: string[]) {
  const out: any = {};
  for (const k of keys) if (k in obj) out[k] = (obj as any)[k];
  return out;
}

const hasNoKeys = (o?: Record<string, unknown> | null) =>
  !o || Object.keys(o).length === 0;

/**
 * Validate one step (Zod first, then Foxentry for the visible fields it knows).
 * Returns a merged FieldErrors map. `ok` is true only if the merged map is empty.
 */
export async function validateStepAsync(
  stepId: "step1" | "step2" | "step3" | "step4" | "phase2",
  data: any,
  includeFoxentry: boolean
) {
  const visible = getVisibleIds(stepId, data);
  visible.forEach((id) => everVisible.add(id));
  const required = getRequiredIds(visible, data);

  const stepSchema = makeStepSchema(visible, required);
  const payload = pick(data, visible);

  // 1) Zod
  const zres = await stepSchema.safeParseAsync(payload);
  let mergedErrors: FieldErrors = zres.success
    ? {}
    : (zres.error.flatten().fieldErrors as FieldErrors);

  if (includeFoxentry) {
    // 2) Field-level Foxentry (only for visible keys that have a validator)
    const toCheck = visible.filter((k) => k in fxValidators);
    const fieldMsgs = await Promise.all(
      toCheck.map(async (k) => ({ k, msg: await fxValidators[k](data) }))
    );
    for (const { k, msg } of fieldMsgs) {
      if (msg) mergedErrors[k] = (mergedErrors[k] ?? []).concat(msg);
    }

    // 3) Group-level Foxentry (address)
    for (const run of fxGroupValidators) {
      const g = await run(data, visible);
      for (const [k, list] of Object.entries(g)) {
        if (list?.length)
          mergedErrors[k] = (mergedErrors[k] ?? []).concat(list);
      }
    }
  }

  const ok = Object.keys(mergedErrors).length === 0;
  return { ok, fieldErrors: mergedErrors };
}

/** Final pass across everything the user actually saw */
export async function validateFinalAsync(data: any) {
  const visible = Array.from(everVisible);
  const required = visible.filter((id) => fields[id].requiredWhen(data));
  const finalSchema = makeStepSchema(visible, required);
  const payload = pick(data, visible);
  const zres = await finalSchema.safeParseAsync(payload);

  let merged: FieldErrors = zres.success
    ? {}
    : (zres.error.flatten().fieldErrors as FieldErrors);

  const toCheck = visible.filter((k) => k in fxValidators);
  const out = await Promise.all(
    toCheck.map(async (k) => ({ k, msg: await fxValidators[k](data) }))
  );
  for (const { k, msg } of out) {
    if (msg) merged[k] = (merged[k] ?? []).concat(msg);
    else if (merged[k]?.length === 0) delete merged[k];
  }

  return { ok: hasNoKeys(merged), fieldErrors: merged };
}

const EU = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
]);
const isEu = (a2?: string) => !!a2 && EU.has(a2);
