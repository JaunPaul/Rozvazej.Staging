// src/lib/i18n.svelte.ts
export type Locale = "cs" | "en";

let locale = $state<Locale>("cs");

const dict = $state<Record<Locale, Record<string, string>>>({
  cs: {
    "steps.1": "Krok 1",
    "steps.2": "Krok 2",
    "steps.3": "Krok 3",

    "form.title": "Hotovo za méně než 2 minuty",
    "form.lead":
      "Vyplňte pár základních údajů, abychom mohli připravit Vaši registraci.",
    "phase2.title": "Poslední podrobnosti",

    "step1.title": "Osobní údaje",
    "step2.title": "Vaše adresa",
    "step3.title": "Občanství",
    "step4.title": "Údaje pro výplatu",

    "labels.firstName": "Jméno",
    "labels.lastName": "Přijmení",
    "labels.birthLastName": "Rodné příjmení",
    "labels.phone": "Telefonní číslo",
    "labels.email": "Email",
    "labels.companyId": "IČO",
    "labels.nationalId": "Rodné číslo",
    "labels.applyAsCompany": "Budete jezdit na IČO?",
    "labels.passportOrId": "Číslo občanského průkazu nebo cestovního pasu",
    "labels.communicationPassword": "Heslo pro elektronickou komunikaci",
    "labels.citizenship": "Státní občanství",
    "labels.street": "Ulice",
    "labels.houseNumber": "Číslo popisné",
    "labels.city": "Město",
    "labels.zip": "PSČ",
    "labels.bank.prefix": "Předčíslí",
    "labels.bank.number": "Číslo bankovního účtu",
    "labels.bank.code": "Kód banky",
    "labels.doc.nationalId": `Nahrajte ID/ jiný platný doklad. <br /><span class="bold-green">1. PŘEDNÍ STRANA</span><br /><span class="bold-green">2. ZADNÍ STRANA</span>`,
    "labels.doc.euPassport": `Nahrajte svůj občanský průkaz. <br /><span class="bold-green">1. PŘEDNÍ STRANA</span><br /><span class="bold-green">2. ZADNÍ STRANA</span>`,
    "labels.doc.euResidence": `Nahrajte svůj doklad o pobytu. <br /><span class="bold-green">1. PŘEDNÍ STRANA</span><br /><span class="bold-green">2. ZADNÍ STRANA</span>`,
    "labels.doc.nonEu": `Nahrajte následující platné dokumenty. <br /><span class="bold-green">1. Vízum NEBO povolení k pobytu NEBO pracovní povolení</span>`,
    "labels.doc.nonEuResidence": `Nahrajte svůj doklad o pobytu. <br /><span class="bold-green">1. PŘEDNÍ STRANA</span><br /><span class="bold-green">2. ZADNÍ STRANA</span>`,
    "labels.doc.driversLicense": `Nahrajte platný řidičský průkaz. <br /><span class="bold-green">1. PŘEDNÍ STRANA</span><br /><span class="bold-green">2. ZADNÍ STRANA</span>`,
    "labels.deliveryCompany":
      "Neomezujte se - u nás můžete jezdit pro všechny tři služby najednou: Bolt, Wolt i Foodora. Více platforem = více objednávek = vyšší výdělky. Stačí si zvolit, kde chcete začít!",
    "labels.documentNumberEu": "Číslo občanského průkazu ",
    "labels.documentNumberNonEu":
      "Číslo víza NEBO povolení k pobytu NEBO pracovní povolení  ",
    "labels.documentType": "Typ dokladu",
    "labels.documentIssuingCountry": "Země vydání dokladu",
    "labels.residenceDocumentType": "Typ dokladu o pobytu",
    "labels.permanentResidenceCountry": "Země",

    "hints.czPhone":
      "Pro rozvážení v České republice je nezbytné <strong>české telefonní číslo.</strong>",
    "hints.birthLastName": "Nevyplňujte, pokud je stejné",
    "hints.useRealEmail":
      "Zvolte prosím email, který reálně používáte. <strong>Budou Vám na něj chodit důležité emaily.</strong>",
    "hints.doc.nationalId":
      "Nahrajte přední i zadní stranu svého občanského průkazu.",
    "hints.doc.euPassport":
      "Nahrajte přední i zadní stranu svého občanského průkazu.",
    "hints.doc.euResidence":
      "Nahrajte přední i zadní stranu svého dokladu.",
    "hints.communicationPassword": "Vytvořte si heslo bez speciálních znaků",
    "hints.doc.nonEu":
      "*Tyto dokumenty jsou vyžadovány: vízum NEBO povolení k pobytu NEBO studijní/pracovní povolení.",
    "hints.doc.nonEuResidence":
      "Nahrajte přední i zadní stranu svého dokladu.",
    "hints.pinkstatement":
      'Pokud zvolíte ANO, uplatníme u Vás slevu na dani a budete dostávat více peněz.<br><br> <strong>POZOR</strong> - "růžové prohlášení o dani" (neboli Prohlášení poplatníka k dani z příjmů fyzických osob) můžete mít vyplněné a uplatněné pouze u jednoho zaměstnavatele. To znamená, že pokud máte více pracovních smluv, nebo kombinujete zaměstnání a brigády, můžete tento nárok využít jen u jedné firmy.',
    "hints.doc.filesDriversLicense":
      "Nahrajte jasnou fotografii nebo sken svého řidičského průkazu.",

    "ph.firstName": "Např. Jan",
    "ph.lastName": "Např. Novák",
    "ph.birthLastName": "Např. Novák",
    "ph.phone": "Např. 777111222",
    "ph.email": "Např. jan.novak@email.cz",
    "ph.nationalId": "Např. 123456789",
    "ph.companyId": "Např. 12345678",
    "ph.bank.prefix": "Např. 123456",
    "ph.bank.number": "Např. 123456789",
    "ph.passportOrId": "Např. 123456789",
    "ph.communicationPassword": "Zadejte Vaše heslo",
    "ph.permanentResidence":
      "Např. 5 Avenue Anatole France, Champ de Mars, 75007 Paříž, Francie",
    "ph.placeOfBirth": "Např. Paříž, Francie",
    "ph.permanentResidenceCountry": "Např. Česká republika",
    "ph.permanentResidenceStreet": "Např. Václavské náměstí",
    "ph.permanentResidenceStreetNumber": "Např. 123/45",
    "ph.permanentResidenceCity": "Např. Praha",
    "ph.documentNumber": "Např. M0032786",

    "errors.firstName": "Zadejte prosím své jméno",
    "errors.lastName": "Zadejte prosím své přijmení",
    "errors.phone": "Zadejte české telefonní číslo ve formátu XXX XXX XXX.",
    "errors.email": "Zadejte prosím svůj email",
    "errors.nationalId": "Zadejte platné rodné číslo.",
    "errors.passportOrId": "Zadejte prosím platné číslo průkazu totožnosti",
    "errors.communicationPassword": "Zadejte heslo pro komunikaci",
    "errors.communicationPasswordSpecialChars": "Heslo nesmí obsahovat speciální znaky",
    "errors.street": "Zadejte prosím název ulice",
    "errors.houseNumber": "Zadejte prosím číslo popisné",
    "errors.city": "Zadejte prosím město či obec",
    "errors.zip": "Zadejte prosím poštovní směrovací číslo",
    "errors.bank.number": "Zadejte prosím vaše číslo účtu",
    "errors.bank.code": "Vyberte možnost",
    "errors.applyAsCompany": "Vyberte možnost",
    "errors.files": "Požadované soubory: ",
    "errors.fox.firstName": "Jméno je neplatné.",
    "errors.fox.lastName": "Příjmení je neplatné.",
    "errors.fox.birthLastName": "Rodné příjmení je neplatné.",
    "errors.fox.email": "E-mail je neplatný.",
    "errors.fox.phone": "Telefon je neplatný.",
    "errors.fox.address": "Neplatné umístění.",
    "errors.fox.city": "Město neodpovídá adrese.",
    "errors.fox.street": "Ulice neodpovídá adrese.",
    "errors.fox.zip": "PSČ neodpovídá městu.",
    "errors.fox.houseNumber": "Číslo domu neodpovídá ulici.",
    "errors.fox.company": "Toto IČO jsme nenašli.",
    "errors.deliveryCity": "Zadejte prosím město či obec",
    "errors.birthDate": "Zadejte prosím datum narození",
    "errors.country": "Vyberte možnost",
    "errors.documentExpiryDate": "Zadejte prosím datum expirace dokladu",
    "errors.insurance": "Vyberte možnost",
    "errors.pinkStatement": "Vyberte možnost",
    "errors.execution": "Vyberte možnost",
    "errors.gender": "Vyberte možnost",
    "errors.transport": "Vyberte možnost",
    "errors.birthDateTooYoung": "Musíte být starší 15 let",
    "errors.permanentResidence": "Je vyžadován trvalý pobyt",
    "errors.placeOfBirth": "Místo narození povinné",
    "errors.documentIssuingCountry": "Tento vstup je povinný",
    "errors.documentType": "Vyberte typ dokladu",
    "errors.residenceDocumentType": "Vyberte typ dokladu o pobytu",

    "nav.prev": "Předchozí",
    "nav.next": "Pokračovat na krok",
    "nav.submit": "Odeslat",
    "nav.validate": "Ověřování...",
    "nav.wait": "Prosím čekejte..",

    "labels.cityToDeliver": "Město kde budete rozvážet",
    "labels.transport": "Na čem budete rozvážet?",
    "labels.insurance": "Zdravotní pojištovna",
    "labels.pinkStatement": "Chcete uplatnit růžové prohlášení?",
    "labels.execution": "Exekuce?",
    "labels.gender": "Jaké je tvé pohlaví?",
    "labels.birthDate": "Datum narození",
    "labels.documentExpiryDate": "Datum expirace dokladu",
    "labels.placeOfBirth": "Místo narození",
    "labels.permanentResidence": "Trvalé bydliště",

    "answer.yes": "ANO",
    "answer.no": "NE",

    "select.placeholder.country": "Vyberte stát",
    "select.placeholder.city": "Vyberte jednu z možností...",
    "select.placeholder.transport": "Vyberte způsob dopravy",
    "select.placeholder.insurance": "Vyberte zdravotní pojišťovnu",
    "select.placeholder.bank": "Vyberte banku",
    "select.placeholder.gender": "Vyberte pohlaví",
    "select.placeholder.documentType": "Vyberte typ dokladu",
    "select.placeholder.residenceDocumentType": "Vyberte typ dokladu o pobytu",

    "options.transport.car": "Auto",
    "options.transport.bike": "Kolo",
    "options.transport.motorcycle": "Motorka / Skútr",
    "options.transport.electricScooter": "Elektrická koloběžka",
    "options.gender.male": "Muž",
    "options.gender.female": "Žena",
    "options.gender.other": "Ostatní",
    "options.documentType.id": "Občanský průkaz",
    "options.documentType.passport": "Pas",
    "options.residenceDocumentType.temp": "Přechodný pobyt",
    "options.residenceDocumentType.perma": "Trvalý pobyt",
    "options.residenceDocumentType.shortVisa": "Krátkodobé vízum",
    "options.residenceDocumentType.longVisa": "Dlouhodobé vízum",
    "options.residenceDocumentType.study": "Studium",
    "options.residenceDocumentType.tempProtection": "Dočasná ochrana",
    "options.residenceDocumentType.intlProtection": "Mezinárodní ochrana",
    "options.residenceDocumentType.code95": "Dlouhodobý pobyt (kód 95)",
    "options.residenceDocumentType.code99": "Dlouhodobý pobyt (kód 99)",
    "options.residenceDocumentType.code670": "Dlouhodobý pobyt (kód 670)",

    "upload.button": "Nahrát soubor",
    "upload.max": "Maximální velikost souboru 2 MB.",
    "upload.error.size": "Nahrávání selhalo. Max. velikost souboru je 2 MB.",
    "upload.error.type": "Nahrávání selhalo. Neplatný typ souboru.",
    "upload.error.generic": "Nahrávání selhalo. Zkuste to prosím znovu.",

    "result.success": "Děkujeme. Pracujeme na tom.",
    "result.fail": "Oops! Something went wrong while submitting the form.",
    "result.loading.stage1": "Nahrávání souborů...",
    "result.loading.stage2": "Ověřování vašich údajů...",
    "result.loading.stage3": "Dokončování...",
    "result.verifying.stage1": "Ověřování dat...",
    "result.verifying.stage2": "Kontrola stavu smlouvy...",
    "result.verifying.stage3": "Téměř hotovo...",

    "message.success": "Formulář se zpracováná. Vyčkejte prosím...",
  },
  en: {
    "steps.1": "Step 1",
    "steps.2": "Step 2",
    "steps.3": "Step 3",

    "form.title": "Done in under 2 minutes",
    "form.lead":
      "Fill in a few basic details so we can prepare your registration.",
    "phase2.title": "Final details",

    "step1.title": "Personal details",
    "step2.title": "Your address",
    "step3.title": "Citizenship",
    "step4.title": "Payout details",

    "labels.firstName": "First name",
    "labels.lastName": "Last name",
    "labels.birthLastName": "Birth last name",
    "labels.phone": "Phone number",
    "labels.email": "Email",
    "labels.companyId": "Company ID Number",
    "labels.passportOrId": "ID card or passport",
    "labels.communicationPassword": "Communication Password",
    "labels.nationalId": "Social Security number",
    "labels.applyAsCompany": "Are you applying as a company?",
    "labels.citizenship": "Citizenship",
    "labels.street": "Street",
    "labels.houseNumber": "House number",
    "labels.documentExpiryDate": "Document expiration date",
    "labels.city": "City",
    "labels.zip": "ZIP / Postal code",
    "labels.bank.prefix": "Prefix",
    "labels.bank.number": "Bank account number",
    "labels.bank.code": "Bank code",

    "labels.doc.nationalId": `Upload ID / other valid document. <br /><span class="bold-green">FRONT SIDE</span><br /><span class="bold-green">BACK SIDE</span>`,
    "labels.doc.euPassport": `Upload your identity card. <br /><span class="bold-green">FRONT SIDE</span><br /><span class="bold-green">BACK SIDE</span>`,
    "labels.doc.euResidence": `Upload your residence document. <br /><span class="bold-green">1. FRONT SIDE</span><br /><span class="bold-green">2. BACK SIDE</span>`,

    // ✅ Non-EU change: remove ID card requirement
    "labels.doc.nonEu": `Upload the following valid documents. <br /><span class="bold-green">1. VISA OR RESIDENCE PERMIT OR WORK PERMIT</span>`,
    "labels.doc.nonEuResidence": `Upload your residence document. <br /><span class="bold-green">1. FRONT SIDE</span><br /><span class="bold-green">2. BACK SIDE</span>`,

    // ✅ Driver’s license change: move both instructions into main green text
    "labels.doc.driversLicense": `Upload a valid driver's license. <br /><span class="bold-green">1. FRONT SIDE</span><br /><span class="bold-green">2. BACK SIDE</span>`,

    "labels.deliveryCompany":
      "Don’t limit yourself - with us you can ride for all three services at once: Bolt, Wolt, and Foodora. More platforms = more orders = higher earnings. Just choose where you want to start!",
    "labels.documentType": "Document Type",
    "labels.documentIssuingCountry": "Issuing country",
    "labels.residenceDocumentType": "Residence Document Type",
    "labels.permanentResidenceCountry": "Country",

    "hints.czPhone":
      "For deliveries in the Czech Republic you must provide a <strong>Czech phone number.</strong>",
    "hints.birthLastName": "Do not fill if same",
    "hints.useRealEmail":
      "Use an email you actually check. <strong>Important messages will go there.</strong>",
    "hints.doc.nationalId":
      "Upload both the front and back side of your ID card.",
    "hints.doc.euPassport":
      "Upload both the front and back side of your ID card.",
    "hints.doc.euResidence":
      "Upload both the front and back side of your document.",
    "hints.communicationPassword": "Create a password without special characters",

    // ✅ Non-EU change: remove “upload ID card” mention
    "hints.doc.nonEu":
      "*These files are required: visa OR residence permit OR work permit.",
    "hints.doc.nonEuResidence":
      "Upload both the front and back side of your document.",

    "hints.pinkstatement":
      "<strong>WARNING</strong> - You can only have the “pink tax declaration” (Taxpayer’s Declaration for Personal Income Tax) applied with one employer. This means that if you have multiple employment contracts or combine jobs and part-time work, you can only claim this benefit with one company.",

    // ✅ Driver’s license hint: remove duplication (front/back now in main green text)
    "hints.doc.filesDriversLicense":
      "Upload a clear photo or scan of your driver's license.",

    "ph.firstName": "Type your first name",
    "ph.lastName": "Type your last name",
    "ph.birthLastName": "Type your birth last name",
    "ph.phone": "775111222",
    "ph.email": "Enter your email address",
    "ph.nationalId": "Your social security number",
    "ph.companyId": "Enter your company number",
    "ph.bank.prefix": "123456",
    "ph.bank.number": "123456789",
    "ph.passportOrId": "Enter ID number",
    "ph.communicationPassword": "Your password",
    "ph.permanentResidence":
      "e.g. 5 Avenue Anatole France, Champ de Mars, 75007 Paris, France",
    "ph.placeOfBirth": "e.g. Paris, France",
    "ph.permanentResidenceCountry": "e.g. Czech Republic",
    "ph.permanentResidenceStreet": "e.g. Wenceslas Square",
    "ph.permanentResidenceStreetNumber": "e.g. 123/45",
    "ph.permanentResidenceCity": "e.g. Prague",
    "ph.documentNumber": "e.g. M0032786",

    "errors.firstName": "Please enter your first name",
    "errors.lastName": "Please enter your last name",
    "errors.phone": "Enter a Czech phone number in the format XXX XXX XXX.",
    "errors.email": "Please enter your email",
    "errors.passportOrId": "Please enter a valid ID number",
    "errors.communicationPassword": "Enter a communication password",
    "errors.communicationPasswordSpecialChars": "Password cannot contain special characters",
    "errors.nationalId": "Enter a valid national social security number.",
    "errors.street": "Please enter the street name",
    "errors.houseNumber": "Please enter the house number",
    "errors.city": "Please enter the city or town",
    "errors.zip": "Please enter the postal code",
    "errors.bank.number": "Please enter your bank account number",
    "errors.bank.code": "Please select an option",
    "errors.applyAsCompany": "Please select an option",
    "errors.files": "Files required: ",
    "errors.fox.firstName": "Please enter a valid name",
    "errors.fox.lastName": "Please enter a valid last name",
    "errors.fox.birthLastName": "Please enter a valid birth last name",
    "errors.fox.email": "Email is invalid",
    "errors.fox.phone": "Phone is invalid",

    "errors.fox.address": "Invalid location.",
    "errors.fox.city": "City does not match address.",
    "errors.fox.street": "Street does not match address.",
    "errors.fox.zip": "ZIP does not match city.",
    "errors.fox.houseNumber": "House number does not match street.",
    "errors.fox.company":
      "We could not find this company. Please search and select your company using the registration number.",

    "errors.deliveryCity": "You must select a city",
    "errors.birthDate": "You must select a birth date",
    "errors.country": "You must select a country",
    "errors.documentExpiryDate": "You must select a document expiry date",
    "errors.insurance": "You must select an insurance",
    "errors.pinkStatement": "You must select a pink statement",
    "errors.execution": "You must select an option",
    "errors.gender": "Select a gender",
    "errors.transport": "Select transport",
    "errors.birthDateTooYoung": "You must be 15 or older",
    "errors.permanentResidence": "Permanent residence is required",
    "errors.placeOfBirth": "Place of birth required",
    "errors.documentType": "Select document type",
    "errors.residenceDocumentType": "Select residence document type",

    "nav.prev": "Back",
    "nav.next": "Continue to step",
    "nav.submit": "Submit",
    "nav.wait": "Please wait…",
    "nav.validate": "Validating...",

    "labels.cityToDeliver": "City you will deliver in",
    "labels.transport": "What will you deliver on?",
    "labels.insurance": "Health insurance",
    "labels.pinkStatement": "Apply the “pink tax declaration”?",
    "labels.execution": "Execution (Debt Enforcement)?",
    "labels.birthDate": "Birth date",
    "labels.gender": "What is your gender?",
    "labels.passportExpiry": "Passport expiry date",
    "labels.placeOfBirth": "Place of birth",
    "labels.permanentResidence": "Permanent residence",

    "labels.documentNumberEu": "Identity card number",
    "labels.documentNumberNonEu":
      "Visa OR residence permit OR work permit number",

    "answer.yes": "YES",
    "answer.no": "NO",

    "select.placeholder.country": "Select a country",
    "select.placeholder.city": "Choose an option…",
    "select.placeholder.transport": "Select transport",
    "select.placeholder.insurance": "Select health insurer",
    "select.placeholder.gender": "Select gender",
    "select.placeholder.bank": "Select a bank",
    "select.placeholder.documentType": "Select document type",
    "select.placeholder.residenceDocumentType": "Select residence document type",

    "options.transport.car": "Car",
    "options.transport.bike": "Bicycle",
    "options.transport.motorcycle": "Motorcycle / Scooter",
    "options.transport.electricScooter": "Electric Scooter",
    "options.gender.male": "Male",
    "options.gender.female": "Female",
    "options.gender.other": "Other",
    "options.documentType.id": "ID Card",
    "options.documentType.passport": "Passport",
    "options.residenceDocumentType.temp": "Temporary Residence",
    "options.residenceDocumentType.perma": "Permanent Residence",
    "options.residenceDocumentType.shortVisa": "Short-term visa",
    "options.residenceDocumentType.longVisa": "Long-term visa",
    "options.residenceDocumentType.study": "Study purposes",
    "options.residenceDocumentType.tempProtection": "Temporary protection",
    "options.residenceDocumentType.intlProtection": "International protection",
    "options.residenceDocumentType.code95": "Long-term Residence (code 95)",
    "options.residenceDocumentType.code99": "Long-term Residence (code 99)",
    "options.residenceDocumentType.code670": "Long-term Residence (code 670)",

    "upload.button": "Upload file",
    "upload.max": "Maximum file size is 2 MB.",
    "upload.error.size": "Upload failed. Maximum file size is 2 MB.",
    "upload.error.type": "Upload failed. Invalid file type.",
    "upload.error.generic": "Upload failed. Please try again.",

    "result.success": "Thank you. We’re working on it.",
    "result.fail": "Oops! Something went wrong while submitting the form.",
    "result.loading.stage1": "Uploading your files...",
    "results.loading.stage2": "Verifying your information...",
    "results.loading.stage3": "Finishing up...",

    "result.verifying.stage1": "Verifying data...",
    "result.verifying.stage2": "Checking contract status...",
    "result.verifying.stage3": "Almost done...",

    "message.success":
      "Form submitted successfully. You are being redirected...",
  },
});

/** Change current locale */
export function setLocale(l: Locale) {
  locale = l;
}

/** Translate helper with fallback to key, then Czech */
export function t(key: string) {
  const hit = dict[locale]?.[key];
  if (hit) return hit;
  return dict.cs[key] ?? key;
}
