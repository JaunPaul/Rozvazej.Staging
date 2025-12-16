<script lang="ts">
  import { fade } from "svelte/transition";
  import type { RegistrationState } from "../../state/RegistrationState.svelte";
  import Errors from "../Errors.svelte";
  import { t } from "../../i18n/i18n.svelte";
  import { getCountries } from "../../i18n/countriesGetter";

  let { registrationState }: { registrationState: RegistrationState } =
    $props();

  const toDateInputValue = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const fifteenYearsAgo = new Date(
    today.getFullYear() - 15,
    today.getMonth(),
    today.getDate(),
  );

  const maxBirthDate = toDateInputValue(fifteenYearsAgo);
</script>

<div in:fade class="box has-8-gap">
  <div class="input-wrap">
    <label for="country" class="field-label">{t("labels.citizenship")}</label>
    <select
      class="input-2"
      id="country"
      name="country"
      bind:value={registrationState.values.country}
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
    <Errors errors={registrationState.errors} path="country" />
  </div>

  {#if registrationState.values.country === "CZ"}
    <div class="input-wrap">
      <label for="nationalId" class="field-label"
        >{t("labels.nationalId")}</label
      >
      <input
        class="input-2 w-input"
        type="text"
        id="nationalId"
        name="nationalId"
        placeholder={t("ph.nationalId")}
        bind:value={registrationState.values.nationalId}
      />
      <Errors errors={registrationState.errors} path="nationalId" />
    </div>
  {:else if registrationState.values.country}
    <div class="input-wrap">
      <label for="passportOrId" class="field-label"
        >{t("labels.passportOrId")}</label
      >
      <input
        class="input-2 w-input"
        type="text"
        id="passportOrId"
        name="passportOrId"
        placeholder={t("ph.passportOrId")}
        bind:value={registrationState.values.passportOrId}
      />
      <Errors errors={registrationState.errors} path="passportOrId" />
    </div>

    <div class="input-wrap">
      <label for="birthDate" class="field-label">{t("labels.birthDate")}</label>
      <input
        class="input-2 w-input"
        type="date"
        id="birthDate"
        name="birthDate"
        max={maxBirthDate}
        bind:value={registrationState.values.birthDate}
      />
      <Errors errors={registrationState.errors} path="birthDate" />
    </div>
  {/if}
</div>
