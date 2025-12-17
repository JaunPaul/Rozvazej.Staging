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
    "labels.phone": "Telefonní číslo",
    "labels.email": "Email",
    "labels.companyId": "IČO",
    "labels.nationalId": "Rodné číslo",
    "labels.applyAsCompany": "Budete jezdit na IČO?",
    "labels.passportOrId": "Číslo občanského průkazu nebo cestovního pasu",
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
    "labels.doc.nonEu": `Nahrajte následující platné dokumenty. <br /><span class="bold-green">1. Průkaz totožnosti</span><br /><span class="bold-green">2. Vízum NEBO povolení k pobytu NEBO pracovní povolení</span>`,
    "labels.doc.driversLicense": `Nahrajte platný řidičský průkaz. <br /><span class="bold-green">1. PŘEDNÍ STRANA</span><br />`,
    "labels.deliveryCompany":
      "Neomezujte se - u nás můžete jezdit pro všechny tři služby najednou: Bolt, Wolt i Foodora. Více platforem = více objednávek = vyšší výdělky. Stačí si zvolit, kde chcete začít!",
    "labels.documentNumberEu": "Číslo občanského průkazu ",
    "labels.documentNumberNonEu":
      "Číslo víza NEBO povolení k pobytu NEBO pracovní povolení  ",
    "labels.documentIssuingCountry": "Země vydání dokladu",
    "labels.permanentResidenceCountry": "Země",

    "hints.czPhone":
      "Pro rozvážení v České republice je nezbytné <strong>české telefonní číslo.</strong>",
    "hints.useRealEmail":
      "Zvolte prosím email, který reálně používáte. <strong>Budou Vám na něj chodit důležité emaily.</strong>",
    "hints.doc.nationalId":
      "Nahrajte přední i zadní stranu svého občanského průkazu.",
    "hints.doc.euPassport":
      "Nahrajte přední i zadní stranu svého občanského průkazu.",
    "hints.doc.nonEu":
      "*Tyto dokumenty jsou vyžadovány. Občanský průkaz (přední i zadní strana) nebo cestovní pas, vízum nebo povolení k pobytu, studijní nebo pracovní povolení.",
    "hints.pinkstatement":
      'Pokud zvolíte ANO, uplatníme u Vás slevu na dani a budete dostávat více peněz.<br><br> <strong>POZOR</strong> - "růžové prohlášení o dani" (neboli Prohlášení poplatníka k dani z příjmů fyzických osob) můžete mít vyplněné a uplatněné pouze u jednoho zaměstnavatele. To znamená, že pokud máte více pracovních smluv, nebo kombinujete zaměstnání a brigády, můžete tento nárok využít jen u jedné firmy.',
    "hints.doc.filesDriversLicense":
      "Nahrajte jasnou fotografii nebo sken přední i zadní strany vašeho řidičského průkazu.",

    "ph.firstName": "Např. Jan",
    "ph.lastName": "Např. Novák",
    "ph.phone": "Např. 777111222",
    "ph.email": "Např. jan.novak@email.cz",
    "ph.nationalId": "Např. 123456789",
    "ph.companyId": "Např. 12345678",
    "ph.bank.prefix": "Např. 123456",
    "ph.bank.number": "Např. 123456789",
    "ph.passportOrId": "Např. 123456789",
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
    "errors.gender": "Vyberte možnost",
    "errors.transport": "Vyberte možnost",
    "errors.birthDateTooYoung": "Musíte být starší 15 let",
    "errors.permanentResidence": "Je vyžadován trvalý pobyt",
    "errors.placeOfBirth": "Místo narození povinné",
    "errors.documentIssuingCountry": "Tento vstup je povinný",

    "nav.prev": "Předchozí",
    "nav.next": "Pokračovat na krok",
    "nav.submit": "Odeslat",
    "nav.validate": "Ověřování...",
    "nav.wait": "Prosím čekejte..",

    "labels.cityToDeliver": "Město kde budete rozvážet",
    "labels.transport": "Na čem budete rozvážet?",
    "labels.insurance": "Zdravotní pojištovna",
    "labels.pinkStatement": "Chcete uplatnit růžové prohlášení?",
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

    "options.transport.car": "Auto",
    "options.transport.bike": "Kolo",
    "options.transport.motorcycle": "Motorka / Skútr",
    "options.transport.electricScooter": "Elektrická koloběžka",
    "options.gender.male": "Muž",
    "options.gender.female": "Žena",
    "options.gender.other": "Ostatní",

    "upload.button": "Nahrát soubor",
    "upload.max": "Maximální velikost souboru 10 MB.",
    "upload.error.size": "Nahrávání selhalo. Max. velikost souboru je 10 MB.",
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

    "form.title": "Hotovo za méně než 2 minuty",
    "form.lead":
      "Vyplňte pár základních údajů, abychom mohli připravit Vaši registraci. ",
    "phase2.title": "Phase 2 title",

    "step1.title": "Osobní údaje",
    "step2.title": "Vaše adresa",
    "step3.title": "Občanství",
    "step4.title": "Údaje pro výplatu",

    "labels.firstName": "First name",
    "labels.lastName": "Last name",
    "labels.phone": "Phone number",
    "labels.email": "Email",
    "labels.companyId": "Company ID Number",
    "labels.passportOrId": "ID card or passport",
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
    "labels.doc.euPassport": `Upload your Identity card. <br /><span class="bold-green">FRONT SIDE</span><br /><span class="bold-green">BACK SIDE</span>`,
    "labels.doc.nonEu": `Upload the following valid documents. <br /><span class="bold-green">ID CARD</span><br /><span class="bold-green">VISA OR RESIDENCE PERMIT</span><br /><span class="bold-green">STUDY OR PERMIT</span>`,
    "labels.doc.driversLicense": `Upload valid driver's license. <br /><span class="bold-green">1. FRONT SIDE</span><br />`,
    "labels.deliveryCompany":
      "Don’t limit yourself - with us you can ride for all three services at once: Bolt, Wolt, and Foodora. More platforms = more orders = higher earnings. Just choose where you want to start!",
    "labels.documentIssuingCountry": "Země vydání dokladu",
    "labels.permanentResidenceCountry": "Země",

    "hints.czPhone":
      "For deliveries in the Czech Republic you must provide a <strong>Czech phone number.</strong>",
    "hints.useRealEmail":
      "Use an email you actually check. <strong>Important messages will go there.</strong>",
    "hints.doc.nationalId": "Upload both front and back of your ID card.",
    "hints.doc.euPassport": "Upload both front and back of your ID card.",
    "hints.doc.nonEu":
      "*These files are required. ID card (front and back), Visa or residence permit, Study or work permit",
    "hints.pinkstatement":
      '<strong>POZOR</strong> - "růžové prohlášení o dani" (neboli Prohlášení poplatníka k dani z příjmů fyzických osob) můžete mít vyplněné a uplatněné pouze u jednoho zaměstnavatele. To znamená, že pokud máte více pracovních smluv, nebo kombinujete zaměstnání a brigády, můžete tento nárok využít jen u jedné firmy.',
    "hints.doc.filesDriversLicense": "Upload your driver's license",

    "ph.firstName": "Type your first name",
    "ph.lastName": "Type your last name",
    "ph.phone": "775111222",
    "ph.email": "Enter your email address",
    "ph.nationalId": "Your social security number",
    "ph.companyId": "Enter your company number",
    "ph.bank.prefix": "123456",
    "ph.bank.number": "123456789",
    "ph.passportOrId": "Enter ID number",
    "ph.permanentResidence":
      "e.g. 5 Avenue Anatole France, Champ de Mars, 75007 Paris, France",
    "ph.placeOfBirth": "e.g. France",
    "ph.permanentResidenceCountry": "Např. Česká republika",
    "ph.permanentResidenceStreet": "Např. Václavské náměstí",
    "ph.permanentResidenceStreetNumber": "Např. 123/45",
    "ph.permanentResidenceCity": "Např. Praha",
    "ph.documentNumber": "Např. M0032786",

    "errors.firstName": "Please enter your first name",
    "errors.lastName": "Please enter your last name",
    "errors.phone": "Enter a Czech phone number in the format XXX XXX XXXX.",
    "errors.email": "Please enter your email",
    "errors.passportOrId": "Please enter a valid ID number",
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
    "errors.fox.email": "Email is invalid",
    "errors.fox.phone": "Phone is invalid",
    "errors.fox.address": "Neplatné umístění",
    "errors.fox.city": "City does not match address.",
    "errors.fox.street": "Street does not match address",
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
    "errors.gender": "Select a gender",
    "errors.transport": "Select transport",
    "errors.birthDateTooYoung": "You must be 15 or older",
    "errors.permanentResidence": "Permanent residence is required",
    "errors.placeOfBirth": "Place of birth required",

    "nav.prev": "Back",
    "nav.next": "Continue to step",
    "nav.submit": "Submit",
    "nav.wait": "Please wait…",
    "nav.validate": "Validating...",

    "labels.cityToDeliver": "City you will deliver in",
    "labels.transport": "What will you deliver on?",
    "labels.insurance": "Health insurance",
    "labels.pinkStatement": "Apply the “pink tax declaration”?",
    "labels.birthDate": "Birth date",
    "labels.gender": "What is your gender?",
    "labels.passportExpiry": "Passport expiry date",
    "labels.placeOfBirth": "Place of birth",
    "labels.permanentResidence": "Permanent residence",
    "labels.documentNumberEu": "Číslo občanského průkazu ",
    "labels.documentNumberNonEu":
      "Číslo víza NEBO povolení k pobytu NEBO pracovní povolení  ",

    "answer.yes": "YES",
    "answer.no": "NO",

    "select.placeholder.country": "Select a country",
    "select.placeholder.city": "Choose an option…",
    "select.placeholder.transport": "Select transport",
    "select.placeholder.insurance": "Select health insurer",
    "select.placeholder.gender": "Select gender",
    "select.placeholder.bank": "Select a bank",

    "options.transport.car": "Car",
    "options.transport.bike": "Bicycle",
    "options.transport.motorcycle": "Motorcycle / Scooter",
    "options.transport.electricScooter": "Electric Scooter",
    "options.gender.male": "Male",
    "options.gender.female": "Female",
    "options.gender.other": "Other",

    "upload.button": "Upload File",
    "upload.max": "Max file size 10MB.",
    "upload.error.size": "Upload failed. Max size is 10 MB.",
    "upload.error.type": "Upload failed. Invalid file type.",
    "upload.error.generic":
      "Upload failed. Something went wrong. Please retry.",

    "result.success": "Thanks. We’re on it.",
    "result.fail": "Oops! Something went wrong while submitting the form.",
    "result.loading.stage1": "Uploading your files...",
    "results.loading.stage2": "Verifying your information...",
    "results.loading.stage3": "Finishing up...",

    "result.verifying.stage1": "Verifying data...",
    "result.verifying.stage2": "Checking contract status...",
    "result.verifying.stage3": "Almost done...",

    "message.success":
      "Form submitted successfully. You are being redirected ...",
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
