# Phase 1
All fields and steps in Phase 1 are now required

# step1
## fields
all fields required
- firstName > text
- lastName > text
- phone > text
- email > text

# step2
## fields
- street > text required
- houseNumber > text required
- city > text required
- zip > text > required
- deliveryCity > select required

# step 3
## fields
- country > select > required
- nationalId > text > required and values.country === "CZ"
- passportOrId > text required and values.country !== t("select.placeholder.country") && values.country !== "CZ"
- birthDate > date required and values.country !== t("select.placeholder.country") && values.country !== "CZ"

# step4
## fields
- bankPrefix > number > required
- bankNumber > number > required
- bankCode > select > required
- insurance > select
- pinkStatement > radio

# Phase 2
# step 1

- filesNationalId > files > required and visible if values.country === "CZ"
- filesEuPassport > files > required and visible if values.country !== t("select.placeholder.country") && isEu(values.country) && values.country !== "CZ"
- filesNonEu > files > required and visible if values.country !== t("select.placeholder.country") && !isEu(values.country)
- transport > select
- gender > select
- documentExpiryDate > date > visible if values.country !== t("select.placeholder.country") && !isEu(values.country)

# Archived
- applyAsCompany > radio
- companyId > text > required and visible if applyAsCompany = "ANO"
