import { isEu } from "../i18n/euCountriesFilter";

// 1) Steps → field ids
// 1) Steps → field ids
export const steps: Record<
  "step1" | "step2" | "step3" | "step4" | "phase2" | "alwaysInclude",
  string[]
> = {
  step1: ["firstName", "lastName", "phone", "email"],
  step2: ["street", "houseNumber", "city", "zip", "deliveryCity"],
  step3: ["country", "nationalId", "passportOrId", "birthDate"],
  step4: ["bankPrefix", "bankNumber", "bankCode", "insurance", "pinkStatement"],
  phase2: [
    "permanentResidenceCountry",
    "permanentResidenceStreet",
    "permanentResidenceStreetNumber",
    "permanentResidenceCity",
    "filesNationalId",
    "filesEuPassport",
    "filesNonEu",
    "filesDriversLicense",
    "transport",
    "gender",
    "placeOfBirth",
    "documentExpiryDate",
    "documentNumber",
    "documentIssuingCountry",
  ],
  alwaysInclude: [
    "utm_source",
    "utm_campaign",
    "utm_medium",
    "utm_id",
    "submitSource",
    "foxentryPaymentStatus",
    "step1Completed",
    "step2Completed",
    "step3Completed",
    "sessionId",
    "formStart",
    "firstEndpointSubmissionId",
    "firstEndpointSubmissionTime",
    "finalEndpointSubmissionId",
    "finalEndpointSubmissionTime",
    "deliveryCompany",
  ],
};

// 2) Visibility/requiredness per field
export const fields: Record<
  string,
  {
    visibleWhen: (data: any) => boolean;
    requiredWhen: (data: any) => boolean;
  }
> = {
  // Phase 1 - Step 1 (Personal Data)
  firstName: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  lastName: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  phone: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  email: { visibleWhen: (d) => true, requiredWhen: (d) => true },

  // Phase 1 - Step 2 (Address)
  street: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  houseNumber: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  city: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  zip: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  deliveryCity: { visibleWhen: (d) => true, requiredWhen: (d) => true },

  // Phase 1 - Step 3 (Citizenship)
  country: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  nationalId: {
    visibleWhen: (d) => d.country === "CZ",
    requiredWhen: (d) => d.country === "CZ",
  },
  passportOrId: {
    visibleWhen: (d) => d.country && d.country !== "CZ",
    requiredWhen: (d) => d.country && d.country !== "CZ",
  },
  birthDate: {
    visibleWhen: (d) => d.country && d.country !== "CZ",
    requiredWhen: (d) => d.country && d.country !== "CZ",
  },

  // Phase 1 - Step 4 (Bank & Insurance)
  bankPrefix: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  bankNumber: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  bankCode: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  insurance: { visibleWhen: (d) => true, requiredWhen: (d) => false },
  pinkStatement: { visibleWhen: (d) => true, requiredWhen: (d) => false },

  // Phase 2
  filesNationalId: {
    visibleWhen: (d) => d.country === "CZ",
    requiredWhen: (d) => d.country === "CZ",
  },
  filesEuPassport: {
    visibleWhen: (d) => d.country && isEu(d.country) && d.country !== "CZ",
    requiredWhen: (d) => d.country && isEu(d.country) && d.country !== "CZ",
  },
  filesNonEu: {
    visibleWhen: (d) => d.country && !isEu(d.country),
    requiredWhen: (d) => d.country && !isEu(d.country),
  },
  filesDriversLicense: {
    visibleWhen: (d) => d.transport === "auto",
    requiredWhen: (d) => d.transport === "auto",
  },
  transport: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  gender: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  placeOfBirth: {
    visibleWhen: (d) => d.country !== "CZ",
    requiredWhen: (d) => d.country !== "CZ",
  },
  documentExpiryDate: {
    visibleWhen: (d) => true,
    requiredWhen: (d) => true,
  },
  permanentResidenceStreet: {
    visibleWhen: (d) => d.country !== "CZ",
    requiredWhen: (d) => d.country !== "CZ",
  },
  permanentResidenceStreetNumber: {
    visibleWhen: (d) => d.country !== "CZ",
    requiredWhen: (d) => d.country !== "CZ",
  },
  permanentResidenceCity: {
    visibleWhen: (d) => d.country !== "CZ",
    requiredWhen: (d) => d.country !== "CZ",
  },
  permanentResidenceCountry: {
    visibleWhen: (d) => d.country !== "CZ",
    requiredWhen: (d) => d.country !== "CZ",
  },
  documentNumber: {
    visibleWhen: (d) => true,
    requiredWhen: (d) => true,
  },
  documentIssuingCountry: {
    visibleWhen: (d) => true,
    requiredWhen: (d) => true,
  },
  // Archived / Unused
  applyAsCompany: { visibleWhen: (d) => false, requiredWhen: (d) => false },
  companyId: { visibleWhen: (d) => false, requiredWhen: (d) => false },
};
