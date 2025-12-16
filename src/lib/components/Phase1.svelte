<script lang="ts">
  import { t } from "../i18n/i18n.svelte";
  import Loader from "./Loader.svelte";
  import { RegistrationState } from "../state/RegistrationState.svelte";
  import PersonalData from "./steps/PersonalData.svelte";
  import Citizenship from "./steps/Citizenship.svelte";
  import Address from "./steps/Address.svelte";
  import PaymentDetails from "./steps/PaymentDetails.svelte";
  import { onMount } from "svelte";

  let { registrationState }: { registrationState: RegistrationState } =
    $props();

  // Local state for this phase
  let currentSubStep = $state(1);
  let externalSteps: HTMLElement[] | [] = $state([]);
  $effect(() => {
    registrationState.toNextStepIndex = currentSubStep + 1;
  });
  const totalSubSteps = 4;

  onMount(() => {
    externalSteps = Array.from(
      document.querySelectorAll<HTMLElement>(".step-wrap")
    );
  });

  $effect(() => {
    if (!externalSteps.length || !currentSubStep) return;
    externalSteps.forEach((el, i) => {
      el.classList.toggle("is-active", i === currentSubStep - 1);
    });
  });

  // Step 1: Personal data
  // Step 2: Address
  // Step 3: Citizenship
  // Step 4: Bank

  async function next() {
    // Validate current sub-step
    // We can use the existing validation logic, but we might need to adapt it
    // since we are splitting the original "step1" and "step2" into 4 sub-steps.
    // For now, I'll rely on the state's validation method but I might need to
    // pass a specific scope or just validate everything visible.

    // SubStep 1 -> "step1"
    // SubStep 2 -> "step2"
    // SubStep 3 -> "step3"
    // SubStep 4 -> "step4"

    const validationScope =
      currentSubStep === 1
        ? "step1"
        : currentSubStep === 2
          ? "step2"
          : currentSubStep === 3
            ? "step3"
            : "step4";
    const valid = await registrationState.validateCurrentStep(validationScope);

    if (valid) {
      if (currentSubStep < totalSubSteps) {
        currentSubStep++;
      } else {
        await registrationState.submitPhase1();
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
      <h2 class="heading-form-large">
        {t("form.title")}
      </h2>
      <p class="body-text">{t("form.lead")}</p>
    </div>
    <div>
      <div class="form-heading">
        {currentSubStep === 1
          ? t("step1.title")
          : currentSubStep === 2
            ? t("step2.title")
            : currentSubStep === 3
              ? t("step3.title")
              : t("step4.title")}
      </div>
      <div class="form-line"></div>
    </div>
    <!-- Step 1: Personal data -->
    {#if currentSubStep === 1}
      <PersonalData {registrationState} />
    {/if}

    <!-- Step 2: Address -->
    {#if currentSubStep === 2}
      <Address {registrationState} />
    {/if}

    <!-- Step 3: Citizenship -->
    {#if currentSubStep === 3}
      <Citizenship {registrationState} />
    {/if}

    <!-- Step 4: Bank -->
    {#if currentSubStep === 4}
      <PaymentDetails {registrationState} />
    {/if}
  </div>
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
            : registrationState.stepNavText}
    </button>
  </div>
</div>
