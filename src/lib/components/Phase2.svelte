<script lang="ts">
  import { t } from "../i18n/i18n.svelte";
  import { RegistrationState } from "../state/RegistrationState.svelte";
  import { onMount } from "svelte";
  import BasicInformation from "./steps/phase2/BasicInformation.svelte";
  import IdentityDocument from "./steps/phase2/IdentityDocument.svelte";
  import ResidenceDocuments from "./steps/phase2/ResidenceDocuments.svelte";

  let { registrationState }: { registrationState: RegistrationState } =
    $props();

  // Local state for this phase
  let currentSubStep = $state(1);
  let totalSubSteps = $derived(
    registrationState.values.country === "CZ" ? 2 : 3,
  );
  let externalSteps: HTMLElement[] | [] = $state([]);

  onMount(() => {
    externalSteps = Array.from(
      document.querySelectorAll<HTMLElement>(".step-wrap"),
    );
    // Also toggle panel items if they exist
    const panel = Array.from(
      document.querySelectorAll<HTMLElement>(".panel-items"),
    );
    if (panel.length) {
      panel.forEach((el) => {
        el.classList.toggle("hide");
      });
    }
  });

  $effect(() => {
    if (!externalSteps.length || !currentSubStep) return;
    externalSteps.forEach((el, i) => {
      el.classList.toggle("is-active", i === currentSubStep - 1);
    });
  });

  async function next() {
    const validationScope =
      currentSubStep === 1
        ? "phase2Step1"
        : currentSubStep === 2
          ? "phase2Step2"
          : "phase2Step3";
    const valid = await registrationState.validateCurrentStep(validationScope);

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

    <!-- Step 1 – Základní informace, adresa a vozidlo / Basic Information, Address & Vehicle -->
    {#if currentSubStep === 1}
      <BasicInformation {registrationState} />
    {/if}

    <!-- Step 2 – Doklad totožnosti / Identity Document -->
    {#if currentSubStep === 2}
      <IdentityDocument {registrationState} />
    {/if}

    <!-- Step 3 – Doklad o pobytu / Residence Document -->
    {#if currentSubStep === 3}
      <ResidenceDocuments {registrationState} />
    {/if}

    <div class="form-nav">
      {#if currentSubStep > 1}
        <button
          class="button is-ghost w-button"
          onclick={prev}
          disabled={currentSubStep === 1}
          type="button"
        >
          {t("nav.prev")}
        </button>
      {:else}
        <div></div>
      {/if}

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
