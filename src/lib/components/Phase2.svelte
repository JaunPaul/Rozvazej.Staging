<script lang="ts">
  import { t } from "../i18n/i18n.svelte";
  import Errors from "./Errors.svelte";
  import { RegistrationState } from "../state/RegistrationState.svelte";
  import { fade } from "svelte/transition";
  import { isEu } from "../i18n/euCountriesFilter";
  import { getCountries } from "../i18n/countriesGetter";
  import CzechFileUpload from "./CzechFileUpload.svelte";
  import EuFileUpload from "./EuFileUpload.svelte";
  import NonEuFileUpload from "./NonEuFileUpload.svelte";
  import DriversLicenseUpload from "./DriversLicenseUpload.svelte";
  import { onMount } from "svelte";

  let { registrationState }: { registrationState: RegistrationState } =
    $props();

  // Local state for this phase
  let currentSubStep = $state(1);
  const totalSubSteps = 1;

  // SubStep 1: Documents (moved from original Step 2)
  // SubStep 2: Additional Info (Delivery, Insurance, etc.)

  async function next() {
    // Validate
    // Phase 2 has only one step now
    const validationScope = "phase2"; // Mapping to original scopes roughly
    const valid = await registrationState.validateCurrentStep(
      validationScope as any
    );
    if (valid) {
      if (currentSubStep < totalSubSteps) {
        currentSubStep++;
      } else {
        await registrationState.submitPhase2();
      }
    }
  }

  function prev() {
    if (currentSubStep > 1) {
      currentSubStep--;
    }
  }

  const toDateInputValue = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const minPassportExpiry = toDateInputValue(today);
  onMount(() => {
    const panel = Array.from(
      document.querySelectorAll<HTMLElement>(".panel-items")
    );
    if (panel.length) {
      panel.forEach((el, i) => {
        el.classList.toggle("hide");
      });
    }
  });
</script>

<div class="form-step is-active">
  <div class="box has-24-gap">
    <div class="form-heading-wrap">
      <h2 class="heading-form-large">{t("form.title")}</h2>
      <p class="body-text">{t("form.lead")}</p>
    </div>
    <div class="box has-8-gap">
      <div class="form-heading">
        {t("phase2.title")}
      </div>
      <div class="form-line"></div>
    </div>
    <!-- Step 1: Documents -->
    {#if currentSubStep === 1}
      <div in:fade class="box has-8-gap">
        {#if registrationState.askCountryAgain}
          <div class="input-wrap">
            <label for="country" class="field-label"
              >{t("labels.citizenship")}</label
            >
            <select
              class="input-2"
              id="country"
              bind:value={registrationState.values.country}
            >
              <option value="" disabled
                >{t("select.placeholder.country")}</option
              >
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
        {/if}

        <div class="input-wrap">
          <label for="transport" class="field-label"
            >{t("labels.transport")}</label
          >
          <select
            class="input-2"
            id="transport"
            name="transport"
            bind:value={registrationState.values.transport}
          >
            <option value="" disabled
              >{t("select.placeholder.transport")}</option
            >
            <option value="auto">{t("options.transport.car")}</option>
            <option value="kolo">{t("options.transport.bike")}</option>
            <option value="motorka">{t("options.transport.motorcycle")}</option>
            <option value="el-kolobezka"
              >{t("options.transport.electricScooter")}</option
            >
          </select>
          <Errors errors={registrationState.errors} path="transport" />
        </div>

        <!-- Drivers License if Auto -->
        {#if registrationState.values.transport === "auto"}
          <DriversLicenseUpload {registrationState}></DriversLicenseUpload>
        {/if}

        <div class="input-group-wrap">
          <div class="input-wrap">
            <label for="gender" class="field-label">{t("labels.gender")}</label>
            <select
              class="input-2"
              id="gender"
              name="gender"
              bind:value={registrationState.values.gender}
            >
              <option value="" disabled>{t("select.placeholder.gender")}</option
              >
              <option value="muž">{t("options.gender.male")}</option>
              <option value="žena">{t("options.gender.female")}</option>
            </select>
            <Errors errors={registrationState.errors} path="gender" />
          </div>
        </div>

        {#snippet documentFields(documentNumberLabel: string)}
          <div class="input-wrap">
            <label for="documentNumber" class="field-label"
              >{documentNumberLabel}</label
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
            <Errors
              errors={registrationState.errors}
              path="documentExpiryDate"
            />
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
              <option value="" disabled
                >{t("select.placeholder.country")}</option
              >
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
              path="documentIssuingCountry"
            />
          </div>
        {/snippet}

        {#snippet residenceFields()}
          <div class="input-wrap">
            <label for="placeOfBirth" class="field-label"
              >{t("labels.placeOfBirth")}</label
            ><input
              class="input-2 w-input"
              name="placeOfBirth"
              data-name="placeOfBirth"
              type="text"
              id="placeOfBirth"
              placeholder={t("ph.placeOfBirth")}
              bind:value={registrationState.values.placeOfBirth}
            />
            <Errors errors={registrationState.errors} path="placeOfBirth" />
          </div>

          <div class="box has-8-gap">
            <div class="form-heading">
              {t("labels.permanentResidence")}
            </div>
            <div class="form-line"></div>
          </div>
          <div>
            <div class="input-group-wrap">
              <div class="input-wrap relative">
                <label for="permanentResidenceStreet" class="field-label"
                  >{t("labels.street")}</label
                >
                <input
                  class="input-2 w-input"
                  type="text"
                  id="permanentResidenceStreet"
                  name="permanentResidenceStreet"
                  placeholder={t("ph.permanentResidenceStreet")}
                  bind:value={registrationState.values.permanentResidenceStreet}
                />
                <Errors
                  errors={registrationState.errors}
                  path="permanentResidenceStreet"
                />
              </div>
              <div class="input-wrap relative">
                <label for="permanentResidenceStreetNumber" class="field-label"
                  >{t("labels.houseNumber")}</label
                >
                <input
                  class="input-2 w-input"
                  type="text"
                  id="permanentResidenceStreetNumber"
                  name="permanentResidenceStreetNumber"
                  placeholder={t("ph.permanentResidenceStreetNumber")}
                  bind:value={
                    registrationState.values.permanentResidenceStreetNumber
                  }
                />
                <Errors
                  errors={registrationState.errors}
                  path="permanentResidenceStreetNumber"
                />
              </div>
            </div>
            <div class="input-group-wrap">
              <div class="input-wrap relative">
                <label for="permanentResidenceCity" class="field-label"
                  >{t("labels.city")}</label
                >
                <input
                  class="input-2 w-input"
                  type="text"
                  id="permanentResidenceCity"
                  name="permanentResidenceCity"
                  placeholder={t("ph.permanentResidenceCity")}
                  bind:value={registrationState.values.permanentResidenceCity}
                />
                <Errors
                  errors={registrationState.errors}
                  path="permanentResidenceCity"
                />
              </div>
              <div class="input-wrap">
                <label for="permanentResidenceCountry" class="field-label"
                  >{t("labels.permanentResidenceCountry")}</label
                >
                <select
                  class="input-2"
                  id="permanentResidenceCountry"
                  name="permanentResidenceCountry"
                  bind:value={
                    registrationState.values.permanentResidenceCountry
                  }
                >
                  <option value="" disabled
                    >{t("select.placeholder.country")}</option
                  >
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
                  path="permanentResidenceCountry"
                />
              </div>
            </div>
          </div>
        {/snippet}

        {#if registrationState.values.country === "CZ"}
          <CzechFileUpload {registrationState}></CzechFileUpload>

          {@render documentFields(t("labels.documentNumberEu"))}
        {/if}

        {#if registrationState.values.country.length > 0 && registrationState.values.country !== "CZ"}
          {#if registrationState.values.country && isEu(registrationState.values.country) && registrationState.values.country !== "CZ"}
            <EuFileUpload {registrationState}></EuFileUpload>
            {@render documentFields(t("labels.documentNumberEu"))}
          {/if}

          {#if registrationState.values.country && !isEu(registrationState.values.country) && registrationState.values.country !== "CZ"}
            <NonEuFileUpload {registrationState}></NonEuFileUpload>
            {@render documentFields(t("labels.documentNumberNonEu"))}
          {/if}
          {@render residenceFields()}
        {/if}
      </div>
    {/if}

    <div class="form-nav">
      <div></div>

      <button
        class="button w-button"
        onclick={next}
        disabled={registrationState.validating || registrationState.submitting}
        type="button"
      >
        {registrationState.validating
          ? t("nav.validate")
          : registrationState.submitting
            ? t("nav.wait")
            : currentSubStep === totalSubSteps
              ? t("nav.submit")
              : registrationState.stepNavTextPaseTwo}
      </button>
    </div>
  </div>
</div>
