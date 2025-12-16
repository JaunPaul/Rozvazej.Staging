<script lang="ts">
  import { fade } from "svelte/transition";
  import type { RegistrationState } from "../../state/RegistrationState.svelte";
  import Errors from "../Errors.svelte";
  import { t } from "../../i18n/i18n.svelte";
  import { getCities } from "../../i18n/citiesGetter";

  let { registrationState }: { registrationState: RegistrationState } =
    $props();

  // $effect that triggers search when active field changes
  $effect(() => {
    if (!registrationState.activeAddressType) return;
    // track just the active field's value
    const q = registrationState.currentQueryFor(
      registrationState.activeAddressType,
    );
    void q; // establish reactive read
    registrationState.queueSearchForActive();
  });

  // $effects that reset __addressFromSuggestion flag when user manually edits
  $effect(() => {
    void registrationState.values.street;
    registrationState.values.__addressFromSuggestion = false;
  });
  $effect(() => {
    void registrationState.values.houseNumber;
    registrationState.values.__addressFromSuggestion = false;
  });
  $effect(() => {
    void registrationState.values.city;
    registrationState.values.__addressFromSuggestion = false;
  });
  $effect(() => {
    void registrationState.values.zip;
    registrationState.values.__addressFromSuggestion = false;
  });
</script>

<div in:fade class="box has-8-gap">
  <div class="input-group-wrap">
    <div class="input-wrap relative">
      <label for="street" class="field-label">{t("labels.street")}</label>
      <input
        class="input-2 w-input"
        type="text"
        id="street"
        name="street"
        placeholder=""
        bind:value={registrationState.values.street}
        onfocus={() => registrationState.onAddressFocus("street")}
        onblur={() => registrationState.onAddressBlur()}
      />
      <Errors errors={registrationState.errors} path="street" />
      {#if registrationState.activeAddressType === "street" && registrationState.addressSuggestions.length}
        <ul class="sugg" role="listbox">
          {#each registrationState.addressSuggestions as s}
            <li
              role="option"
              aria-selected="false"
              onmousedown={() => registrationState.applySuggestion(s)}
            >
              {s.streetWithNumber || s.full}
              {#if s.city || s.postalCode}
                <small>
                  — {s.city}{s.postalCode ? `, ${s.postalCode}` : ""}</small
                >
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <div class="input-wrap relative">
      <label for="houseNumber" class="field-label"
        >{t("labels.houseNumber")}</label
      >
      <input
        class="input-2 w-input"
        type="text"
        id="houseNumber"
        name="houseNumber"
        placeholder=""
        bind:value={registrationState.values.houseNumber}
        onfocus={() => registrationState.onAddressFocus("number.full")}
        onblur={() => registrationState.onAddressBlur()}
      />
      <Errors errors={registrationState.errors} path="houseNumber" />
      {#if registrationState.activeAddressType === "number.full" && registrationState.addressSuggestions.length}
        <ul class="sugg" role="listbox">
          {#each registrationState.addressSuggestions as s}
            <li
              role="option"
              aria-selected="false"
              onmousedown={() => registrationState.applySuggestion(s)}
            >
              {s.streetWithNumber || s.full}
              {#if s.city || s.postalCode}
                <small>
                  — {s.city}{s.postalCode ? `, ${s.postalCode}` : ""}</small
                >
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
  <div class="input-group-wrap">
    <div class="input-wrap relative">
      <label for="city" class="field-label">{t("labels.city")}</label>
      <input
        class="input-2 w-input"
        type="text"
        id="city"
        name="city"
        placeholder=""
        bind:value={registrationState.values.city}
        onfocus={() => registrationState.onAddressFocus("city")}
        onblur={() => registrationState.onAddressBlur()}
      />
      <Errors errors={registrationState.errors} path="city" />
      {#if registrationState.activeAddressType === "city" && registrationState.addressSuggestions.length}
        <ul class="sugg" role="listbox">
          {#each registrationState.addressSuggestions as s}
            <li
              role="option"
              aria-selected="false"
              onmousedown={() => registrationState.applySuggestion(s)}
            >
              {s.streetWithNumber || s.full}
              {#if s.city || s.postalCode}
                <small>
                  — {s.city}{s.postalCode ? `, ${s.postalCode}` : ""}</small
                >
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <div class="input-wrap relative">
      <label for="zip" class="field-label">{t("labels.zip")}</label>
      <input
        class="input-2 w-input"
        type="text"
        id="zip"
        name="zip"
        placeholder=""
        bind:value={registrationState.values.zip}
        onfocus={() => registrationState.onAddressFocus("zip")}
        onblur={() => registrationState.onAddressBlur()}
      />
      <Errors errors={registrationState.errors} path="zip" />
      {#if registrationState.activeAddressType === "zip" && registrationState.addressSuggestions.length}
        <ul class="sugg" role="listbox">
          {#each registrationState.addressSuggestions as s}
            <li
              role="option"
              aria-selected="false"
              onmousedown={() => registrationState.applySuggestion(s)}
            >
              {s.streetWithNumber || s.full}
              {#if s.city || s.postalCode}
                <small>
                  — {s.city}{s.postalCode ? `, ${s.postalCode}` : ""}</small
                >
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
  <div class="input-wrap">
    <label for="deliveryCity" class="field-label"
      >{t("labels.cityToDeliver")}</label
    >
    <select
      class="input-2 w-select"
      id="deliveryCity"
      name="deliveryCity"
      bind:value={registrationState.values.deliveryCity}
    >
      <option value="" disabled>{t("select.placeholder.city")}</option>
      {#await getCities("cs", registrationState.values.deliveryCompany[0] || "") then cities}
        {#each [...cities].sort() as city}
          <option value={city}>{city}</option>
        {/each}
      {/await}
    </select>
    <Errors errors={registrationState.errors} path="deliveryCity" />
  </div>
</div>
