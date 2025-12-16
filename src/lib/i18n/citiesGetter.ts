const BASE_URL = "https://jaunpaul.github.io/Rozvazej.Registration/i18n/cities";

const FALLBACK_LOCALE = "cs";

const extraCitiesByForm = {
  Bolt: {
    en: ["Trutnov", "Uherské Hradiště"],
    cs: ["Trutnov", "Uherské Hradiště"],
  },
  Development: {
    en: ["Trutnov", "Uherské Hradiště"],
    cs: ["Trutnov", "Uherské Hradiště", "Alphatop"],
  },
};

async function loadBaseCities(locale: string): Promise<string[]> {
  const primary = await fetch(`${BASE_URL}/${locale}.json`);
  if (primary.ok) {
    return primary.json();
  }

  const fallback = await fetch(`${BASE_URL}/${FALLBACK_LOCALE}.json`);
  if (fallback.ok) {
    return fallback.json();
  }

  return [];
}

export async function getCities(locale: string, domain: string) {
  const base = await loadBaseCities(locale);

  if (!domain || domain.length === 0) return base;

  const extraCities = extraCitiesByForm[domain];
  if (!extraCities) return base;

  const extras = extraCities[locale] ?? extraCities[FALLBACK_LOCALE] ?? [];

  return [...base, ...extras];
}
