// src/lib/foxentry.ts
import { ApiClient, Response } from "@foxentry/js-sdk";

// --- Configure once ---
const FOXENTRY_API_KEY = "wEVXJ4ptO1reyQYfs1MQ"; // <-- replace in env for prod
const fox = new ApiClient();
fox.setAuth(FOXENTRY_API_KEY);

// Optional defaults applied to all requests (tweak as needed)
const DEFAULTS = {
  clientIP: "127.0.0.1",
  clientCountry: "CZ", // set to user's country code dynamically if you have it
  includeRequestDetails: false,
};

// --- Types you’ll actually use in forms ---
export type FxValidity = {
  isValid: boolean;
  // Canonical/normalized value if Foxentry corrected it
  normalized?: string;
  // Human-readable correction suggestion (if any)
  suggestion?: string;
  // Raw Foxentry result if you need details
  raw?: unknown;
};

export type FxError = {
  status: 402;
  errors: [
    {
      group: string;
      type: string;
      subtype: string;
      severity: string;
      relatedTo: string[];
      description: string;
    }
  ];
};

export type FxLocation = {
  full?: string;
  street?: string;
  streetNumber?: string; // from number.full
  streetWithNumber?: string; // from streetWithNumber
  city?: string;
  postalCode?: string; // from zip
  region?: string; // region
  district?: string; // district
  state?: string | null; // state (often null in CZ)
  countryCode?: string; // "CZ"
  latitude?: number;
  longitude?: number;
  ids?: {
    internal?: string;
    external?: string;
  };
  raw?: unknown;
};

export type FxCompany = {
  name?: string;
  registrationId?: string; // IČO / national ID
  raw?: unknown;
};

// --- Small utility: unwrap SDK Response safely ---
function unwrap<T = any>(res: Response): T {
  // .getResult() returns the typed result for the specific validator/search
  return res.getResult() as T;
}

// --- EMAIL ---
export async function validateEmail(
  email: string,
  opts?: { acceptDisposableEmails?: boolean }
): Promise<FxValidity> {
  const options = {
    acceptDisposableEmails: opts?.acceptDisposableEmails ?? false,
  };
  const res = await fox
    .email()
    .setCustomId("email-check")
    .setClientCountry(DEFAULTS.clientCountry)
    .includeRequestDetails(DEFAULTS.includeRequestDetails)
    .setOptions(options)
    .validate({ email });

  const result: any = unwrap(res); // API 2.0: includes isValid, correction, normalized, reasons, etc.
  return {
    isValid: !!result?.isValid,
    normalized: result?.normalized?.email,
    suggestion: result?.correction?.email, // suggested fix (e.g., gmial.com -> gmail.com)
    raw: result,
  };
}

// --- PHONE ---
export async function validatePhone(
  phone: string,
  opts?: {
    validationType: "basic";
    preferredPrefixes: ["+420"];
    formatNumber: false;
    correctionMode: "full";
    allowedPrefixes: ["+420"];
  }
): Promise<FxValidity> {
  const res = await fox
    .phone()
    .setCustomId("phone-check")
    .includeRequestDetails(DEFAULTS.includeRequestDetails)
    .setOptions({
      validationType: opts?.validationType ?? "basic",
      preferredPrefixes: opts?.preferredPrefixes ?? ["+420"],
      formatNumber: opts?.formatNumber ?? false,
      correctionMode: opts?.correctionMode ?? "full",
      allowedPrefixes: opts?.allowedPrefixes ?? ["+420"],
    })
    .validate({ numberWithPrefix: phone });

  const result: any = unwrap(res);
  return {
    isValid: !!result?.isValid,
    normalized: result?.normalized?.phone, // canonical E.164 by default
    suggestion: result?.correction?.phone,
    raw: result,
  };
}

// --- NAME ---
type ValidateNameOptions = {
  dataScope?: "basic";
  acceptDegrees?: boolean;
  acceptContext?: boolean;
  validationDepth?: "minimal" | "deep";
  smartMode?: boolean;
};

export async function validateName(
  value: string,
  type: "name" | "surname",
  opts: ValidateNameOptions = {
    dataScope: "basic",
    acceptDegrees: false,
    acceptContext: false,
    validationDepth: "minimal",
    smartMode: true,
  }
): Promise<FxValidity | FxError> {
  const res = await fox
    .name()
    .setCustomId("name-check")
    .setOptions(opts)
    .includeRequestDetails(DEFAULTS.includeRequestDetails)
    .validate({ [type]: value });

  if (res.getStatus() === 402) {
    return { status: 402, ...res.getErrors() } as FxError;
  }

  const result: any = unwrap(res);
  return {
    isValid: !!result?.isValid,
    normalized: result?.normalized?.name,
    suggestion: result?.correction?.name,
    raw: result,
  };
}

// --- COMPANY ---
// Validate a specific company string (name, reg id, etc.)
export async function validateCompany(query: {
  name?: string;
  country?: string;
  registrationNumber?: string;
}): Promise<FxCompany & FxValidity> {
  const res = await fox
    .company()
    .setCustomId("company-validate")
    .setClientIP(DEFAULTS.clientIP)
    .setClientCountry(DEFAULTS.clientCountry)
    .includeRequestDetails(DEFAULTS.includeRequestDetails)
    .validate(query);

  const result: any = unwrap(res);
  return {
    isValid: !!result?.isValid,
    name: result?.normalized?.name ?? result?.name,
    registrationId:
      result?.normalized?.registrationId ?? result?.registrationId,
    suggestion: result?.correction?.name,
    raw: result,
  };
}

// Search companies (autocomplete list)
export async function searchCompanies(
  term: string,
  limit = 10
): Promise<FxCompany[]> {
  if (term.length === 0) return [];
  const res = await fox
    .company()
    .setCustomId("company-search")
    .setClientCountry(DEFAULTS.clientCountry)
    .setOptions({
      dataScope: "basic",
      dataSource: ["CZ"],
      includeTerminatedSubjects: false,
      zipFormat: false,
      cityFormat: "basic",
      countryFormat: "alpha2",
      legalFormType: "any",
      filterMode: "limit",
      resultsLimit: limit,
      filterAcceptFormat: true,
      filterAcceptAlternatives: true,
      filterExactMatch: true,
    })
    .includeRequestDetails(false)
    .search({
      type: "registrationNumber",
      filter: { country: "CZ" },
      value: term,
    });

  const items: any[] = unwrap(res) ?? [];
  return items.map((it) => ({
    name: it?.data?.name,
    registrationId: it?.data?.registrationNumber,
  }));
}

// --- LOCATION / ADDRESS ---
// Validate a (partial or full) address. You can pass whatever you have; API will infer/correct.
type ValidateLocationInput = Partial<{
  full: string;
  street: string;
  houseNumber: string; // e.g. "132/4"
  city: string;
  postalCode: string;
  region: string;
  countryCode: string; // ISO-3166-1 alpha-2 (e.g., "CZ")
}>;

export async function validateLocation(q: ValidateLocationInput): Promise<{
  isValid: boolean;
  location?: FxLocation;
  suggestion?: FxLocation;
  raw?: unknown;
}> {
  const street = q.street?.trim();
  const house = q.houseNumber?.trim();
  const city = q.city?.trim();
  const zip = q.postalCode ? q.postalCode.replace(/\s/g, "") : undefined;
  const country = DEFAULTS.clientCountry;

  // Build the correct payload
  const payload: any = {
    street: street ?? undefined,
    streetWithNumber: street && house ? `${street} ${house}` : undefined,
    "number.full": house ?? undefined,
    city: city ?? undefined,
    zip: zip ?? undefined,
    region: q.region ?? undefined,
    country,
  };

  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined)
  );

  const strictOnlyZipCountry = {
    zip: zip ?? undefined,
    country,
  };

  const res = await fox
    .location()
    .setCustomId("location-validate")
    .setClientCountry(country)
    .includeRequestDetails(false)
    .validate(strictOnlyZipCountry);

  const result: any = unwrap(res);
  return {
    isValid: !!result?.isValid,
    location: mapLocation(result?.normalized ?? result),
    suggestion: mapLocation(result?.correction),
    raw: result,
  };
}
function parseFoxentryLocationData(
  src: any | undefined
): FxLocation | undefined {
  if (!src) return undefined;
  const num = src.number ?? {};
  return {
    full: src.full ?? undefined,
    street: src.street ?? undefined,
    streetNumber: num.full ?? undefined, // "3108/1"
    streetWithNumber: src.streetWithNumber ?? undefined,
    city: src.city ?? undefined,
    postalCode: src.zip ?? undefined,
    region: src.region ?? undefined,
    district: src.district ?? undefined,
    state: src.state ?? null,
    countryCode: src.country ?? undefined,
    // geo isn't in your sample; keep hooks if Foxentry adds it
    latitude: src.latitude ?? src.lat ?? undefined,
    longitude: src.longitude ?? src.lon ?? undefined,
    ids: {
      internal: src.ids?.internal,
      external: src.ids?.external,
    },
    raw: src,
  };
}
export type LocationSearchType =
  | "street"
  | "number.full"
  | "city"
  | "zip"
  | "full";
// Search locations (autocomplete for address fields)
// api/locations.ts
export async function searchLocations(
  type: LocationSearchType,
  value: string,
  countryCode?: string,
  limit = 10,
  offset = 0,
  extraFilter: Record<string, any> = {},
  opts: { allowEmpty?: boolean } = {}
): Promise<{ items: FxLocation[]; total: number; offset: number }> {
  const q = value?.trim() ?? "";
  const allowEmpty = !!opts.allowEmpty;

  // ✅ allow empty query when the caller explicitly asks for it
  if (!q && !allowEmpty) return { items: [], total: 0, offset: 0 };

  const res = await fox
    .location()
    .setCustomId(`location-search-${type}`)
    .setClientCountry(countryCode ?? DEFAULTS.clientCountry)
    .includeRequestDetails(false)
    .setOptions({
      resultsLimit: limit,
      resultsOffset: offset,
      dataScope: "full",
    })
    .search({
      type,
      value: q, // may be ""
      filter: { country: countryCode, ...extraFilter },
    });

  const payload: any = res;
  const response = payload?.data?.response;
  const results = Array.isArray(response?.results) ? response.results : [];
  const items = results
    .map((r: any) => parseFoxentryLocationData(r?.data))
    .filter(Boolean) as FxLocation[];

  return {
    items,
    total: Number(response?.resultsTotal ?? items.length),
    offset: Number(response?.resultsOffset ?? 0),
  };
}

// --- Helpers ---
function mapLocation(src: any | undefined): FxLocation | undefined {
  if (!src) return undefined;
  return {
    full: src.full,
    street: src.street,
    streetNumber: src.streetNumber,
    city: src.city,
    postalCode: src.postalCode,
    region: src.region,
    countryCode: src.countryCode,
    latitude: src.latitude ?? src.lat,
    longitude: src.longitude ?? src.lon,
    raw: src,
  };
}

// --- Minimal debounce you can use in components for search boxes ---
export function debounce<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ms = 250
) {
  let t: any;
  return (...args: Parameters<T>) =>
    new Promise<ReturnType<T>>((resolve, reject) => {
      clearTimeout(t);
      t = setTimeout(() => {
        fn(...args)
          .then(resolve)
          .catch(reject);
      }, ms);
    });
}
