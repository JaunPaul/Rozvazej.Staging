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
  import EuResidenceFileUpload from "../../EuResidenceFileUpload.svelte";
  import NonEuResidenceFileUpload from "../../NonEuResidenceFileUpload.svelte";

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

{#snippet documentFields(documentNumberLabel: string)}
  <div class="input-wrap">
    <label for="residenceDocumentNumber" class="field-label"
      >{documentNumberLabel}</label
    >
    <input
      class="input-2 w-input"
      type="text"
      id="residenceDocumentNumber"
      name="residenceDocumentNumber"
      placeholder={t("ph.documentNumber")}
      bind:value={registrationState.values.residenceDocumentNumber}
    />
    <Errors errors={registrationState.errors} path="residenceDocumentNumber" />
  </div>
  <div class="input-wrap">
    <label for="residenceDocumentExpiryDate" class="field-label"
      >{t("labels.documentExpiryDate")}</label
    ><input
      class="input-2 w-input"
      maxlength="256"
      name="residenceDocumentExpiryDate"
      data-name="residenceDocumentExpiryDate"
      type="date"
      id="residenceDocumentExpiryDate"
      min={minPassportExpiry}
      bind:value={registrationState.values.residenceDocumentExpiryDate}
    />
    <Errors
      errors={registrationState.errors}
      path="residenceDocumentExpiryDate"
    />
  </div>

  <div class="input-wrap">
    <label for="residenceDocumentIssuingCountry" class="field-label"
      >{t("labels.documentIssuingCountry")}</label
    >
    <select
      class="input-2"
      id="residenceDocumentIssuingCountry"
      name="residenceDocumentIssuingCountry"
      bind:value={registrationState.values.residenceDocumentIssuingCountry}
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
    <Errors
      errors={registrationState.errors}
      path="residenceDocumentIssuingCountry"
    />
  </div>
{/snippet}

<div in:fade class="box has-8-gap">
  {#if registrationState.values.country.length > 0 && registrationState.values.country !== "CZ"}
    {#if registrationState.values.country && isEu(registrationState.values.country) && registrationState.values.country !== "CZ"}
      <div class="input-group-wrap">
        <div class="input-wrap">
          <label for="residenceDocumentType" class="field-label"
            >{t("labels.residenceDocumentType")}</label
          >
          <select
            class="input-2"
            id="residenceDocumentType"
            name="residenceDocumentType"
            bind:value={registrationState.values.residenceDocumentType}
          >
            <option value="" disabled
              >{t("select.placeholder.residenceDocumentType")}</option
            >
            <option value="Přechodný pobyt"
              >{t("options.residenceDocumentType.temp")}</option
            >
            <option value="Trvalý pobyt"
              >{t("options.residenceDocumentType.perma")}</option
            >
            <option value="občanský průkaz"
              >{t("options.documentType.id")}</option
            >
            <option value="pas">{t("options.documentType.passport")}</option>
          </select>
          <Errors
            errors={registrationState.errors}
            path="residenceDocumentType"
          />
        </div>
      </div>
      {@render documentFields(t("labels.documentNumberEu"))}
      <EuResidenceFileUpload {registrationState}></EuResidenceFileUpload>
    {/if}

    {#if registrationState.values.country && !isEu(registrationState.values.country) && registrationState.values.country !== "CZ"}
      <div class="input-group-wrap">
        <div class="input-wrap">
          <label for="residenceDocumentType" class="field-label"
            >{t("labels.residenceDocumentType")}</label
          >
          <select
            class="input-2"
            id="residenceDocumentType"
            name="residenceDocumentType"
            bind:value={registrationState.values.residenceDocumentType}
          >
            <option value="" disabled
              >{t("select.placeholder.residenceDocumentType")}</option
            >
            <option value="Přechodný pobyt"
              >{t("options.residenceDocumentType.temp")}</option
            >
            <option value="Trvalý pobyt"
              >{t("options.residenceDocumentType.perma")}</option
            >
            <option value="Krátkodobé vízum"
              >{t("options.residenceDocumentType.shortVisa")}</option
            >
            <option value="Dlouhodobé vízum"
              >{t("options.residenceDocumentType.longVisa")}</option
            >
            <option value="Studium"
              >{t("options.residenceDocumentType.study")}</option
            >
            <option value="Dočasná ochrana"
              >{t("options.residenceDocumentType.tempProtection")}</option
            >
            <option value="Mezinárodní ochrana"
              >{t("options.residenceDocumentType.intlProtection")}</option
            >
            <option value="Dlouhodobý pobyt (kód 95)"
              >{t("options.residenceDocumentType.code95")}</option
            >
            <option value="Dlouhodobý pobyt (kód 99)"
              >{t("options.residenceDocumentType.code99")}</option
            >
            <option value="Dlouhodobý pobyt (kód 670)"
              >{t("options.residenceDocumentType.code670")}</option
            >
          </select>
          <Errors
            errors={registrationState.errors}
            path="residenceDocumentType"
          />
        </div>
      </div>
      {@render documentFields(t("labels.documentNumberNonEu"))}
      <NonEuResidenceFileUpload {registrationState}></NonEuResidenceFileUpload>
    {/if}
  {/if}
</div>
