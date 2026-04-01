<script lang="ts">
  import { fade } from "svelte/transition";
  import type { RegistrationState } from "../../../state/RegistrationState.svelte";
  import Errors from "../../Errors.svelte";
  import { t } from "../../../i18n/i18n.svelte";
  import { getCountries } from "../../../i18n/countriesGetter";
  import CzechFileUpload from "../../CzechFileUpload.svelte";
  import EuFileUpload from "../../EuFileUpload.svelte";
  import NonEuFileUpload from "../../NonEuFileUpload.svelte";
  import { isEu } from "../../../i18n/euCountriesFilter";

  let { registrationState }: { registrationState: RegistrationState } =
    $props();
  const toDateInputValue = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const minPassportExpiry = toDateInputValue(today);
</script>

{#snippet documentFields(documentNumberLabel: string, lang: string)}
  <div class="input-group-wrap">
    <div class="input-wrap">
      <label for="documentType" class="field-label"
        >{t("labels.documentType")}</label
      >
      <select
        class="input-2"
        id="documentType"
        name="documentType"
        bind:value={registrationState.values.documentType}
      >
        <option value="" disabled>{t("select.placeholder.documentType")}</option
        >
        {#if lang === "CZ"}
          <option value="občanský průkaz">{t("options.documentType.id")}</option
          >
        {:else if !isEu(lang) === true}
          <option value="pas">{t("options.documentType.passport")}</option>
        {:else}
          <option value="občanský průkaz">{t("options.documentType.id")}</option
          >
          <option value="pas">{t("options.documentType.passport")}</option>
        {/if}
      </select>
      <Errors errors={registrationState.errors} path="documentType" />
    </div>
  </div>

  <div class="input-wrap">
    <label for="documentNumber" class="field-label">{documentNumberLabel}</label
    >
    <input
      class="input-2 w-input"
      type="text"
      id="documentNumber"
      name="documentNumber"
      placeholder={t("ph.documentNumber")}
      bind:value={registrationState.values.documentNumber}
    />
    <Errors errors={registrationState.errors} path="documentNumber" />
  </div>

  <div class="input-wrap">
    <label for="documentExpiryDate" class="field-label"
      >{t("labels.documentExpiryDate")}</label
    ><input
      class="input-2 w-input"
      maxlength="256"
      name="documentExpiryDate"
      data-name="documentExpiryDate"
      type="date"
      id="documentExpiryDate"
      min={minPassportExpiry}
      bind:value={registrationState.values.documentExpiryDate}
    />
    <Errors errors={registrationState.errors} path="documentExpiryDate" />
  </div>

  <div class="input-wrap">
    <label for="documentIssuingCountry" class="field-label"
      >{t("labels.documentIssuingCountry")}</label
    >
    <select
      class="input-2"
      id="documentIssuingCountry"
      name="documentIssuingCountry"
      bind:value={registrationState.values.documentIssuingCountry}
    >
      <option value="" disabled>{t("select.placeholder.country")}</option>
      {#await getCountries("cs") then countries}
        {#each countries as country}
          {#each Object.entries(country) as [code, name]}
            <option value={code}>{name}</option>
          {/each}
        {/each}
      {/await}
    </select>
    <Errors errors={registrationState.errors} path="documentIssuingCountry" />
  </div>
{/snippet}

<div in:fade class="box has-8-gap">
  {#if registrationState.values.country === "CZ"}
    {@render documentFields(
      t("labels.documentNumberEu"),
      registrationState.values.country,
    )}
    <CzechFileUpload {registrationState}></CzechFileUpload>
  {/if}

  {#if registrationState.values.country.length > 0 && registrationState.values.country !== "CZ"}
    {#if registrationState.values.country && isEu(registrationState.values.country) && registrationState.values.country !== "CZ"}
      {@render documentFields(
        t("labels.documentNumberEu"),
        registrationState.values.country,
      )}
      <EuFileUpload {registrationState}></EuFileUpload>
    {/if}

    {#if registrationState.values.country && !isEu(registrationState.values.country) && registrationState.values.country !== "CZ"}
      {@render documentFields(
        t("labels.documentNumberNonEu"),
        registrationState.values.country,
      )}
      <NonEuFileUpload {registrationState}></NonEuFileUpload>
    {/if}
  {/if}
</div>
