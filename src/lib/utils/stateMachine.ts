import { isEu } from "../i18n/euCountriesFilter";

// 1) Steps → field ids
// 1) Steps → field ids
export const steps: Record<
  | "step1"
  | "step2"
  | "step3"
  | "step4"
  | "phase2Step1"
  | "phase2Step2"
  | "phase2Step3"
  | "alwaysInclude",
  string[]
> = {
  step1: ["firstName", "lastName", "birthLastName", "phone", "email"],
  step2: ["street", "houseNumber", "city", "zip", "deliveryCity"],
  step3: ["country", "communicationPassword", "birthDate", "nationalId"],
  step4: [
    "bankPrefix",
    "bankNumber",
    "bankCode",
    "insurance",
    "pinkStatement",
    "execution",
  ],
  phase2Step1: [
    "permanentResidenceCountry",
    "permanentResidenceStreet",
    "permanentResidenceStreetNumber",
    "permanentResidenceCity",
    "transport",
    "gender",
    "placeOfBirth",
    "filesDriversLicense",
    "country",
  ],
  phase2Step2: [
    "documentExpiryDate",
    "documentType",
    "documentNumber",
    "nationalId",
    "documentIssuingCountry",
    "filesNationalId",
    "filesEuPassport",
    "filesNonEu",
  ],
  phase2Step3: [
    "residenceDocumentType",
    "residenceDocumentNumber",
    "residenceDocumentExpiryDate",
    "residenceDocumentIssuingCountry",
    "visaCode",
    "filesEuResidence",
    "filesNonEuResidence",
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
  birthLastName: { visibleWhen: (d) => true, requiredWhen: (d) => false },
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
  communicationPassword: {
    visibleWhen: (d) => true,
    requiredWhen: (d) => true,
  },
  /* passportOrId: {
    visibleWhen: (d) => d.country && d.country !== "CZ",
    requiredWhen: (d) => d.country && d.country !== "CZ",
  }, */
  birthDate: {
    visibleWhen: (d) => !!d.country,
    requiredWhen: (d) => !!d.country,
  },

  // Phase 1 - Step 4 (Bank & Insurance)
  bankPrefix: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  bankNumber: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  bankCode: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  insurance: { visibleWhen: (d) => true, requiredWhen: (d) => false },
  pinkStatement: { visibleWhen: (d) => true, requiredWhen: (d) => true },
  execution: { visibleWhen: (d) => true, requiredWhen: (d) => true },

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
    visibleWhen: (d) => !!(d.country && !isEu(d.country) && d.country !== "CZ"),
    requiredWhen: (d) =>
      !!(d.country && !isEu(d.country) && d.country !== "CZ"),
  },
  filesEuResidence: {
    visibleWhen: (d) => !!(d.country && isEu(d.country) && d.country !== "CZ"),
    requiredWhen: (d) => !!(d.country && isEu(d.country) && d.country !== "CZ"),
  },
  filesNonEuResidence: {
    visibleWhen: (d) => !!(d.country && !isEu(d.country) && d.country !== "CZ"),
    requiredWhen: (d) =>
      !!(d.country && !isEu(d.country) && d.country !== "CZ"),
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
  documentType: {
    visibleWhen: (d) => true,
    requiredWhen: (d) => true,
  },
  documentNumber: {
    visibleWhen: (d) => d.country !== "CZ",
    requiredWhen: (d) => d.country !== "CZ",
  },
  documentIssuingCountry: {
    visibleWhen: (d) => true,
    requiredWhen: (d) => true,
  },
  residenceDocumentType: {
    visibleWhen: (d) => d.country && d.country !== "CZ",
    requiredWhen: (d) => d.country && d.country !== "CZ",
  },
  residenceDocumentNumber: {
    visibleWhen: (d) => d.country && d.country !== "CZ",
    requiredWhen: (d) => d.country && d.country !== "CZ",
  },
  residenceDocumentExpiryDate: {
    visibleWhen: (d) => d.country && d.country !== "CZ",
    requiredWhen: (d) => d.country && d.country !== "CZ",
  },
  residenceDocumentIssuingCountry: {
    visibleWhen: (d) => d.country && d.country !== "CZ",
    requiredWhen: (d) => d.country && d.country !== "CZ",
  },
  visaCode: {
    visibleWhen: (d) =>
      d.residenceDocumentType === "Krátkodobé vízum" ||
      d.residenceDocumentType === "Dlouhodobé vízum",
    requiredWhen: (d) =>
      d.residenceDocumentType === "Krátkodobé vízum" ||
      d.residenceDocumentType === "Dlouhodobé vízum",
  },
  // Archived / Unused
  applyAsCompany: { visibleWhen: (d) => false, requiredWhen: (d) => false },
  companyId: { visibleWhen: (d) => false, requiredWhen: (d) => false },
};
