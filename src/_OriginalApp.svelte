<script lang="ts">
    import { fade } from "svelte/transition";
    import { t, setLocale, type Locale } from "./lib/i18n/i18n.svelte";
    import { getCountries } from "./lib/i18n/countriesGetter";
    import { isEu } from "./lib/i18n/euCountriesFilter";
    import { getCities } from "./lib/i18n/citiesGetter";
    import { getInsuranceOptions } from "./lib/i18n/insuranceGetter";
    import { validateStepAsync } from "./lib/utils/validation";
    import Errors from "./lib/components/Errors.svelte";
    import {
        debounce,
        type FxCompany,
        type FxError,
        type FxLocation,
        type FxValidity,
        type LocationSearchType,
        searchCompanies,
        searchLocations,
        validateCompany,
        validateEmail,
        validateName,
        validatePhone,
    } from "./lib/foxentry";
    import { getEndpoint } from "./lib/utils/getEndpoints";
    import { onMount } from "svelte";
    import Loader from "./lib/components/Loader.svelte";
    import { sendFoxentryFailedPaymentNotification } from "./lib/utils/notifications";
    import { SubmissionStatus } from "./lib/enums/form";
    import type {
        Company,
        FormStates,
        CustomErrors,
        Bucket,
    } from "./lib/types";

    class Form {
        errors = $state({});
        state: FormStates = $state("neutral");
    }

    let submissionStatus: SubmissionStatus = $state(SubmissionStatus.PENDING);

    let form = new Form();
    let debug = $state(false);

    abstract class PageHelper {
        static domains: Record<string, Company> = {
            "rozvazej.cz": "Wolt",
            "rozvazej-foodora.cz": "Foodora",
            "fofrjidlo.cz": "Foodora",
            "bleskrozvoz.cz": "Bolt",
            localhost: "Development",
        };

        static setDebugValues(step: string) {
            switch (step) {
                case "step3":
                    values = {
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        companyId: "",
                        companyName: "",
                        nationalId: "",
                        passportOrId: "",
                        deliveryCompany: PageHelper.getCompanyByDomain(),
                        deliveryCompanyWolt: false,
                        deliveryCompanyFoodora: false,
                        deliveryCompanyBolt: false,
                        applyAsCompany: false,
                        __addressFromSuggestion: false,
                        address: "",
                        country: "FR",
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
                        pinkStatement: undefined,
                        gender: "",
                        birthDate: "",
                        passportExpiryDate: "",
                        filesNationalId: [],
                        filesEuPassport: [],
                        filesNonEu: [],
                        filesDriversLicense: [],
                        utm_source: "",
                        utm_campaign: "",
                        utm_medium: "",
                        utm_id: "",
                        language: locale,
                        submitSource: PageHelper.getCompanyByDomain()[0],
                        foxentryPaymentStatus: true,
                        step1Completed: true,
                        step2Completed: true,
                        step3Completed: false,
                        sessionId: PageHelper.getSessionId(),
                        formStart: PageHelper.getFormStart(),
                        firstEndpointSubmissionId: undefined,
                        firstEndpointSubmissionTime: undefined,
                        finalEndpointSubmissionId: undefined,
                        finalEndpointSubmissionTime: undefined,
                        placeOfBirth: "",
                        permanentResidence: "",
                    };

                    currentStep = Steps.step3;

                    break;
                case "step2":
                    values = {
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        companyId: "",
                        companyName: "",
                        nationalId: "",
                        passportOrId: "",
                        deliveryCompany: PageHelper.getCompanyByDomain(),
                        deliveryCompanyWolt: false,
                        deliveryCompanyFoodora: false,
                        deliveryCompanyBolt: false,
                        applyAsCompany: false,
                        __addressFromSuggestion: false,
                        address: "",
                        country: "FR",
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
                        pinkStatement: undefined,
                        gender: "",
                        birthDate: "",
                        passportExpiryDate: "",
                        filesNationalId: [],
                        filesEuPassport: [],
                        filesNonEu: [],
                        filesDriversLicense: [],
                        utm_source: "",
                        utm_campaign: "",
                        utm_medium: "",
                        utm_id: "",
                        language: locale,
                        submitSource: PageHelper.getCompanyByDomain()[0],
                        foxentryPaymentStatus: true,
                        step1Completed: true,
                        step2Completed: false,
                        step3Completed: false,
                        sessionId: PageHelper.getSessionId(),
                        formStart: PageHelper.getFormStart(),
                        firstEndpointSubmissionId: undefined,
                        firstEndpointSubmissionTime: undefined,
                        finalEndpointSubmissionId: undefined,
                        finalEndpointSubmissionTime: undefined,
                        placeOfBirth: "",
                        permanentResidence: "",
                    };

                    currentStep = Steps.step2;
                    break;
                default:
                    break;
            }
        }

        static async hashEmail(email: string): Promise<string> {
            if (!email) return "";
            const msgBuffer = new TextEncoder().encode(
                email.trim().toLowerCase(),
            );
            const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
        }

        static trackCompletionWithoutAds(status: string) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "formCompletionWithoutAds",
                status: status,
            });
        }
        static trackCompletionWithAds(status: string) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "formCompletionWithAds",
                status: status,
            });
        }

        static async trackCompletion(status: string) {
            let consent = 0;
            const sklikConversionIds = {
                longForm: 100053768,
            };
            try {
                if (window.CookieScript && window.CookieScript.instance) {
                    const consentState =
                        window.CookieScript.instance.currentState();
                    // Assuming 'advertising' is the category for Sklik; adjust if different
                    consent = consentState.categories.includes("targeting")
                        ? 1
                        : 0;
                } else {
                    // Fallback: Check cookie directly (less reliable)
                    const cookie = document.cookie
                        .split("; ")
                        .find((row) => row.startsWith("CookieScriptConsent="));
                    if (cookie) {
                        const consentData = JSON.parse(
                            decodeURIComponent(cookie.split("=")[1]),
                        );
                        consent = consentData.categories.includes("targeting")
                            ? 1
                            : 0;
                    }
                }
            } catch (e) {
                console.error("Error retrieving CookieScript consent:", e);
                consent = 0; // Default to no consent if error occurs
            }

            // Hash email for eid
            let hashedEmail = "";
            try {
                hashedEmail = await this.hashEmail(values.email);
            } catch (e) {
                console.error("Email hashing failed:", e);
            }

            // Address for aid
            const address = {
                a1: "Czech Republic",
                a2: values.city || "",
                a3: values.address || "",
                a4: "",
                a5: values.zip || "",
            };

            // Phone for tid
            const phone = values.phone;

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "formCompletion",
                status: status,
                user: {
                    email: values.email,
                    phone: values.phone,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    postalCode: values.zip,
                    country: "Czech Republic",
                    ...(values.address && {
                        streetAddress: values.address,
                    }),
                    ...(values.city && { city: values.city }),
                },
                sklikConversion: {
                    consent: consent,
                    eid: hashedEmail || values.email,
                    aid: address,
                    tid: phone,
                    id: sklikConversionIds.longForm,
                    zboziType: "standard",
                },
                enhanced_conversions: {
                    email: values.email,
                    phone_number: values.phone,
                    address: {
                        first_name: values.firstName || "",
                        last_name: values.lastName || "",
                        street: values.street || "",
                        city: values.city || "",
                        postal_code: values.zip || "",
                        country: "CZ",
                    },
                },
                gtm_ad_storage: consent === 1 ? "granted" : "denied",
            });
        }

        static trackDropOff(step: string) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "dropOff",
                stepDroppedOff: `step-${step}`,
            });
        }

        static trackPageView(step: string) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "virtualPageview",
                stepPage: `step-${step}`,
            });
        }

        static trackFirstStep() {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "firstStep",
                user: {
                    email: values.email,
                },
            });
        }

        static getSessionId() {
            return crypto.randomUUID();
        }

        static getFormStart() {
            return new Date().toUTCString();
        }

        static checkLanguage(): "cs" | "en" {
            const path =
                typeof window !== "undefined" ? window.location.pathname : "";
            if (path.endsWith("-en")) return "en";
            return "cs";
        }

        static getCompanyByDomain(hostname?: string): Company[] {
            const raw = (
                hostname ??
                (typeof window !== "undefined" ? window.location.hostname : "")
            ).toLowerCase();
            const host = raw.replace(/^www\./, "");

            const exact = PageHelper.domains[host];
            if (exact) return [exact];

            const sub = Object.entries(PageHelper.domains).find(([domain]) =>
                host.endsWith("." + domain),
            )?.[1];

            return sub ? [sub] : [""];
        }
        static normalizeCzPhone(input: string): string | null {
            const s = (input ?? "").trim();
            if (!s) return null;

            const digits = s.replace(/\D/g, ""); // keep digits only

            // Case 1: already +E.164
            if (s.startsWith("+")) {
                // must be +420 followed by 9 digits
                if (digits.startsWith("420") && digits.length === 12)
                    return `+${digits}`;
                return null; // not a CZ E.164 number
            }

            // Case 2: international 00 prefix
            if (digits.startsWith("00420") && digits.length === 14) {
                return `+420${digits.slice(5)}`;
            }

            // Case 3: national forms
            //   - 10 digits starting with 0: drop the 0 and prefix +420
            if (digits.length === 10 && digits.startsWith("0")) {
                return `+420${digits.slice(1)}`;
            }
            //   - 9 digits (typical CZ local): prefix +420
            if (digits.length === 9) {
                return `+420${digits}`;
            }

            // Case 4: already 420xxxxxxxxx without plus
            if (digits.startsWith("420") && digits.length === 12) {
                return `+${digits}`;
            }

            return null; // unsupported shape
        }
        static hasNoCustomErrors = (err?: CustomErrors | null): boolean =>
            !err || Object.keys(err).length === 0;
        static updateParamsWithState(state: string): void {
            const params = new URLSearchParams(window.location.search);
            params.set("state", state);
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.replaceState({}, "", newUrl);
        }
        static toFiles = (v?: FileList | File[] | null) =>
            Array.isArray(v) ? v : v ? Array.from(v) : [];

        static validate = async (path: "step" | "final") => {};
        static next = async (step: "step2" | "step3") => {
            validating = true;
            const valuesToValidate = {
                ...values,
                filesNationalId: PageHelper.toFiles(filesNationalId),
                filesEuPassport: PageHelper.toFiles(filesEuPassport),
                filesNonEu: PageHelper.toFiles(filesNonEu),
            };

            const { ok, fieldErrors } = await validateStepAsync(
                currentStep,
                valuesToValidate,
                values.foxentryPaymentStatus,
            );

            // merge with any preexisting custom errors you maintain elsewhere
            errors = fieldErrors;
            validating = false;
            if (ok && PageHelper.hasNoCustomErrors(errors)) {
                switch (currentStep) {
                    case Steps.step1:
                        await PageHelper.partialSubmit();
                        values.step1Completed = true;
                        break;
                    case Steps.step2:
                        values.step2Completed = true;
                    default:
                        values.step3Completed = true;
                        break;
                }
                currentStep = Steps[step];
                PageHelper.trackPageView(currentStep);
                PageHelper.updateParamsWithState(step);
            }
        };
        static prev = (step: "step1" | "step2") => {
            currentStep = Steps[step];
            PageHelper.updateParamsWithState(step);
        };
        static submit = async () => {
            disable = true;
            submitting = true;
            form.state = "submitting";
            const endpoint = getEndpoint("final");

            // Build a clean snapshot with files as File[]
            const snapshot = {
                ...values,
                filesNationalId: PageHelper.toFiles(filesNationalId),
                filesEuPassport: PageHelper.toFiles(filesEuPassport),
                filesNonEu: PageHelper.toFiles(filesNonEu),
                filesDriversLicense: PageHelper.toFiles(filesDriversLicense),
                submitLocation: window.location.href,
                finalEndpointSubmissionId: crypto.randomUUID(),
                finalEndpointSubmissionTime: new Date().toUTCString(),
            };

            // ---- FormData ----
            const fd = new FormData();

            // 1) Append scalar fields (string/number/boolean). JSON-encode any objects just in case.
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

            // 2) Append files. Choose ONE of the patterns below:

            // (A) Single consolidated array 'files[]' with per-file metadata (bucket)
            const appendFiles = (arr: File[], bucket: string) => {
                arr?.forEach((file, idx) => {
                    fd.append("files[]", file, file.name);
                    // optional: parallel metadata so Make can tell which bucket this file came from
                    fd.append(
                        "files_meta[]",
                        JSON.stringify({
                            bucket,
                            idx,
                            name: file.name,
                            size: file.size,
                            type: file.type,
                        }),
                    );
                });
            };

            // (B) Separate arrays per bucket (if your Make scenario prefers distinct keys)
            snapshot.filesNationalId?.forEach((f) =>
                fd.append("filesNationalId", f, f.name),
            );
            snapshot.filesEuPassport?.forEach((f) =>
                fd.append("filesEuPassport", f, f.name),
            );
            snapshot.filesNonEu?.forEach((f) =>
                fd.append("filesNonEu", f, f.name),
            );
            snapshot.filesDriversLicense?.forEach((f) =>
                fd.append("filesDriversLicense", f, f.name),
            );
            const _test = "https://httpstat.us/500";
            try {
                const res = await fetch(endpoint, {
                    method: "POST",
                    body: fd,
                });

                const text = await res.text();
                console.log("Submit:", res.status, text);
                if (!res.ok) {
                    form.state = "fail";
                    form.errors = {
                        error: { status: res.status, message: res.statusText },
                    };
                    console.error("Submit failed");
                    submissionStatus = SubmissionStatus.REJECTED;
                    PageHelper.trackCompletion(submissionStatus);
                    PageHelper.trackCompletionWithoutAds(submissionStatus);
                } else {
                    form.errors = {};
                    form.state = "success";
                    submissionStatus = SubmissionStatus.APPROVED;
                    PageHelper.trackCompletion(submissionStatus);
                    PageHelper.trackCompletionWithoutAds(submissionStatus);
                    const welcome = "/vitejte";
                    window.location.replace(welcome);
                }
            } catch (err: any) {
                form.errors = err;
                console.error("Network error:", err);
                submissionStatus = SubmissionStatus.REJECTED;
                PageHelper.trackCompletion(submissionStatus);
                PageHelper.trackCompletionWithoutAds(submissionStatus);
            }
            disable = false;
            submitting = false;
            form.errors = {};
            form.state = "neutral";
        };
        static partialSubmit = async () => {
            disable = true;
            const endpoint = getEndpoint("partial");

            const snapshot = {
                ...values,
                submitLocation: window.location.href,
                firstEndpointSubmissionId: crypto.randomUUID(),
                firstEndpointSubmissionTime: new Date().toUTCString(),
            };

            // ---- FormData ----
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
                    fd.append(k, JSON.stringify(v));
                }
            }

            try {
                const res = await fetch(endpoint, {
                    method: "POST",
                    body: fd,
                });

                const text = await res.text();
                console.log("Submit:", res.status, text);
                if (!res.ok) {
                    console.error("Submit failed");
                    form.errors["submit"] = [t("result.fail")];
                } else {
                    // success UI here if you want
                    delete form.errors["submit"];
                    PageHelper.trackFirstStep();
                }
            } catch (err) {
                console.error("Network error:", err);
            }

            disable = false;
        };

        static getUtmParams() {
            const params = new URLSearchParams(window.location.search);
            const utmKeys = [
                "utm_source",
                "utm_medium",
                "utm_campaign",
                "utm_id",
            ];

            return Object.fromEntries(
                utmKeys.map((key) => [key, params.get(key) ?? ""]),
            );
        }
    }

    let locale: Locale = $state(PageHelper.checkLanguage());
    setLocale(locale);

    const Steps = {
        step1: "step1",
        step2: "step2",
        step3: "step3",
    };

    const StepIndexes = [Steps.step1, Steps.step2, Steps.step3];

    const params = new URLSearchParams(window.location.search);
    const formStep = params.get("state");
    let errors: any = $state({});
    let validating = $state(false);
    let disable = $state(false);
    let submitting = $state(false);

    let currentStep = $state(Steps.step1);
    let currentStepIndex = $derived(
        StepIndexes.findIndex((s) => s === currentStep) + 2,
    );
    //	if (formStep) {
    //		currentStep = Steps[formStep];
    //	}

    /* File management */
    let filesNationalId: FileList | undefined = $state();
    let filesEuPassport: FileList | undefined = $state();
    let filesNonEu: FileList | undefined = $state();
    let filesNationalIdInput: HTMLInputElement | undefined = $state();
    let filesEuPassportInput: HTMLInputElement | undefined = $state();
    let filesNonEuInput: HTMLInputElement | undefined = $state();
    let filesDriversLicense: FileList | undefined = $state();
    let filesDriversLicenseInput: HTMLInputElement | undefined = $state();

    function toFileList(files: File[]): FileList {
        const dt = new DataTransfer();
        files.forEach((f) => dt.items.add(f));
        return dt.files;
    }

    function appendFilesTo(which: Bucket, incoming: FileList | File[]) {
        const get = (w: Bucket) =>
            w === "nationalId"
                ? filesNationalId
                : w === "euPassport"
                  ? filesEuPassport
                  : w === "driversLicense"
                    ? filesDriversLicense
                    : filesNonEu;

        const set = (w: Bucket, fl: FileList | undefined) => {
            if (w === "nationalId") filesNationalId = fl;
            else if (w === "euPassport") filesEuPassport = fl;
            else if (w === "driversLicense") filesDriversLicense = fl;
            else filesNonEu = fl;
        };

        const current = Array.from(get(which) ?? []);
        const add = Array.isArray(incoming) ? incoming : Array.from(incoming);

        // de-dupe by (name, size, lastModified)
        const byKey = new Map<string, File>();
        for (const f of [...current, ...add]) {
            byKey.set(`${f.name}|${f.size}|${f.lastModified}`, f);
        }

        const next = toFileList([...byKey.values()]);
        set(which, next);

        // clear the input so selecting the same file again triggers change
        const node =
            which === "nationalId"
                ? filesNationalIdInput
                : which === "euPassport"
                  ? filesEuPassportInput
                  : which === "driversLicense"
                    ? filesDriversLicenseInput
                    : filesNonEuInput;
        if (node) node.value = "";
    }

    function removeFileFrom(which: Bucket, target: File | string) {
        const get = () =>
            which === "nationalId"
                ? filesNationalId
                : which === "euPassport"
                  ? filesEuPassport
                  : which === "driversLicense"
                    ? filesDriversLicense
                    : filesNonEu;

        const set = (fl: FileList) => {
            if (which === "nationalId") {
                filesNationalId = fl;
                if (filesNationalIdInput)
                    (filesNationalIdInput as any).files = fl; // TS says readonly; runtime works
            } else if (which === "euPassport") {
                filesEuPassport = fl;
                if (filesEuPassportInput)
                    (filesEuPassportInput as any).files = fl;
            } else if (which === "driversLicense") {
                filesDriversLicense = fl;
            } else {
                filesNonEu = fl;
                if (filesNonEuInput) (filesNonEuInput as any).files = fl;
            }
        };

        const current = get();
        if (!current) return;

        const keep = (f: File) =>
            typeof target === "string"
                ? f.name !== target
                : !(
                      f === target ||
                      (f.name === target.name &&
                          f.lastModified === target.lastModified)
                  );

        const next = toFileList(Array.from(current).filter(keep));
        set(next);
    }

    /* //File management */

    let values = $state({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        companyId: "",
        companyName: "",
        nationalId: "",
        passportOrId: "",
        deliveryCompany: PageHelper.getCompanyByDomain(),
        deliveryCompanyWolt: false,
        deliveryCompanyFoodora: false,
        deliveryCompanyBolt: false,
        applyAsCompany: undefined,
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
        pinkStatement: undefined,
        gender: "",
        birthDate: "",
        passportExpiryDate: "",
        filesNationalId: [],
        filesEuPassport: [],
        filesNonEu: [],
        filesDriversLicense: [],
        utm_source: "",
        utm_campaign: "",
        utm_medium: "",
        utm_id: "",
        language: locale,
        submitSource: PageHelper.getCompanyByDomain()[0],
        foxentryPaymentStatus: true,
        step1Completed: false,
        step2Completed: false,
        step3Completed: false,
        sessionId: PageHelper.getSessionId(),
        formStart: PageHelper.getFormStart(),
        firstEndpointSubmissionId: undefined,
        firstEndpointSubmissionTime: undefined,
        finalEndpointSubmissionId: undefined,
        finalEndpointSubmissionTime: undefined,
        placeOfBirth: "",
        permanentResidence: "",
    });

    let stepNavText = $derived(
        `${t("nav.next")} ${currentStepIndex}/${values.applyAsCompany ? "2" : "3"}`,
    );

    $effect(() => {
        values.deliveryCompanyWolt = values.deliveryCompany.includes("Wolt");
        values.deliveryCompanyFoodora =
            values.deliveryCompany.includes("Foodora");
        values.deliveryCompanyBolt = values.deliveryCompany.includes("Bolt");
    });

    $effect(() => {
        sessionStorage.setItem("multi-form-session", JSON.stringify(values));
    });

    onMount(async () => {
        const saved = sessionStorage.getItem("multi-form-session");
        if (saved) {
            try {
                Object.assign(values, JSON.parse(saved));
                console.log("Restored form values from sessionStorage");
            } catch (e) {
                console.error("Failed to parse saved form data", e);
            }
        }
        const utmParams = PageHelper.getUtmParams();
        Object.assign(values, utmParams);
        const foxentryPaymentStatus: FxValidity | FxError = await validateName(
            "John",
            "name",
        );
        if (
            foxentryPaymentStatus?.status &&
            foxentryPaymentStatus?.status === 402
        ) {
            values.foxentryPaymentStatus = false;
            await sendFoxentryFailedPaymentNotification();
        }

        const searchParams = new URLSearchParams(window.location.search);
        const debug = searchParams.get("debug");

        if (debug && debug === "true") {
            const debugStep = searchParams.get("debugStep") ?? "step2";
            PageHelper.setDebugValues(debugStep);
        }

        window.addEventListener("beforeunload", (event) => {
            PageHelper.trackDropOff(currentStep);
        });

        PageHelper.trackPageView(currentStep);
    });

    /* Foxentry validation */
    let emailHint = $state("");
    async function onBlurEmail() {
        if (values.foxentryPaymentStatus === false) return;
        const r = await validateEmail(values.email, {
            acceptDisposableEmails: false,
        });

        if (!r.isValid) {
            errors.email = [t("errors.email")];
        } else {
            delete errors.email;
        }
        emailHint =
            r.suggestion && r.suggestion !== values.email
                ? `Did you mean ${r.suggestion}?`
                : "";
        if (r.normalized) values.email = r.normalized;
    }

    async function onBlurPhone() {
        const raw = values.phone;
        if (!raw || raw.trim().length === 0) return;

        const normalized = PageHelper.normalizeCzPhone(raw);
        if (!normalized) {
            errors.phone = [t("errors.phone")]; // "Enter a valid CZ number"
            return;
        }

        values.phone = normalized;

        // Optional: confirm with Foxentry
        if (values.foxentryPaymentStatus === false) return;

        const r = await validatePhone(values.phone, { country: "CZ" });
        if (!r.isValid) {
            errors.phone = [t("errors.phone")];
        } else {
            delete errors.phone;
        }

        // If Foxentry returns a nicer canonical form, adopt it
        if (r.normalized && r.normalized !== values.phone) {
            values.phone = r.normalized;
        }
    }

    async function onBlurFirstName() {
        if (values.foxentryPaymentStatus === false) return;

        if (values.firstName.length == 0) return;
        const r: any = await validateName(values.firstName, "name");

        if (!r.isValid) {
            errors.firstName = [t("errors.fox.firstName")];
        } else {
            delete errors.firstName;
        }
        if (r.normalized) values.firstName = r.normalized;
    }

    async function onBlurLastName() {
        if (values.foxentryPaymentStatus === false) return;

        if (values.lastName.length == 0) return;
        const r: any = await validateName(values.lastName, "surname");

        if (!r.isValid) {
            errors.lastName = [t("errors.fox.lastName")];
        } else {
            delete errors.lastName;
        }
        if (r.normalized) values.lastName = r.normalized;
    }

    /* Address search */
    // App.svelte
    type AddressCtx = {
        street?: string;
        streetId?: string; // from Foxentry
        city?: string;
        zip?: string;
    };
    let addrCtx: AddressCtx = $state({});
    function setAddrCtxFromPick(s: FxLocation) {
        addrCtx.street = s.street ?? addrCtx.street;
        addrCtx.city = s.city ?? addrCtx.city;
        addrCtx.zip = s.postalCode ?? addrCtx.zip;
    }
    let suggestions = $state([]);
    let activeType: LocationSearchType | null = $state(null);

    const searchForAddress = debounce(
        async (type: LocationSearchType, q: string) => {
            const r = await searchLocations(
                type,
                q,
                "CZ",
                10,
                0,
                buildFilterFor(type),
                { allowEmpty: hasContextFor(type) }, // 👈 key change
            );
            suggestions = r.items;
        },
        50,
    );
    const clean = <T extends Record<string, any>>(o: T): T =>
        Object.fromEntries(
            Object.entries(o).filter(([, v]) => v != null && v !== ""),
        ) as T;

    const normZip = (z?: string) => (z ? z.replace(/\s/g, "") : undefined);
    function buildFilterFor(type: LocationSearchType) {
        // prefer current form values, then ctx
        const street =
            (values.street || addrCtx.street || "").trim() || undefined;
        const city = (values.city || addrCtx.city || "").trim() || undefined;
        const zip = normZip(values.zip) ?? addrCtx.zip;
        const base = { country: "CZ" };

        switch (type) {
            case "full":
            case "street":
                // when searching street, narrow by city/zip if we know them
                return clean({ ...base, city, zip });

            case "number.full":
                // house number should be limited to a street — use street + (city|zip) for scope
                return clean({ ...base, street, city, zip });

            case "city":
                // city suggestions should respect typed/known zip or street if present
                return clean({ ...base, zip, street });

            case "zip":
                // zip suggestions should respect city/street if present
                return clean({ ...base, city, street });

            default:
                return base;
        }
    }

    function apiTypeFor(field: LocationSearchType): LocationSearchType {
        return field === "street" ? "full" : field; // <-- search FULL when street has focus
    }
    function onAddressFocus(type: LocationSearchType) {
        if (values.foxentryPaymentStatus === false) return;

        activeType = type;
        // optionally trigger first search if field already has enough chars
        queueSearchForActive();
    }

    function onAddressBlur() {
        setTimeout(() => {
            activeType = null;
            suggestions = [];
        }, 200);
    }

    function currentQueryFor(type: LocationSearchType | null): string {
        if (!type) return "";
        if (type === "street") return values.street;
        if (type === "number.full") return values.houseNumber;
        if (type === "city") return values.city;
        if (type === "zip") return values.zip;

        return "";
    }

    const hasContextFor = (type: LocationSearchType) => {
        const street = (values.street || addrCtx.street || "").trim();
        const city = (values.city || addrCtx.city || "").trim();
        const zip = (values.zip || addrCtx.zip || "").replace(/\s/g, "");

        if (type === "number.full") {
            return !!(addrCtx.streetId || (street && (city || zip)));
        }
        if (type === "city") return !!(street || zip);
        if (type === "zip") return !!(street || city);
        if (type === "street" || type === "full") return !!(city || zip);
        return false;
    };

    function minLenFor(type: LocationSearchType): number {
        // with context, we can suggest on focus
        if (hasContextFor(type)) return 0;

        // no context yet → require some typing
        if (type === "zip" || type === "number.full") return 1;
        if (type === "city") return 2;
        return 3; // street/full
    }

    function queueSearchForActive() {
        if (!activeType) return;
        if (values.foxentryPaymentStatus === false) return;

        const q = (currentQueryFor(activeType) || "").trim();

        // FOCUS with empty value → seed the request instead of sending empty value
        if (q.length === 0) {
            if (activeType === "number.full") {
                const street = (values.street || addrCtx.street || "").trim();
                if (!street) {
                    suggestions = [];
                    return;
                }

                // Seed with the street + space → "Bílkova "
                // Foxentry 'full' search will return addresses on that street (with numbers)
                searchForAddress("full", `${street} `);
                return;
            }

            if (activeType === "city") {
                const street = (values.street || addrCtx.street || "").trim();
                const zip = (values.zip || addrCtx.zip || "").replace(
                    /\s/g,
                    "",
                );
                if (street) {
                    searchForAddress("full", `${street} `);
                    return;
                }
                if (zip) {
                    searchForAddress("zip", zip);
                    return;
                }
                suggestions = [];
                return;
            }

            if (activeType === "zip") {
                const street = (values.street || addrCtx.street || "").trim();
                const city = (values.city || addrCtx.city || "").trim();
                if (street) {
                    searchForAddress("full", `${street} `);
                    return;
                }
                if (city) {
                    searchForAddress("city", city.slice(0, 3));
                    return;
                }
                suggestions = [];
                return;
            }
        }

        // Regular path: user has typed something → use normal mapping
        searchForAddress(apiTypeFor(activeType), q);
    }

    $effect(() => {
        if (!activeType) return;
        // track just the active field’s value
        const q = currentQueryFor(activeType);
        void q; // establish reactive read
        queueSearchForActive();
    });

    values.__addressFromSuggestion ??= false;

    $effect(() => {
        void values.street;
        values.__addressFromSuggestion = false;
    });
    $effect(() => {
        void values.houseNumber;
        values.__addressFromSuggestion = false;
    });
    $effect(() => {
        void values.city;
        values.__addressFromSuggestion = false;
    });
    $effect(() => {
        void values.zip;
        values.__addressFromSuggestion = false;
    });

    // apply the picked suggestion into your form
    function applySuggestion(s: FxLocation) {
        values.street = s.street ?? values.street;
        values.houseNumber = s.streetNumber ?? values.houseNumber;
        values.city = s.city ?? values.city;
        values.zip = s.postalCode ?? values.zip;
        values.address = s.full ?? s.streetWithNumber ?? values.address;

        addrCtx.street = s.street ?? addrCtx.street;
        addrCtx.city = s.city ?? addrCtx.city;
        addrCtx.zip = s.postalCode ?? addrCtx.zip;

        values.__addressFromSuggestion = true;
        suggestions = [];
        activeType = null;
    }

    $effect(() => {
        if (!companyActive) return;
        // track just the active field’s value
        const q = values.companyId;
        void q; // establish reactive read
        queueCompanySearchForActive();
    });
    /* Address search end */

    /* Company search */
    let companySuggestions = $state([]);
    let companyActive = $state(false);

    const searchForCompany = debounce(async (q: string) => {
        const r: any = await searchCompanies(q);

        companySuggestions = Array.isArray(r?.items)
            ? r.items
            : Array.isArray(r)
              ? r
              : [];
    }, 200);

    function onCompaniesFocus(type: LocationSearchType) {
        companyActive = true;
        queueCompanySearchForActive();
    }

    async function onCompaniesBlur() {
        if (values.foxentryPaymentStatus === false) return;
        setTimeout(async () => {
            companyActive = false;
            companySuggestions = [];
            const v = await validateCompany({
                name: values.companyName,
                country: "CZ",
                registrationNumber: values.companyId,
            });
            if (!v.isValid) {
                errors.companyId = [t("errors.fox.company")];
            } else {
                delete errors.companyId;
            }
            console.log(v);
        }, 120);
    }

    function queueCompanySearchForActive() {
        if (values.foxentryPaymentStatus === false) return;
        const q = values.companyId;
        if (q?.length === 0) {
            // ← truthy length clears & returns
            companySuggestions = [];
            return;
        }
        searchForCompany(q);
    }

    function applyCompanySuggestion(s: FxCompany) {
        values.companyName = s.name ?? values.companyName;
        values.companyId = s.registrationId ?? values.companyId;

        // close panel
        companySuggestions = [];
        companyActive = false;
    }
    /* End Foxentry Validation */
</script>

<div>
    {#snippet fileItem(f: File, b: Bucket)}
        <div tabindex="-1" class="w-file-upload-success mt-4 mr-2">
            <div class="w-file-upload-file">
                <div class="w-file-upload-file-name">
                    {f.name}
                </div>
                <button
                    aria-label="Remove file"
                    tabindex="0"
                    class="w-file-remove-link"
                    onclick={() => removeFileFrom(b, f)}
                >
                    <div class="w-icon-file-upload-remove"></div>
                </button>
            </div>
        </div>
    {/snippet}
    {#if form.state === "submitting"}
        <Loader></Loader>
    {:else}
        <div class="form">
            {#if currentStep === Steps.step1}
                <div in:fade class="form-step is-active">
                    <div class="box has-24-gap">
                        <div class="box has-8-gap">
                            <div class="form-steps">
                                <div class="step is-active">
                                    <div>{t("steps.1")}</div>
                                </div>
                                <div class="step">
                                    <div>{t("steps.2")}</div>
                                </div>
                                {#if !values.applyAsCompany}
                                    <div class="step">
                                        <div>{t("steps.3")}</div>
                                    </div>
                                {/if}
                            </div>

                            <h2 class="heading is-regular">
                                {t("step1.title")}
                            </h2>
                            <p class="body-text">{t("step1.lead")}</p>
                        </div>
                        <div class="box has-8-gap">
                            <div class="input-group-wrap">
                                <div class="input-wrap">
                                    <label for="firstName" class="field-label"
                                        >{t("labels.firstName")}</label
                                    ><input
                                        data-parsley-error-message={t(
                                            "errors.firstName",
                                        )}
                                        class="input-2 w-input"
                                        maxlength="256"
                                        name="firstName"
                                        data-name="firstName"
                                        placeholder={t("ph.firstName")}
                                        type="text"
                                        id="firstName"
                                        required
                                        bind:value={values.firstName}
                                        onblur={onBlurFirstName}
                                    />
                                    <Errors {errors} path="firstName"></Errors>
                                </div>
                                <div class="input-wrap">
                                    <label for="lastName" class="field-label"
                                        >{t("labels.lastName")}</label
                                    ><input
                                        data-parsley-error-message={t(
                                            "errors.lastName",
                                        )}
                                        class="input-2 w-input"
                                        maxlength="256"
                                        name="lastName"
                                        data-name="lastName"
                                        placeholder={t("ph.lastName")}
                                        type="text"
                                        id="lastName"
                                        required
                                        bind:value={values.lastName}
                                        onblur={onBlurLastName}
                                    />
                                    <Errors {errors} path="lastName"></Errors>
                                </div>
                            </div>
                            <div class="input-group-wrap">
                                <div class="input-wrap">
                                    <label for="phone" class="field-label"
                                        >{t("labels.phone")}</label
                                    ><input
                                        data-parsley-error-message={t(
                                            "errors.phone",
                                        )}
                                        class="input-2 w-input"
                                        maxlength="256"
                                        name="phone"
                                        data-name="phone"
                                        placeholder={t("ph.phone")}
                                        data-parsley-czphone=""
                                        type="text"
                                        id="phone"
                                        required
                                        bind:value={values.phone}
                                        onblur={onBlurPhone}
                                    />
                                    <div class="text-explain">
                                        {@html t("hints.czPhone")}
                                    </div>
                                    <Errors {errors} path="phone"></Errors>
                                </div>
                                <div class="input-wrap">
                                    <label for="email" class="field-label"
                                        >{t("labels.email")}</label
                                    ><input
                                        data-parsley-error-message={t(
                                            "errors.email",
                                        )}
                                        class="input-2 w-node-_5ce9e5d7-7108-1705-b1ac-8651e86feced-d6eb4364 w-input"
                                        maxlength="256"
                                        name="email"
                                        data-name="email"
                                        placeholder={t("ph.email")}
                                        type="email"
                                        id="email"
                                        required
                                        bind:value={values.email}
                                        onblur={onBlurEmail}
                                    />
                                    <div class="text-explain">
                                        {@html t("hints.useRealEmail")}
                                    </div>
                                    <Errors {errors} path="email"></Errors>
                                </div>
                            </div>
                            <div class="input-wrap">
                                <label for="field" class="field-label"
                                    >{t("labels.applyAsCompany")}</label
                                >
                                <div class="input-group-wrap">
                                    <label
                                        id="applyAsCompany-ano"
                                        class="registrationtype w-node-_7a7458f0-b249-90e6-4e96-a52d92089dde-d6eb4364 w-radio"
                                        class:is-checked={values.applyAsCompany ===
                                            true}
                                    >
                                        <div
                                            class="w-form-formradioinput w-form-formradioinput--inputType-custom radio-button w-radio-input"
                                            class:w--redirected-checked={values.applyAsCompany ===
                                                true}
                                        ></div>
                                        <input
                                            type="radio"
                                            name="applyAsCompany"
                                            id="apply-as-company-yes"
                                            data-name="applyAsCompany"
                                            style="opacity:0;position:absolute;z-index:-1"
                                            value={true}
                                            bind:group={values.applyAsCompany}
                                        /><span class="w-form-label"
                                            >{t("answer.yes")}</span
                                        >
                                    </label><label
                                        id="applyAsCompany-ne"
                                        class="registrationtype w-node-_7a7458f0-b249-90e6-4e96-a52d92089de2-d6eb4364 w-radio"
                                        class:is-checked={values.applyAsCompany ===
                                            false}
                                    >
                                        <div
                                            class="w-form-formradioinput w-form-formradioinput--inputType-custom radio-button w-radio-input"
                                            class:w--redirected-checked={values.applyAsCompany ===
                                                false}
                                        ></div>
                                        <input
                                            type="radio"
                                            name="applyAsCompany"
                                            id="NE"
                                            data-name="applyAsCompany"
                                            style="opacity:0;position:absolute;z-index:-1"
                                            value={false}
                                            bind:group={values.applyAsCompany}
                                        /><span class="w-form-label"
                                            >{t("answer.no")}</span
                                        >
                                    </label>
                                </div>
                                <Errors {errors} path="applyAsCompany"></Errors>
                            </div>
                            <div class="input-wrap">
                                <label for="field" class="field-label"
                                    >{t("labels.deliveryCompany")}</label
                                >
                                <div class="input-group-wrap">
                                    <label
                                        class="w-checkbox registrationtype"
                                        class:is-checked={values.deliveryCompany.includes(
                                            "Wolt",
                                        )}
                                    >
                                        <div
                                            class="w-checkbox-input w-checkbox-input--inputType-custom check-box"
                                            class:w--redirected-checked={values.deliveryCompany.includes(
                                                "Wolt",
                                            )}
                                        ></div>
                                        <input
                                            type="checkbox"
                                            id="checkbox"
                                            name="checkbox"
                                            data-name="Checkbox"
                                            style="opacity:0;position:absolute;z-index:-1"
                                            value="Wolt"
                                            disabled={PageHelper.getCompanyByDomain()[0] ===
                                                "Wolt"}
                                            bind:group={values.deliveryCompany}
                                        /><span class="w-form-label">Wolt</span>
                                    </label><label
                                        class="w-checkbox registrationtype"
                                        class:is-checked={values.deliveryCompany.includes(
                                            "Bolt",
                                        )}
                                    >
                                        <div
                                            class="w-checkbox-input w-checkbox-input--inputType-custom check-box"
                                            class:w--redirected-checked={values.deliveryCompany.includes(
                                                "Bolt",
                                            )}
                                        ></div>
                                        <input
                                            type="checkbox"
                                            id="checkbox"
                                            name="checkbox"
                                            data-name="Checkbox"
                                            style="opacity:0;position:absolute;z-index:-1"
                                            value="Bolt"
                                            disabled={PageHelper.getCompanyByDomain()[0] ===
                                                "Bolt"}
                                            bind:group={values.deliveryCompany}
                                        /><span class="w-form-label">Bolt</span>
                                    </label><label
                                        class="w-checkbox registrationtype"
                                        class:is-checked={values.deliveryCompany.includes(
                                            "Foodora",
                                        )}
                                    >
                                        <div
                                            class="w-checkbox-input w-checkbox-input--inputType-custom check-box"
                                            class:w--redirected-checked={values.deliveryCompany.includes(
                                                "Foodora",
                                            )}
                                        ></div>
                                        <input
                                            type="checkbox"
                                            id="checkbox"
                                            name="checkbox"
                                            data-name="Checkbox"
                                            style="opacity:0;position:absolute;z-index:-1"
                                            value="Foodora"
                                            disabled={PageHelper.getCompanyByDomain()[0] ===
                                                "Foodora"}
                                            bind:group={values.deliveryCompany}
                                        /><span class="w-form-label"
                                            >Foodora</span
                                        >
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-nav">
                        <div></div>
                        <button
                            class="button w-button"
                            disabled={disable}
                            onclick={() => PageHelper.next("step2")}
                            >{validating ? t("nav.validate") : stepNavText}
                        </button>
                    </div>
                </div>
            {/if}

            {#if currentStep === Steps.step2}
                <div in:fade class="form-step is-active">
                    <div class="box has-24-gap">
                        <div class="box has-8-gap">
                            <div class="form-steps">
                                <div class="step">
                                    <div>{t("steps.1")}</div>
                                </div>
                                <div class="step is-active">
                                    <div>{t("steps.2")}</div>
                                </div>
                                {#if !values.applyAsCompany}
                                    <div class="step">
                                        <div>{t("steps.3")}</div>
                                    </div>
                                {/if}
                            </div>

                            <h2 class="heading is-regular">
                                {t("step2.title")}
                            </h2>
                            <p class="body-text">{t("step2.lead")}</p>
                        </div>
                        <div class="box has-8-gap">
                            {#if values.applyAsCompany === true}
                                <div in:fade class="input-wrap relative">
                                    <label for="companyId" class="field-label"
                                        >{t("labels.companyId")}
                                    </label><input
                                        data-parsley-error-message="Zadejte platné rodné číslo."
                                        class="input-2 w-node-_8d497551-0a0a-68b8-5bf7-6f944b9fc4f1-d6eb4364 w-input"
                                        maxlength="256"
                                        name="companyId"
                                        data-name="companyId"
                                        placeholder={t("ph.companyId")}
                                        data-parsley-rc=""
                                        type="text"
                                        id="companyId"
                                        bind:value={values.companyId}
                                        onfocus={() => onCompaniesFocus()}
                                        onblur={onCompaniesBlur}
                                    />
                                    {#if companyActive && companySuggestions.length}
                                        <ul class="sugg" role="listbox">
                                            {#each companySuggestions as s}
                                                <li
                                                    role="option"
                                                    onmousedown={() =>
                                                        applyCompanySuggestion(
                                                            s,
                                                        )}
                                                >
                                                    {s.name}
                                                    {#if s.registrationId}
                                                        <small>
                                                            — {s.registrationId}</small
                                                        >
                                                    {/if}
                                                </li>
                                            {/each}
                                        </ul>
                                    {/if}
                                    {#if !companyActive}
                                        <div class="text-explain">
                                            {values.companyName}
                                            {values.companyId}
                                        </div>
                                    {/if}

                                    <Errors {errors} path="companyId"></Errors>
                                </div>
                            {/if}
                            {#if values.applyAsCompany === false}
                                <div class="input-wrap">
                                    <label
                                        for="St-tn-ob-anstv"
                                        class="field-label"
                                        ><strong
                                            >{t("labels.citizenship")}</strong
                                        ></label
                                    >
                                    <div class="w-embed">
                                        <select
                                            name="country"
                                            id="statni-obcanstvi"
                                            class="input-2"
                                            required
                                            autocomplete="off"
                                            bind:value={values.country}
                                        >
                                            <option value="" disabled
                                                >{t(
                                                    "select.placeholder.country",
                                                )}</option
                                            >
                                            {#await getCountries(locale) then countries}
                                                {#each countries as country}
                                                    {#each Object.entries(country) as [code, name]}
                                                        <option value={code}
                                                            >{name}</option
                                                        >
                                                    {/each}
                                                {/each}
                                            {/await}
                                        </select>
                                    </div>
                                    <Errors {errors} path="country"></Errors>
                                </div>
                            {/if}

                            {#if values.applyAsCompany === false && values.country === "CZ"}
                                <div in:fade class="input-wrap">
                                    <label for="nationalId" class="field-label"
                                        >{t("labels.nationalId")}
                                    </label><input
                                        data-parsley-error-message={t(
                                            "errors.nationalId",
                                        )}
                                        class="input-2 w-node-_8d497551-0a0a-68b8-5bf7-6f944b9fc4f1-d6eb4364 w-input"
                                        maxlength="256"
                                        name="nationalId"
                                        data-name="nationalId"
                                        placeholder={t("ph.nationalId")}
                                        data-parsley-rc=""
                                        type="text"
                                        id="nationalId"
                                        bind:value={values.nationalId}
                                    />
                                    <Errors {errors} path="nationalId"></Errors>
                                </div>
                            {/if}

                            {#if values.applyAsCompany === false && values.country.length > 0 && values.country !== "CZ"}
                                <div in:fade class="input-wrap">
                                    <label
                                        for="passportOrId"
                                        class="field-label"
                                        >{t("labels.passportOrId")}
                                    </label><input
                                        data-parsley-error-message={t(
                                            "errors.passportOrId",
                                        )}
                                        class="input-2 w-node-_8d497551-0a0a-68b8-5bf7-6f944b9fc4f1-d6eb4364 w-input"
                                        maxlength="256"
                                        name="passportOrId"
                                        data-name="passportOrId"
                                        placeholder={t("ph.passportOrId")}
                                        data-parsley-rc=""
                                        type="text"
                                        id="passportOrId"
                                        bind:value={values.passportOrId}
                                    />
                                    <Errors {errors} path="passportOrId"
                                    ></Errors>
                                </div>
                            {/if}

                            <div class="input-group-wrap">
                                <div class="input-wrap relative">
                                    <label for="street" class="field-label"
                                        >{t("labels.street")}</label
                                    ><input
                                        data-parsley-error-message={t(
                                            "errors.street",
                                        )}
                                        class="input-2 w-node-_48acfe53-5ca2-1118-0e8c-0cdd22174c3b-d6eb4364 w-input"
                                        maxlength="256"
                                        name="street"
                                        data-name="street"
                                        placeholder=""
                                        type="text"
                                        id="street"
                                        required
                                        bind:value={values.street}
                                        onfocus={() => onAddressFocus("street")}
                                        onblur={onAddressBlur}
                                    />
                                    <Errors {errors} path="street"></Errors>
                                    {#if activeType === "street" && suggestions.length}
                                        <ul class="sugg" role="listbox">
                                            {#each suggestions as s}
                                                <li
                                                    role="option"
                                                    onmousedown={() =>
                                                        applySuggestion(s)}
                                                >
                                                    {s.streetWithNumber ||
                                                        s.full}
                                                    {#if s.city || s.postalCode}
                                                        <small>
                                                            — {s.city}{s.postalCode
                                                                ? `, ${s.postalCode}`
                                                                : ""}</small
                                                        >
                                                    {/if}
                                                </li>
                                            {/each}
                                        </ul>
                                    {/if}
                                </div>
                                <div class="input-wrap relative">
                                    <label for="houseNumber" class="field-label"
                                        >{t("labels.houseNumber")}</label
                                    ><input
                                        data-parsley-error-message={t(
                                            "errors.houseNumber",
                                        )}
                                        class="input-2 w-node-_75182725-5b9f-8942-268c-668a41ccdfd7-d6eb4364 w-input"
                                        maxlength="256"
                                        name="houseNumber"
                                        data-name="Cislo popisne"
                                        placeholder=""
                                        type="tel"
                                        id="houseNumber"
                                        required
                                        bind:value={values.houseNumber}
                                        onfocus={() =>
                                            onAddressFocus("number.full")}
                                        onblur={onAddressBlur}
                                    />
                                    <Errors {errors} path="houseNumber"
                                    ></Errors>
                                    {#if activeType === "number.full" && suggestions.length}
                                        <ul class="sugg" role="listbox">
                                            {#each suggestions as s}
                                                <li
                                                    role="option"
                                                    onmousedown={() =>
                                                        applySuggestion(s)}
                                                >
                                                    {s.streetWithNumber ||
                                                        s.full}
                                                    {#if s.city || s.postalCode}
                                                        <small>
                                                            — {s.city}{s.postalCode
                                                                ? `, ${s.postalCode}`
                                                                : ""}</small
                                                        >
                                                    {/if}
                                                </li>
                                            {/each}
                                        </ul>
                                    {/if}
                                </div>
                            </div>
                            <div class="input-group-wrap">
                                <div class="input-wrap relative">
                                    <label for="city" class="field-label"
                                        >{t("labels.city")}</label
                                    ><input
                                        data-parsley-error-message={t(
                                            "errors.city",
                                        )}
                                        class="input-2 w-node-_9b7ed3bb-d228-0d66-fa58-ba76e3894472-d6eb4364 w-input"
                                        maxlength="256"
                                        name="city"
                                        data-name="city"
                                        placeholder=""
                                        type="text"
                                        id="city"
                                        required
                                        bind:value={values.city}
                                        onfocus={() => onAddressFocus("city")}
                                        onblur={onAddressBlur}
                                    />
                                    <Errors {errors} path="city"></Errors>
                                    {#if activeType === "city" && suggestions.length}
                                        <ul class="sugg" role="listbox">
                                            {#each suggestions as s}
                                                <li
                                                    role="option"
                                                    onmousedown={() =>
                                                        applySuggestion(s)}
                                                >
                                                    {s.streetWithNumber ||
                                                        s.full}
                                                    {#if s.city || s.postalCode}
                                                        <small>
                                                            — {s.city}{s.postalCode
                                                                ? `, ${s.postalCode}`
                                                                : ""}</small
                                                        >
                                                    {/if}
                                                </li>
                                            {/each}
                                        </ul>
                                    {/if}
                                </div>
                                <div class="input-wrap relative">
                                    <label for="zip" class="field-label"
                                        >{t("labels.zip")}</label
                                    ><input
                                        data-parsley-error-message={t(
                                            "errors.zip",
                                        )}
                                        class="input-2 w-node-_9b7ed3bb-d228-0d66-fa58-ba76e3894476-d6eb4364 w-input"
                                        maxlength="256"
                                        name="zip"
                                        data-name="zip"
                                        placeholder=""
                                        type="tel"
                                        id="zip"
                                        required
                                        bind:value={values.zip}
                                        onfocus={() => onAddressFocus("zip")}
                                        onblur={onAddressBlur}
                                    />
                                    <Errors {errors} path="zip"></Errors>
                                    {#if activeType === "zip" && suggestions.length}
                                        <ul class="sugg" role="listbox">
                                            {#each suggestions as s}
                                                <li
                                                    role="option"
                                                    onmousedown={() =>
                                                        applySuggestion(s)}
                                                >
                                                    {s.streetWithNumber ||
                                                        s.full}
                                                    {#if s.city || s.postalCode}
                                                        <small>
                                                            — {s.city}{s.postalCode
                                                                ? `, ${s.postalCode}`
                                                                : ""}</small
                                                        >
                                                    {/if}
                                                </li>
                                            {/each}
                                        </ul>
                                    {/if}
                                </div>
                            </div>
                            <div class="input-group-wrap">
                                <div class="input-group-wrap">
                                    <div class="prefix">
                                        <label
                                            for="bankPrefix"
                                            class="field-label"
                                            >{t("labels.bank.prefix")}</label
                                        >
                                        <div class="w-embed">
                                            <input
                                                type="text"
                                                id="bankPrefix"
                                                name="bankPrefix"
                                                class="input-2"
                                                maxlength="6"
                                                pattern="\d*"
                                                inputmode="numeric"
                                                placeholder={t(
                                                    "ph.bank.prefix",
                                                )}
                                                bind:value={values.bankPrefix}
                                            />
                                        </div>
                                        <Errors {errors} path="bankPrefix"
                                        ></Errors>
                                    </div>
                                    <div class="bank-number">
                                        <label
                                            for="bankNumber"
                                            class="field-label"
                                            >{t("labels.bank.number")}</label
                                        ><input
                                            data-parsley-error-message={t(
                                                "errors.bank.number",
                                            )}
                                            class="input-2 w-node-_5456f3ba-5ad3-f3cf-d87e-1e89755a0bb4-d6eb4364 w-input"
                                            maxlength="11"
                                            name="bankNumber"
                                            data-name="Číslo účtu"
                                            placeholder=""
                                            type="text"
                                            id="bankNumber"
                                            required
                                            bind:value={values.bankNumber}
                                        />
                                        <Errors {errors} path="bankNumber"
                                        ></Errors>
                                    </div>
                                    <div class="bank-code">
                                        <label
                                            for="bankCode"
                                            class="field-label"
                                            >{t("labels.bank.code")}</label
                                        >
                                        <div class="w-embed">
                                            <select
                                                name="bankCode"
                                                id="bankCode"
                                                class="input-2"
                                                required
                                                bind:value={values.bankCode}
                                            >
                                                <option value="" disabled
                                                    >{t(
                                                        "select.placeholder.bank",
                                                    )}</option
                                                >
                                                <option value="0100"
                                                    >0100 – Komerční banka</option
                                                >
                                                <option value="0300"
                                                    >0300 – ČSOB</option
                                                >
                                                <option value="0600"
                                                    >0600 – MONETA</option
                                                >
                                                <option value="0800"
                                                    >0800 – Česká spořitelna</option
                                                >
                                                <option value="2010"
                                                    >2010 – Fio banka</option
                                                >
                                                <option value="3030"
                                                    >3030 – Air Bank</option
                                                >
                                                <option value="5500"
                                                    >5500 – Raiffeisenbank</option
                                                >
                                                <option value="6210"
                                                    >6210 – mBank</option
                                                >
                                                <option value="2700"
                                                    >2700 – UniCredit Bank</option
                                                >
                                                <option value="3050"
                                                    >3050 – Hello bank</option
                                                >
                                                <option value="3500"
                                                    >3500 – ING Bank</option
                                                >
                                                <option value="6800"
                                                    >6800 – Sberbank</option
                                                >
                                                <option value="2250"
                                                    >2250 – Banka Creditas</option
                                                >
                                                <option value="2070"
                                                    >2070 – Trinity Bank</option
                                                >
                                                <option value="4000"
                                                    >4000 – Expobank</option
                                                >
                                                <option value="8040"
                                                    >8040 – Oberbank</option
                                                >
                                                <option value="2600"
                                                    >2600 – Citibank</option
                                                >
                                                <option value="2020"
                                                    >2020 – MUFG Bank</option
                                                >
                                                <option value="2100"
                                                    >2100 – Hypoteční banka</option
                                                >
                                                <option value="2060"
                                                    >2060 – Citfin</option
                                                >
                                                <option value="2200"
                                                    >2200 – Peněžní dům</option
                                                >
                                                <option value="2220"
                                                    >2220 – Artesa</option
                                                >
                                                <option value="2260"
                                                    >2260 – NEY</option
                                                >
                                                <option value="3060"
                                                    >3060 – PKO BP</option
                                                >
                                                <option value="4300"
                                                    >4300 – Národní rozvojová
                                                    banka</option
                                                >
                                                <option value="5800"
                                                    >5800 – J&T BANKA</option
                                                >
                                                <option value="6000"
                                                    >6000 – PPF banka</option
                                                >
                                                <option value="6200"
                                                    >6200 – COMMERZBANK</option
                                                >
                                                <option value="6300"
                                                    >6300 – BNP Paribas</option
                                                >
                                                <option value="6700"
                                                    >6700 – Všeobecná úvěrová
                                                    banka</option
                                                >
                                                <option value="7910"
                                                    >7910 – Deutsche Bank</option
                                                >
                                                <option value="7950"
                                                    >7950 – Raiffeisen stavební
                                                    spořitelna</option
                                                >
                                                <option value="7960"
                                                    >7960 – ČSOB Stavební
                                                    spořitelna</option
                                                >
                                                <option value="7970"
                                                    >7970 – MONETA Stavební
                                                    Spořitelna</option
                                                >
                                                <option value="7990"
                                                    >7990 – Modrá pyramida
                                                    stavební spořitelna</option
                                                >
                                                <option value="8030"
                                                    >8030 – Volksbank
                                                    Raiffeisenbank Nordoberpfalz</option
                                                >
                                                <option value="8060"
                                                    >8060 – Stavební spořitelna
                                                    České spořitelny</option
                                                >
                                                <option value="8090"
                                                    >8090 – Česká exportní banka</option
                                                >
                                                <option value="8150"
                                                    >8150 – HSBC Continental
                                                    Europe</option
                                                >
                                                <option value="6363"
                                                    >6363 – Partners banka</option
                                                >
                                            </select>
                                        </div>
                                        <Errors {errors} path="bankCode"
                                        ></Errors>
                                    </div>
                                </div>
                            </div>

                            <div class="input-group-wrap">
                                {#if values.country === "CZ"}
                                    <div class="upload">
                                        <label for="Ulice" class="field-label"
                                            >{@html t(
                                                "labels.doc.nationalId",
                                            )}</label
                                        >
                                        <div id="file-1" class="w-file-upload">
                                            <div
                                                class="default-state-2 w-file-upload-default"
                                            >
                                                <input
                                                    class="w-file-upload-input"
                                                    accept=""
                                                    name="filesNationalId"
                                                    data-name="filesNationalId"
                                                    aria-hidden="true"
                                                    type="file"
                                                    id="filesNationalId"
                                                    tabindex="-1"
                                                    required
                                                    multiple
                                                    onchange={(e) => {
                                                        const files = (
                                                            e.currentTarget as HTMLInputElement
                                                        ).files;
                                                        if (files)
                                                            appendFilesTo(
                                                                "nationalId",
                                                                files,
                                                            );
                                                    }}
                                                    bind:this={
                                                        filesNationalIdInput
                                                    }
                                                />
                                                <button
                                                    class="upload-button"
                                                    onclick={() =>
                                                        filesNationalIdInput?.click()}
                                                >
                                                    <label
                                                        for="File-1-2"
                                                        class="w-file-upload-label"
                                                    >
                                                        <div
                                                            class="w-icon-file-upload-icon"
                                                        ></div>
                                                        <div
                                                            class="w-inline-block"
                                                        >
                                                            {t("upload.button")}
                                                        </div>
                                                    </label></button
                                                >

                                                <div class="w-file-upload-info">
                                                    {t("upload.max")}
                                                </div>
                                            </div>

                                            {#if filesNationalId && filesNationalId?.length > 0}
                                                <div>
                                                    {#each filesNationalId as file}
                                                        {@render fileItem(
                                                            file,
                                                            "nationalId",
                                                        )}
                                                    {/each}
                                                </div>
                                            {/if}

                                            <div
                                                tabindex="-1"
                                                class="w-file-upload-error w-hidden"
                                            >
                                                <div
                                                    class="w-file-upload-error-msg"
                                                    data-w-size-error="Upload failed. Max size for files is 10 MB."
                                                    data-w-type-error="Upload failed. Invalid file type."
                                                    data-w-generic-error="Upload failed. Something went wrong. Please retry."
                                                >
                                                    Upload failed. Max size for
                                                    files is 10 MB.
                                                </div>
                                            </div>
                                        </div>
                                        <div class="text-explain">
                                            {@html t("hints.doc.nationalId")}
                                        </div>
                                        <Errors {errors} path="filesNationalId"
                                        ></Errors>
                                    </div>
                                {/if}

                                {#if values.country.length > 0 && isEu(values.country) && values.country !== "CZ"}
                                    <div class="upload">
                                        <label for="Ulice" class="field-label"
                                            >{@html t(
                                                "labels.doc.euPassport",
                                            )}</label
                                        >
                                        <div id="file-2" class="w-file-upload">
                                            <div
                                                class="default-state-2 w-file-upload-default"
                                            >
                                                <input
                                                    class="w-file-upload-input"
                                                    accept=""
                                                    name="filesEuPassport"
                                                    data-name="filesEuPassport"
                                                    aria-hidden="true"
                                                    type="file"
                                                    id="filesEuPassport"
                                                    tabindex="-1"
                                                    required
                                                    multiple
                                                    onchange={(e) => {
                                                        const files = (
                                                            e.currentTarget as HTMLInputElement
                                                        ).files;
                                                        if (files)
                                                            appendFilesTo(
                                                                "euPassport",
                                                                files,
                                                            );
                                                    }}
                                                    bind:this={
                                                        filesEuPassportInput
                                                    }
                                                />
                                                <button
                                                    class="upload-button"
                                                    onclick={() =>
                                                        filesEuPassportInput?.click()}
                                                >
                                                    <label
                                                        for="File-1-2"
                                                        class="w-file-upload-label"
                                                    >
                                                        <div
                                                            class="w-icon-file-upload-icon"
                                                        ></div>
                                                        <div
                                                            class="w-inline-block"
                                                        >
                                                            {t("upload.button")}
                                                        </div>
                                                    </label></button
                                                >

                                                <div class="w-file-upload-info">
                                                    {t("upload.max")}
                                                </div>
                                            </div>

                                            {#if filesEuPassport && filesEuPassport?.length > 0}
                                                <div>
                                                    {#each filesEuPassport as file}
                                                        {@render fileItem(
                                                            file,
                                                            "euPassport",
                                                        )}
                                                    {/each}
                                                </div>
                                            {/if}

                                            <div
                                                tabindex="-1"
                                                class="w-file-upload-error w-hidden"
                                            >
                                                <div
                                                    class="w-file-upload-error-msg"
                                                    data-w-size-error="Upload failed. Max size for files is 10 MB."
                                                    data-w-type-error="Upload failed. Invalid file type."
                                                    data-w-generic-error="Upload failed. Something went wrong. Please retry."
                                                >
                                                    Upload failed. Max size for
                                                    files is 10 MB.
                                                </div>
                                            </div>
                                        </div>
                                        <div class="text-explain">
                                            {@html t("hints.doc.euPassport")}
                                        </div>
                                        <Errors {errors} path="filesEuPassport"
                                        ></Errors>
                                    </div>
                                {/if}

                                {#if values.country.length > 0 && !isEu(values.country)}
                                    <div class="upload">
                                        <label for="Ulice" class="field-label"
                                            >{@html t(
                                                "labels.doc.nonEu",
                                            )}</label
                                        >
                                        <div id="file-2" class="w-file-upload">
                                            <div
                                                class="default-state-2 w-file-upload-default"
                                            >
                                                <input
                                                    class="w-file-upload-input"
                                                    accept=""
                                                    name="filesNonEu"
                                                    data-name="filesNonEu"
                                                    aria-hidden="true"
                                                    type="file"
                                                    id="filesNonEu"
                                                    tabindex="-1"
                                                    required
                                                    multiple
                                                    onchange={(e) => {
                                                        const files = (
                                                            e.currentTarget as HTMLInputElement
                                                        ).files;
                                                        if (files)
                                                            appendFilesTo(
                                                                "nonEu",
                                                                files,
                                                            );
                                                    }}
                                                    bind:this={filesNonEuInput}
                                                />
                                                <button
                                                    class="upload-button"
                                                    onclick={() =>
                                                        filesNonEuInput?.click()}
                                                >
                                                    <label
                                                        for="File-1-2"
                                                        class="w-file-upload-label"
                                                    >
                                                        <div
                                                            class="w-icon-file-upload-icon"
                                                        ></div>
                                                        <div
                                                            class="w-inline-block"
                                                        >
                                                            {t("upload.button")}
                                                        </div>
                                                    </label></button
                                                >

                                                <div class="w-file-upload-info">
                                                    {t("upload.max")}
                                                </div>
                                            </div>

                                            {#if filesNonEu && filesNonEu?.length > 0}
                                                <div>
                                                    {#each filesNonEu as file}
                                                        {@render fileItem(
                                                            file,
                                                            "nonEu",
                                                        )}
                                                    {/each}
                                                </div>
                                            {/if}

                                            <div
                                                tabindex="-1"
                                                class="w-file-upload-error w-hidden"
                                            >
                                                <div
                                                    class="w-file-upload-error-msg"
                                                    data-w-size-error="Upload failed. Max size for files is 10 MB."
                                                    data-w-type-error="Upload failed. Invalid file type."
                                                    data-w-generic-error="Upload failed. Something went wrong. Please retry."
                                                >
                                                    Upload failed. Max size for
                                                    files is 10 MB.
                                                </div>
                                            </div>
                                        </div>
                                        <div class="text-explain">
                                            {@html t("hints.doc.nonEu")}
                                        </div>
                                        <Errors {errors} path="filesNonEu"
                                        ></Errors>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                    <div class="form-nav">
                        <button
                            class="button is-ghost w-button"
                            disabled={disable}
                            onclick={() => PageHelper.prev("step1")}
                            >{t("nav.prev")}</button
                        >
                        {#if values.applyAsCompany}
                            <button
                                class="button w-button"
                                onclick={PageHelper.submit}
                                disabled={disable}
                                >{validating
                                    ? t("nav.validate")
                                    : t("nav.submit")}</button
                            >
                        {:else}
                            <button
                                class="button w-button"
                                onclick={() => PageHelper.next("step3")}
                                disabled={disable}
                                >{validating
                                    ? t("nav.validate")
                                    : stepNavText}</button
                            >
                        {/if}
                    </div>
                </div>
            {/if}

            {#if currentStep === Steps.step3}
                <div in:fade class="form-step is-active">
                    <div class="box has-24-gap">
                        <div class="box has-8-gap">
                            <div class="form-steps">
                                <div class="step">
                                    <div>{t("steps.1")}</div>
                                </div>
                                <div class="step">
                                    <div>{t("steps.2")}</div>
                                </div>
                                <div class="step is-active">
                                    <div>{t("steps.3")}</div>
                                </div>
                            </div>
                            <h2 class="heading is-regular">
                                {t("step3.title")}
                            </h2>
                            <p class="body-text">{t("step3.lead")}</p>
                        </div>
                        <div class="box has-8-gap">
                            <div class="input-wrap">
                                <label for="deliveryCity" class="field-label"
                                    >{t("labels.cityToDeliver")}</label
                                >
                                <select
                                    id="deliveryCity"
                                    name="deliveryCity"
                                    data-name="Misto rozvazeni"
                                    class="input-2 w-select"
                                    bind:value={values.deliveryCity}
                                >
                                    <option value="" disabled
                                        >{t("select.placeholder.city")}</option
                                    >
                                    {#await getCities(locale, values.deliveryCompany) then cities}
                                        {#each [...cities].sort( (a, b) => a.localeCompare(b), ) as city}
                                            <option value={city}>{city}</option>
                                        {/each}
                                    {/await}
                                </select>
                            </div>
                            <div class="input-wrap">
                                <label for="field" class="field-label"
                                    >{t("labels.transport")}</label
                                >
                                <div class="input-wrap">
                                    <div class="w-embed">
                                        <select
                                            name="transport"
                                            class="input-2"
                                            bind:value={values.transport}
                                        >
                                            <option value="" disabled
                                                >{t(
                                                    "select.placeholder.transport",
                                                )}</option
                                            >
                                            <option value="auto"
                                                >{t(
                                                    "options.transport.car",
                                                )}</option
                                            >
                                            <option value="kolo"
                                                >{t(
                                                    "options.transport.bike",
                                                )}</option
                                            >
                                            <option value="motorka"
                                                >{t(
                                                    "options.transport.motorcycle",
                                                )}</option
                                            >
                                            <option value="el-kolobezka"
                                                >{t(
                                                    "options.transport.electricScooter",
                                                )}</option
                                            >
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {#if values.transport === "auto"}
                                <div class="input-group-wrap">
                                    <div class="upload">
                                        <label
                                            for="DriversLicense"
                                            class="field-label"
                                            >{@html t(
                                                "labels.doc.driversLicense",
                                            )}</label
                                        >
                                        <div id="file-1" class="w-file-upload">
                                            <div
                                                class="default-state-2 w-file-upload-default"
                                            >
                                                <input
                                                    class="w-file-upload-input"
                                                    accept=""
                                                    name="filesDriversLicense"
                                                    data-name="filesdriversLicense"
                                                    aria-hidden="true"
                                                    type="file"
                                                    id="filesDriversLicense"
                                                    tabindex="-1"
                                                    multiple
                                                    onchange={(e) => {
                                                        console.log(e);
                                                        const files = (
                                                            e.currentTarget as HTMLInputElement
                                                        ).files;
                                                        if (files)
                                                            appendFilesTo(
                                                                "driversLicense",
                                                                files,
                                                            );
                                                        console.log(files);
                                                    }}
                                                    bind:this={
                                                        filesDriversLicenseInput
                                                    }
                                                />
                                                <button
                                                    class="upload-button"
                                                    onclick={() =>
                                                        filesDriversLicenseInput?.click()}
                                                >
                                                    <label
                                                        for="File-1-2"
                                                        class="w-file-upload-label"
                                                    >
                                                        <div
                                                            class="w-icon-file-upload-icon"
                                                        ></div>
                                                        <div
                                                            class="w-inline-block"
                                                        >
                                                            {t("upload.button")}
                                                        </div>
                                                    </label></button
                                                >

                                                <div class="w-file-upload-info">
                                                    {t("upload.max")}
                                                </div>
                                            </div>

                                            {#if filesDriversLicense && filesDriversLicense?.length > 0}
                                                <div>
                                                    {#each filesDriversLicense as file}
                                                        {@render fileItem(
                                                            file,
                                                            "driversLicense",
                                                        )}
                                                    {/each}
                                                </div>
                                            {/if}

                                            <div
                                                tabindex="-1"
                                                class="w-file-upload-error w-hidden"
                                            >
                                                <div
                                                    class="w-file-upload-error-msg"
                                                    data-w-size-error="Upload failed. Max size for files is 10 MB."
                                                    data-w-type-error="Upload failed. Invalid file type."
                                                    data-w-generic-error="Upload failed. Something went wrong. Please retry."
                                                >
                                                    Upload failed. Max size for
                                                    files is 10 MB.
                                                </div>
                                            </div>
                                        </div>
                                        <!--  <div class="text-explain">
                    {@html t("hints.doc.driversLicense")}
                  </div> -->
                                        <Errors
                                            {errors}
                                            path="filesDriversLicense"
                                        ></Errors>
                                    </div>
                                </div>
                            {/if}
                            <div class="input-group-wrap">
                                <div class="input-wrap">
                                    <label
                                        for="St-tn-ob-anstv"
                                        class="field-label"
                                        ><strong>{t("labels.gender")}</strong
                                        ></label
                                    >

                                    <select
                                        name="gender"
                                        id="gender"
                                        class="input-2"
                                        autocomplete="off"
                                        bind:value={values.gender}
                                    >
                                        <option value="" disabled
                                            >{t(
                                                "select.placeholder.gender",
                                            )}</option
                                        >
                                        <option value="muž"
                                            >{t("options.gender.male")}</option
                                        >
                                        <option value="žena"
                                            >{t(
                                                "options.gender.female",
                                            )}</option
                                        >
                                    </select>
                                </div>
                                <div class="input-wrap">
                                    <label for="birthDate" class="field-label"
                                        >{t("labels.birthDate")}</label
                                    ><input
                                        class="input-2 w-input"
                                        maxlength="256"
                                        name="birthDate"
                                        data-name="birthDate"
                                        type="date"
                                        id="birthDate"
                                        bind:value={values.birthDate}
                                    />
                                </div>
                                {#if values.country.length > 0 && !isEu(values.country)}
                                    <div class="input-wrap">
                                        <label
                                            for="passportExpiryDate"
                                            class="field-label"
                                            >{t(
                                                "labels.passportExpiryDate",
                                            )}</label
                                        ><input
                                            class="input-2 w-input"
                                            maxlength="256"
                                            name="passportExpiryDate"
                                            data-name="passportExpiryDate"
                                            type="date"
                                            id="passportExpiryDate"
                                            bind:value={
                                                values.passportExpiryDate
                                            }
                                        />
                                    </div>
                                {/if}
                            </div>
                            {#if values.country.length > 0 && !isEu(values.country)}
                                <div class="input-wrap">
                                    <label
                                        for="placeOfBirth"
                                        class="field-label"
                                        >{t("labels.placeOfBirth")}</label
                                    ><input
                                        class="input-2 w-input"
                                        name="placeOfBirth"
                                        data-name="placeOfBirth"
                                        type="text"
                                        id="placeOfBirth"
                                        bind:value={values.placeOfBirth}
                                    />
                                </div>
                                <div class="input-wrap">
                                    <label
                                        for="permanentResidence"
                                        class="field-label"
                                        >{t("labels.permanentResidence")}</label
                                    ><input
                                        class="input-2 w-input"
                                        name="permanentResidence"
                                        data-name="permanentResidence"
                                        type="text"
                                        id="permanentResidence"
                                        bind:value={values.permanentResidence}
                                    />
                                </div>
                            {/if}
                            <div class="input-wrap">
                                <label for="Pojistovna" class="field-label"
                                    >{t("labels.insurance")}</label
                                >
                                <div class="w-embed">
                                    <select
                                        name="insurance"
                                        class="input-2"
                                        bind:value={values.insurance}
                                    >
                                        <option value="" disabled
                                            >{t(
                                                "select.placeholder.insurance",
                                            )}</option
                                        >
                                        {#await getInsuranceOptions(locale) then insuranceOptions}
                                            {#each Object.entries(insuranceOptions) as [key, value]}
                                                <option value={key}
                                                    >{value}</option
                                                >
                                            {/each}
                                        {/await}
                                    </select>
                                </div>
                            </div>
                            <div class="input-wrap">
                                <label for="field" class="field-label"
                                    >{t("labels.pinkStatement")}</label
                                >
                                <div class="input-group-wrap">
                                    <label
                                        id="ruzove-prohlaseni-ano"
                                        class="registrationtype w-node-_7a7458f0-b249-90e6-4e96-a52d92089dde-d6eb4364 w-radio"
                                        class:is-checked={values.pinkStatement ===
                                            true}
                                    >
                                        <div
                                            class="w-form-formradioinput w-form-formradioinput--inputType-custom radio-button w-radio-input"
                                            class:w--redirected-checked={values.pinkStatement ===
                                                true}
                                        ></div>
                                        <input
                                            type="radio"
                                            name="pinkStatement"
                                            id="ANO-2"
                                            data-name="pinkStatement"
                                            style="opacity:0;position:absolute;z-index:-1"
                                            value={true}
                                            bind:group={values.pinkStatement}
                                        /><span class="w-form-label"
                                            >{t("answer.yes")}</span
                                        >
                                    </label><label
                                        id="pinkStatement-ne"
                                        class="registrationtype w-node-_7a7458f0-b249-90e6-4e96-a52d92089de2-d6eb4364 w-radio"
                                        class:is-checked={values.pinkStatement ===
                                            false}
                                    >
                                        <div
                                            class="w-form-formradioinput w-form-formradioinput--inputType-custom radio-button w-radio-input"
                                            class:w--redirected-checked={values.pinkStatement ===
                                                false}
                                        ></div>
                                        <input
                                            type="radio"
                                            name="pinkStatement"
                                            id="NE"
                                            data-name="pinkStatement"
                                            style="opacity:0;position:absolute;z-index:-1"
                                            value={false}
                                            bind:group={values.pinkStatement}
                                        /><span class="w-form-label"
                                            >{t("answer.no")}</span
                                        >
                                    </label>
                                </div>
                                <div class="text-explain">
                                    {@html t("hints.pinkstatement")}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-nav">
                        <button
                            class="button is-ghost w-button"
                            disabled={disable}
                            onclick={() => PageHelper.prev("step2")}
                            >{t("nav.prev")}</button
                        >
                        <button
                            class="button w-button"
                            onclick={PageHelper.submit}
                            disabled={disable}
                            >{validating
                                ? t("nav.validate")
                                : submitting
                                  ? t("nav.wait")
                                  : t("nav.submit")}</button
                        >
                    </div>
                </div>
            {/if}
        </div>
    {/if}

    {#if form.state === "success"}
        <div class="success-message-5">
            <div>{t("result.success")}</div>
        </div>
    {/if}

    {#if form.state === "fail"}
        <div class="">
            <div>{t("result.fail")}</div>
        </div>
    {/if}
</div>
