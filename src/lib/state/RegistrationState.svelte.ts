import { t } from "../i18n/i18n.svelte";
import {
  validateEmail,
  validateName,
  validatePhone,
  searchLocations,
  type FxLocation,
  type FxCompany,
  type LocationSearchType,
  debounce,
} from "../foxentry";
import { validateStepAsync } from "../utils/validation";
import { SubmissionStatus } from "../enums/form";
import type { Company, FormStates, CustomErrors, Bucket } from "../types";
import { PHASE1_ENDPOINT, PHASE2_ENDPOINT } from "../endpoints";
import { steps } from "../utils/stateMachine";

export class RegistrationState {
  // State
  values = $state({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyId: "",
    companyName: "",
    nationalId: "",
    passportOrId: "",
    deliveryCompany: [] as string[],
    deliveryCompanyWolt: false,
    deliveryCompanyFoodora: false,
    deliveryCompanyBolt: false,
    applyAsCompany: undefined as boolean | undefined,
    __addressFromSuggestion: false,
    address: "",
    country: "",
    street: "",
    houseNumber: "",
    city: "",
    zip: "",
    bankPrefix: "",
    bankNumber: "",
    bankCode: "",
    deliveryCity: "",
    transport: "",
    insurance: "",
    pinkStatement: undefined as boolean | undefined,
    gender: "",
    birthDate: "",
    documentExpiryDate: "",
    filesNationalId: [] as File[],
    filesEuPassport: [] as File[],
    filesNonEu: [] as File[],
    filesDriversLicense: [] as File[],
    utm_source: "",
    utm_campaign: "",
    utm_medium: "",
    utm_id: "",
    submitSource: "",
    foxentryPaymentStatus: true,
    step1Completed: false,
    step2Completed: false,
    step3Completed: false,
    sessionId: crypto.randomUUID(),
    formStart: new Date().toUTCString(),
    firstEndpointSubmissionId: undefined as string | undefined,
    firstEndpointSubmissionTime: undefined as string | undefined,
    finalEndpointSubmissionId: undefined as string | undefined,
    finalEndpointSubmissionTime: undefined as string | undefined,
    placeOfBirth: "",
    permanentResidenceCountry: "",
    permanentResidenceStreet: "",
    permanentResidenceStreetNumber: "",
    permanentResidenceCity: "",
    courierId: "",
    documentNumber: "",
    documentIssuingCountry: "",
  });

  errors: CustomErrors = $state({});
  formState: FormStates = $state("neutral");
  submissionStatus: SubmissionStatus = $state(SubmissionStatus.PENDING);

  // Navigation
  currentPhase = $state(1);
  currentStep = $state("step1");

  // UI State
  validating = $state(false);
  submitting = $state(false);
  disable = $state(false);
  verified = $state(false);
  verificationStatus: "pending" | "success" | "fail" | "error" =
    $state("pending");

  // Foxentry State
  addressSuggestions: FxLocation[] = $state([]);
  companySuggestions: FxCompany[] = $state([]);
  activeAddressType: LocationSearchType | null = $state(null);
  companyActive = $state(false);
  addrCtx = $state({
    street: undefined as string | undefined,
    city: undefined as string | undefined,
    zip: undefined as string | undefined,
    streetId: undefined as string | undefined,
  });

  toNextStepIndex = $state(2);

  stepNavText = $derived(`${t("nav.next")} ${this.toNextStepIndex}/4`);
  stepNavTextPaseTwo = $derived(`${t("nav.next")} ${this.toNextStepIndex}/2`);
  askCountryAgain = $state(false);

  constructor() {
    this.init();
  }

  async init() {
    if (typeof window !== "undefined") {
      this.loadFromSession();
      this.loadFromUrl();
      this.values.submitSource = this.getCompanyByDomain()[0];

      // Auto-detect phase based on URL param
      const params = new URLSearchParams(window.location.search);
      if (params.get("phase") === "2") {
        this.currentPhase = 2;
        this.currentStep = "step1"; // Reset step for phase 2
        this.values.courierId = params.get("userId") ?? "";
        const country = params.get("country");

        if (!country) {
          this.askCountryAgain = true;
        } else {
          this.values.country = country;
        }
      }

      // Foxentry Payment Check
      try {
        const foxentryPaymentStatus: any = await validateName("John", "name");
        if (foxentryPaymentStatus?.status === 402) {
          this.values.foxentryPaymentStatus = false;
          // Assuming sendFoxentryFailedPaymentNotification is imported or handled
          console.warn("Foxentry payment failed");
        }
      } catch (e) {
        console.error("Foxentry check failed", e);
      }

      // Drop-off tracking
      window.addEventListener("beforeunload", () => {
        this.trackDropOff(this.currentStep);
      });

      this.trackPageView(this.currentStep);
    }
  }

  trackDropOff(step: string) {
    if (typeof window === "undefined") return;
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: "dropOff",
      stepDroppedOff: `step-${step}`,
    });
  }

  // --- Data Loading & Persistence ---

  loadFromSession() {
    const saved = sessionStorage.getItem("multi-form-session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Restore files is tricky, usually we can't.
        // We'll restore scalar values.
        Object.assign(this.values, parsed);
        // Reset file arrays as they can't be serialized
        this.values.filesNationalId = [];
        this.values.filesEuPassport = [];
        this.values.filesNonEu = [];
        this.values.filesDriversLicense = [];
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
  }

  saveToSession() {
    if (typeof window !== "undefined") {
      // Exclude files from session storage
      const {
        filesNationalId,
        filesEuPassport,
        filesNonEu,
        filesDriversLicense,
        ...rest
      } = this.values;
      sessionStorage.setItem("multi-form-session", JSON.stringify(rest));
    }
  }

  loadFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_id"];
    utmKeys.forEach((key) => {
      const val = params.get(key);
      if (val) (this.values as any)[key] = val;
    });
  }

  // --- Helpers ---

  getCompanyByDomain(hostname?: string): Company[] {
    const domains: Record<string, Company> = {
      "rozvazej.cz": "Wolt",
      "rozvazej-foodora.cz": "Foodora",
      "fofrjidlo.cz": "Foodora",
      "bleskrozvoz.cz": "Bolt",
      localhost: "Development",
    };

    const raw = (
      hostname ??
      (typeof window !== "undefined" ? window.location.hostname : "")
    ).toLowerCase();
    const host = raw.replace(/^www\./, "");

    const exact = domains[host];
    if (exact) return [exact];

    const sub = Object.entries(domains).find(([domain]) =>
      host.endsWith("." + domain)
    )?.[1];

    return sub ? [sub] : [""];
  }

  async hashEmail(email: string): Promise<string> {
    if (!email) return "";
    const msgBuffer = new TextEncoder().encode(email.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  normalizeCzPhone(input: string): string | null {
    const s = (input ?? "").trim();
    if (!s) return null;
    const digits = s.replace(/\D/g, "");
    if (s.startsWith("+")) {
      if (digits.startsWith("420") && digits.length === 12) return `+${digits}`;
      return null;
    }
    if (digits.startsWith("00420") && digits.length === 14)
      return `+420${digits.slice(5)}`;
    if (digits.length === 10 && digits.startsWith("0"))
      return `+420${digits.slice(1)}`;
    if (digits.length === 9) return `+420${digits}`;
    if (digits.startsWith("420") && digits.length === 12) return `+${digits}`;
    return null;
  }

  // --- Validation & Navigation ---

  async validateCurrentStep(
    stepId: "step1" | "step2" | "step3" | "step4" | "phase2"
  ) {
    this.validating = true;
    const { ok, fieldErrors } = await validateStepAsync(
      stepId,
      this.values,
      this.values.foxentryPaymentStatus
    );
    this.errors = fieldErrors;
    this.validating = false;
    return ok;
  }

  async nextStep(targetStep: string) {
    // Logic to move to next step
    // This will be driven by the Phase components calling this
    this.currentStep = targetStep;
    this.saveToSession();
    this.trackPageView(targetStep);
  }

  // --- Submission ---

  mapStepsToSnapshot<T extends object, K extends keyof T>(
    obj: T,
    keysToKeep: readonly K[]
  ): Pick<T, K> {
    const result: Partial<Pick<T, K>> = {};
    for (const key of keysToKeep) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result as Pick<T, K>;
  }

  async submitPhase1() {
    this.disable = true;
    this.submitting = true;
    this.formState = "submitting";

    // Placeholder endpoint
    const endpoint = PHASE1_ENDPOINT;
    // artificial delay
    // await sleep(3000);
    try {
      const fieldsForSnapshot = [
        ...steps.step1,
        ...steps.step2,
        ...steps.step3,
        ...steps.step4,
        ...steps.alwaysInclude,
      ];
      const snapshot = this.mapStepsToSnapshot(this.values, fieldsForSnapshot);
      const fd = new FormData();
      for (const [k, v] of Object.entries(snapshot)) {
        if (
          k === "filesNationalId" ||
          k === "filesEuPassport" ||
          k === "filesNonEu" ||
          k === "filesDriversLicense"
        )
          continue;
        if (v === undefined || v === null) continue;

        if (
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "boolean"
        ) {
          fd.append(k, String(v));
        } else {
          // Nested objects (if any): send as JSON string
          fd.append(k, JSON.stringify(v));
        }
      }
      const res = await fetch(endpoint, {
        method: "POST",
        body: fd,
      });

      const text = await res.text();
      console.log("[formsubmission]", text);
      this.formState = "success";
      this.submissionStatus = SubmissionStatus.APPROVED;

      this.errors = {};
      const welcome = "/vitejte";
      window.location.replace(welcome);
    } catch (err) {
      console.error(err);
      this.formState = "fail";
      this.submissionStatus = SubmissionStatus.REJECTED;
    } finally {
      this.disable = false;
      this.submitting = false;

      this.trackCompletion(this.submissionStatus);
      this.trackCompletionWithoutAds(this.submissionStatus);
    }
  }

  async submitPhase2() {
    this.disable = true;
    this.submitting = true;
    this.formState = "submitting";

    // Placeholder endpoint
    const endpoint = PHASE2_ENDPOINT;
    // artificial delay
    // await sleep(3000);
    try {
      const fieldsForSnapshot = [...steps.phase2, ...steps.alwaysInclude];
      const snapshot = this.mapStepsToSnapshot(this.values, fieldsForSnapshot);
      const fd = new FormData();
      for (const [k, v] of Object.entries(snapshot)) {
        if (
          k === "filesNationalId" ||
          k === "filesEuPassport" ||
          k === "filesNonEu" ||
          k === "filesDriversLicense"
        )
          continue;
        if (v === undefined || v === null) continue;

        if (
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "boolean"
        ) {
          fd.append(k, String(v));
        } else {
          // Nested objects (if any): send as JSON string
          fd.append(k, JSON.stringify(v));
        }
      }
      snapshot.filesNationalId?.forEach((f) =>
        fd.append("filesNationalId", f, f.name)
      );
      snapshot.filesEuPassport?.forEach((f) =>
        fd.append("filesEuPassport", f, f.name)
      );
      snapshot.filesNonEu?.forEach((f) => fd.append("filesNonEu", f, f.name));
      snapshot.filesDriversLicense?.forEach((f) =>
        fd.append("filesDriversLicense", f, f.name)
      );

      snapshot.courierId = this.values.courierId;
      fd.append("courierId", this.values.courierId);

      const res = await fetch(endpoint, {
        method: "POST",
        body: fd,
      });

      const text = await res.text();
      console.log("[formsubmission]", text);
      this.formState = "success";
      this.submissionStatus = SubmissionStatus.APPROVED;

      this.errors = {};
      const welcome = "/dekujeme";
      window.location.replace(welcome);
    } catch (err) {
      console.error(err);
      this.formState = "fail";
      this.submissionStatus = SubmissionStatus.REJECTED;
    } finally {
      this.disable = false;
      this.submitting = false;

      this.trackCompletion(this.submissionStatus);
      this.trackCompletionWithoutAds(this.submissionStatus);
    }
  }

  // --- File Handling ---

  appendFiles(bucket: Bucket, files: FileList | File[]) {
    const fileList = Array.isArray(files) ? files : Array.from(files);

    const targetArray =
      bucket === "nationalId"
        ? this.values.filesNationalId
        : bucket === "euPassport"
        ? this.values.filesEuPassport
        : bucket === "driversLicense"
        ? this.values.filesDriversLicense
        : this.values.filesNonEu;

    // Dedupe
    const current = targetArray;
    const byKey = new Map<string, File>();
    [...current, ...fileList].forEach((f) => {
      byKey.set(`${f.name}|${f.size}|${f.lastModified}`, f);
    });

    const newFiles = Array.from(byKey.values());

    if (bucket === "nationalId") this.values.filesNationalId = newFiles;
    else if (bucket === "euPassport") this.values.filesEuPassport = newFiles;
    else if (bucket === "driversLicense")
      this.values.filesDriversLicense = newFiles;
    else this.values.filesNonEu = newFiles;
  }

  removeFile(bucket: Bucket, file: File) {
    const targetArray =
      bucket === "nationalId"
        ? this.values.filesNationalId
        : bucket === "euPassport"
        ? this.values.filesEuPassport
        : bucket === "driversLicense"
        ? this.values.filesDriversLicense
        : this.values.filesNonEu;

    const newFiles = targetArray.filter((f) => f !== file);

    if (bucket === "nationalId") this.values.filesNationalId = newFiles;
    else if (bucket === "euPassport") this.values.filesEuPassport = newFiles;
    else if (bucket === "driversLicense")
      this.values.filesDriversLicense = newFiles;
    else this.values.filesNonEu = newFiles;
  }

  // --- Foxentry Search & Validation Wrappers ---

  async onBlurEmail() {
    if (this.values.foxentryPaymentStatus === false) return;
    const r = await validateEmail(this.values.email, {
      acceptDisposableEmails: false,
    });

    if (!r.isValid) {
      this.errors.email = [t("errors.email")];
    } else {
      delete this.errors.email;
    }
    // Hint logic could go here if we had a UI for it
    if (r.normalized) this.values.email = r.normalized;
  }

  async onBlurPhone() {
    const raw = this.values.phone;
    if (!raw || raw.trim().length === 0) return;

    const normalized = this.normalizeCzPhone(raw);
    if (!normalized) {
      this.errors.phone = [t("errors.phone")];
      return;
    }

    this.values.phone = normalized;

    if (this.values.foxentryPaymentStatus === false) return;

    const r = await validatePhone(this.values.phone, {
      validationType: "basic",
      preferredPrefixes: ["+420"],
      formatNumber: false,
      correctionMode: "full",
      allowedPrefixes: ["+420"],
    });
    if (!r.isValid) {
      this.errors.phone = [t("errors.phone")];
    } else {
      delete this.errors.phone;
    }

    if (r.normalized && r.normalized !== this.values.phone) {
      this.values.phone = r.normalized;
    }
  }

  async onBlurName(field: "firstName" | "lastName") {
    if (this.values.foxentryPaymentStatus === false) return;
    const val = this.values[field];
    if (val.length === 0) return;

    const r = await validateName(
      val,
      field === "firstName" ? "name" : "surname"
    );

    // Check if r is an error object or validity object
    if (!("isValid" in r)) return; // Skip if error

    if (!r.isValid) {
      this.errors[field] = [t(`errors.fox.${field}`)];
    } else {
      delete this.errors[field];
    }
    if (r.normalized) this.values[field] = r.normalized;
  }

  // --- Address Search Logic ---

  searchForAddress = debounce(async (type: LocationSearchType, q: string) => {
    const r = await searchLocations(
      type,
      q,
      "CZ",
      10,
      0,
      this.buildFilterFor(type),
      { allowEmpty: this.hasContextFor(type) }
    );
    this.addressSuggestions = r.items;
  }, 50);

  buildFilterFor(type: LocationSearchType) {
    const clean = <T extends Record<string, any>>(o: T): T =>
      Object.fromEntries(
        Object.entries(o).filter(([, v]) => v != null && v !== "")
      ) as T;

    const normZip = (z?: string) => (z ? z.replace(/\s/g, "") : undefined);

    const street =
      (this.values.street || this.addrCtx.street || "").trim() || undefined;
    const city =
      (this.values.city || this.addrCtx.city || "").trim() || undefined;
    const zip = normZip(this.values.zip) ?? this.addrCtx.zip;
    const base = { country: "CZ" };

    switch (type) {
      case "full":
      case "street":
        return clean({ ...base, city, zip });
      case "number.full":
        return clean({ ...base, street, city, zip });
      case "city":
        return clean({ ...base, zip, street });
      case "zip":
        return clean({ ...base, city, street });
      default:
        return base;
    }
  }

  hasContextFor(type: LocationSearchType) {
    const street = (this.values.street || this.addrCtx.street || "").trim();
    const city = (this.values.city || this.addrCtx.city || "").trim();
    const zip = (this.values.zip || this.addrCtx.zip || "").replace(/\s/g, "");

    if (type === "number.full") {
      return !!(this.addrCtx.streetId || (street && (city || zip)));
    }
    if (type === "city") return !!(street || zip);
    if (type === "zip") return !!(street || city);
    if (type === "street" || type === "full") return !!(city || zip);
    return false;
  }

  apiTypeFor(field: LocationSearchType): LocationSearchType {
    return field === "street" ? "full" : field;
  }

  currentQueryFor(type: LocationSearchType | null): string {
    if (!type) return "";
    if (type === "street") return this.values.street;
    if (type === "number.full") return this.values.houseNumber;
    if (type === "city") return this.values.city;
    if (type === "zip") return this.values.zip;
    return "";
  }

  queueSearchForActive() {
    if (!this.activeAddressType) return;
    if (this.values.foxentryPaymentStatus === false) return;

    const q = (this.currentQueryFor(this.activeAddressType) || "").trim();

    // FOCUS with empty value logic
    if (q.length === 0) {
      if (this.activeAddressType === "number.full") {
        const street = (this.values.street || this.addrCtx.street || "").trim();
        if (!street) {
          this.addressSuggestions = [];
          return;
        }
        this.searchForAddress("full", `${street} `);
        return;
      }
      // ... (other empty logic from original if needed, simplified here)
      if (this.activeAddressType === "city") {
        const street = (this.values.street || this.addrCtx.street || "").trim();
        const zip = (this.values.zip || this.addrCtx.zip || "").replace(
          /\s/g,
          ""
        );
        if (street) {
          this.searchForAddress("full", `${street} `);
          return;
        }
        if (zip) {
          this.searchForAddress("zip", zip);
          return;
        }
        this.addressSuggestions = [];
        return;
      }

      if (this.activeAddressType === "zip") {
        const street = (this.values.street || this.addrCtx.street || "").trim();
        const city = (this.values.city || this.addrCtx.city || "").trim();
        if (street) {
          this.searchForAddress("full", `${street} `);
          return;
        }
        if (city) {
          this.searchForAddress("city", city.slice(0, 3));
          return;
        }
        this.addressSuggestions = [];
        return;
      }
    }

    this.searchForAddress(this.apiTypeFor(this.activeAddressType), q);
  }

  onAddressFocus(type: LocationSearchType) {
    if (this.values.foxentryPaymentStatus === false) return;
    this.activeAddressType = type;
    this.queueSearchForActive();
  }

  onAddressBlur() {
    setTimeout(() => {
      this.activeAddressType = null;
      this.addressSuggestions = [];
    }, 200);
  }

  applySuggestion(s: FxLocation) {
    this.values.street = s.street ?? this.values.street;
    this.values.houseNumber = s.streetNumber ?? this.values.houseNumber;
    this.values.city = s.city ?? this.values.city;
    this.values.zip = s.postalCode ?? this.values.zip;
    // this.values.address = s.full ?? s.streetWithNumber ?? this.values.address; // If we use 'address' field

    this.addrCtx.street = s.street ?? this.addrCtx.street;
    this.addrCtx.city = s.city ?? this.addrCtx.city;
    this.addrCtx.zip = s.postalCode ?? this.addrCtx.zip;

    this.values.__addressFromSuggestion = true;
    this.addressSuggestions = [];
    this.activeAddressType = null;
  }

  // --- Tracking ---

  trackPageView(step: string) {
    if (typeof window === "undefined") return;
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: "virtualPageview",
      stepPage: `step-${step}`,
    });
  }

  async trackCompletion(status: string) {
    let consent = 0;
    const sklikConversionIds = {
      longForm: 100053768,
    };
    try {
      if (window.CookieScript && window.CookieScript.instance) {
        const consentState = window.CookieScript.instance.currentState();
        // Assuming 'advertising' is the category for Sklik; adjust if different
        consent = consentState.categories.includes("targeting") ? 1 : 0;
      } else {
        // Fallback: Check cookie directly (less reliable)
        const cookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("CookieScriptConsent="));
        if (cookie) {
          const consentData = JSON.parse(
            decodeURIComponent(cookie.split("=")[1])
          );
          consent = consentData.categories.includes("targeting") ? 1 : 0;
        }
      }
    } catch (e) {
      console.error("Error retrieving CookieScript consent:", e);
      consent = 0; // Default to no consent if error occurs
    }

    // Hash email for eid
    let hashedEmail = "";
    try {
      hashedEmail = await this.hashEmail(this.values.email);
    } catch (e) {
      console.error("Email hashing failed:", e);
    }

    // Address for aid
    const address = {
      a1: "Czech Republic",
      a2: this.values.city || "",
      a3: this.values.address || "",
      a4: "",
      a5: this.values.zip || "",
    };

    // Phone for tid
    const phone = this.values.phone;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "formCompletion",
      status: status,
      user: {
        email: this.values.email,
        phone: this.values.phone,
        firstName: this.values.firstName,
        lastName: this.values.lastName,
        postalCode: this.values.zip,
        country: "Czech Republic",
        ...(this.values.address && {
          streetAddress: this.values.address,
        }),
        ...(this.values.city && { city: this.values.city }),
      },
      sklikConversion: {
        consent: consent,
        eid: hashedEmail || this.values.email,
        aid: address,
        tid: phone,
        id: sklikConversionIds.longForm,
        zboziType: "standard",
      },
      enhanced_conversions: {
        email: this.values.email,
        phone_number: this.values.phone,
        address: {
          first_name: this.values.firstName || "",
          last_name: this.values.lastName || "",
          street: this.values.street || "",
          city: this.values.city || "",
          postal_code: this.values.zip || "",
          country: "CZ",
        },
      },
      gtm_ad_storage: consent === 1 ? "granted" : "denied",
    });
  }

  trackCompletionWithoutAds(status: string) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "formCompletionWithoutAds",
      status: status,
    });
  }
}
