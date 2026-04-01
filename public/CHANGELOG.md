# Changelog

## [Unreleased]

### Added
- **Birth Last Name Field**: Added `birthLastName` field to Phase 1, Step 1 (Personal Data).
- **Communication Password Field**: Added `communicationPassword` field to Phase 1, Step 3 (Citizenship) for users to create their own password without special characters.
- **Execution Field**: Added an `execution` boolean field to Phase 1, Step 4 (Payment Details).
- **Identity Document Fields**: Added `documentType` and `documentExpiryDate` fields for EU and Non-EU identity documents in Phase 2.
- **Residence Document Options**: Expanded `residenceDocumentType` dropdown with country-specific options:
    - **EU Countries (excluding CZ)**:
        - Přechodný pobyt
        - Trvalý pobyt
        - občanský průkaz
        - pas
    - **Non-EU Countries (excluding CZ)**:
        - Přechodný pobyt
        - Trvalý pobyt
        - Krátkodobé vízum
        - Dlouhodobé vízum
        - Studium
        - Dočasná ochrana
        - Mezinárodní ochrana
        - Dlouhodobý pobyt (kód 95)
        - Dlouhodobý pobyt (kód 99)
        - Dlouhodobý pobyt (kód 670)
- **Residence File Uploads**: Added dedicated `EuResidenceFileUpload` and `NonEuResidenceFileUpload` components to handle document uploads based on the user's citizenship.

### Changed
- **Phase 2 Restructuring**: Refactored Phase 2 into a multi-step component (`Phase2.svelte`) with three sub-steps:
  1. Basic Information
  2. Identity Document
  3. Residence Documents
- **Dynamic Phase 2 Navigation**: The Residence Documents step is dynamically skipped for Czech citizens (`country === "CZ"` logic limits total steps to 2 instead of 3).
- **Validation Scope Management**: Rewrote state machine definitions to logically divide Phase 2 fields into `"phase2Step1"`, `"phase2Step2"`, and `"phase2Step3"` to allow seamless, granular validation routing.

### Removed
- **Passport or ID Card Number (Phase 1)**: Commented out `passportOrId` and related UI elements in the Citizenship step as requested, replacing it with `communicationPassword`.

---

## Payload Schemas

### `submitPhase1` Payload
When submitting the first phase, the payload includes the following properties:

```json
{
  // Step 1: Personal Data
  "firstName": "string",
  "lastName": "string",
  "birthLastName": "string | undefined",
  "phone": "string",
  "email": "string",

  // Step 2: Address Details
  "street": "string",
  "houseNumber": "string",
  "city": "string",
  "zip": "string",
  "deliveryCity": "string",

  // Step 3: Citizenship & Security
  "country": "string",
  "communicationPassword": "string",
  "birthDate": "string",

  // Step 4: Payment & Declarations
  "bankPrefix": "string",
  "bankNumber": "string",
  "bankCode": "string",
  "insurance": "string",
  "pinkStatement": "boolean",
  "execution": "boolean",

  // Always Included Metadata
  "utm_source": "string | undefined",
  "utm_campaign": "string | undefined",
  "utm_medium": "string | undefined",
  "utm_id": "string | undefined",
  "submitSource": "string",
  "foxentryPaymentStatus": "string",
  "step1Completed": "boolean",
  "step2Completed": "boolean",
  "step3Completed": "boolean",
  "sessionId": "string",
  "formStart": "string",
  "firstEndpointSubmissionId": "string",
  "firstEndpointSubmissionTime": "string | undefined"
}
```

### `submitPhase2` Payload
When completing the registration process in the second phase, the payload includes:

```json
{
  // Sub-step 1: Basic Information
  "permanentResidenceCountry": "string",
  "permanentResidenceStreet": "string",
  "permanentResidenceStreetNumber": "string",
  "permanentResidenceCity": "string",
  "transport": "string",
  "gender": "string",
  "placeOfBirth": "string",
  "filesDriversLicense": "File[]",

  // Sub-step 2: Identity Document
  "documentExpiryDate": "string",
  "documentType": "string",
  "documentNumber": "string",
  "documentIssuingCountry": "string",
  "filesNationalId": "File[]",
  "filesEuPassport": "File[]",
  "filesNonEu": "File[]",

  // Sub-step 3: Residence Documents (Skipped for CZ)
  "residenceDocumentType": "string",
  "residenceDocumentNumber": "string",
  "residenceDocumentExpiryDate": "string",
  "residenceDocumentIssuingCountry": "string",
  "filesEuResidence": "File[]",
  "filesNonEuResidence": "File[]",

  // Always Included Metadata
  "utm_source": "string | undefined",
  "utm_campaign": "string | undefined",
  "utm_medium": "string | undefined",
  "utm_id": "string | undefined",
  "submitSource": "string",
  "foxentryPaymentStatus": "string",
  "step1Completed": "boolean",
  "step2Completed": "boolean",
  "step3Completed": "boolean",
  "sessionId": "string",
  "formStart": "string",
  "firstEndpointSubmissionId": "string",
  "firstEndpointSubmissionTime": "string | undefined"
}
```

### `submitPhase2` Fallback Payload (Cloudinary)
If the primary multipart request fails (e.g., due to payload size limits or network drops), the client automatically falls back to uploading files individually to Cloudinary. It then sends a URL-encoded or multipart payload **without** the raw `File[]` objects, containing the standard Phase 2 properties plus the following fallback metadata:

```json
{
  // Same Sub-step 1, 2, 3 properties as above, but WITHOUT the File arrays

  // Fallback-Specific Properties
  "courierId": "string",
  "cloudinaryUrls": "string", // JSON stringified array of uploaded Cloudinary URLs
  "cloudinaryFilesMeta": "string", // (Optional) JSON stringified array of `{ bucket, name, size, type, lastModified, index }`
  "cloudinaryUploadFailures": "string" // (Optional) JSON stringified array of `{ bucket, name, size, type, lastModified, error }`
}
```
