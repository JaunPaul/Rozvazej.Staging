<script lang="ts">
  import { t } from "./lib/i18n/i18n.svelte";
  import Loader from "./lib/components/Loader.svelte";
  import Phase1 from "./lib/components/Phase1.svelte";
  import Phase2 from "./lib/components/Phase2.svelte";
  import { RegistrationState } from "./lib/state/RegistrationState.svelte";
  import { SubmissionStatus } from "./lib/enums/form";
  import { onMount } from "svelte";
  import { verifyUser } from "./lib/utils/helpers";
  import CloudinaryDebug from "./lib/components/CloudinaryDebug.svelte";

  const registrationState = new RegistrationState();

  let isDebugCloudinary = false;

  // Check URL params for debug=cloudinary
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    isDebugCloudinary = params.get("debug") === "cloudinary";
  }

  onMount(async () => {
    if (registrationState.currentPhase === 2) {
      const userId = registrationState.values.courierId;

      try {
        const verification = await verifyUser(userId);

        if (verification.success && verification.data.contractSigned) {
          registrationState.verificationStatus = "success";
        } else {
          registrationState.verificationStatus = "fail";
        }
        registrationState.verified = true;
      } catch (error) {
        registrationState.verificationStatus = "error";
      }
    }
  });
</script>

{#if isDebugCloudinary}
  <CloudinaryDebug />
{:else if registrationState.formState === "success"}
  <div class="message-container">
    <div class="text-16px">
      {#if registrationState.submissionStatus === SubmissionStatus.APPROVED}
        {t("messages.success")}
      {:else}
        {t("messages.rejected")}
      {/if}
    </div>
  </div>
{:else if registrationState.formState === "fail"}
  <div class="w-form-fail" style="display: block;">
    <div>{t("messages.error")}</div>
    {#if registrationState.errors?.error && typeof registrationState.errors.error === "object" && "message" in registrationState.errors.error}
      <div>{(registrationState.errors.error as any).message}</div>
    {/if}
  </div>
{:else if registrationState.submitting}
  <Loader />
{:else if registrationState.currentPhase === 2 && !registrationState.verified && registrationState.verificationStatus === "pending"}
  <Loader
    progressText={[
      t("result.verifying.stage1"),
      t("result.verifying.stage2"),
      t("result.verifying.stage3"),
    ]}
  />
{:else if registrationState.currentPhase === 2 && registrationState.verified && registrationState.verificationStatus === "fail"}
  <div class="message-container">
    <div class="text-16px">
      <strong class="bold-message"
        >Omlouváme se, vypadá to, že v našem systému nemáme záznam o uzavřené
        smlouvě.
      </strong><br />Prosíme, obraťte se na nás na e-mailu:
      <a href="mailto:info@pcsoffice.cz" target="_blank">info@pcsoffice.cz</a>,
      abychom vše společně vyřešili.<br />Děkujeme za pochopení.
    </div>
  </div>
{:else if registrationState.currentPhase === 2 && registrationState.verificationStatus === "error"}
  <div class="message-container">
    <div class="text-16px">
      <strong class="bold-message"
        >Při načítání formuláře se něco pokazilo. Nahlaste chybu
        administrátorovi.
      </strong><br />Prosíme, obraťte se na nás na e-mailu:
      <a href="mailto:info@pcsoffice.cz" target="_blank">info@pcsoffice.cz</a>,
      abychom vše společně vyřešili.<br />Děkujeme za pochopení.
    </div>
  </div>
{:else}
  <div class="form">
    {#if registrationState.formState === "neutral" || registrationState.formState === "submitting"}
      {#if registrationState.currentPhase === 1}
        <Phase1 {registrationState} />
      {:else}
        <Phase2 {registrationState} />
      {/if}
    {/if}
  </div>
{/if}
