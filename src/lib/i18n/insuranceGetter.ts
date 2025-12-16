export async function getInsuranceOptions(locale: string) {
  const res = await fetch(
    `https://jaunpaul.github.io/Rozvazej.Registration/i18n/insurance/${locale}.json`
  );
  if (res.ok) return res.json();
  return fetch(
    "https://jaunpaul.github.io/Rozvazej.Registration/i18n/insurance/cs.json"
  ).then((r) => r.json());
}
