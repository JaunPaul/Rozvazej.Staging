<script lang="ts">
  import { fade } from "svelte/transition";
  import type { RegistrationState } from "../../state/RegistrationState.svelte";
  import Errors from "../Errors.svelte";
  import { t } from "../../i18n/i18n.svelte";

  let { registrationState }: { registrationState: RegistrationState } =
    $props();
</script>

<div in:fade class="box has-8-gap">
  <div class="input-group-wrap">
    <div class="input-wrap">
      <label for="firstName" class="field-label">{t("labels.firstName")}</label>
      <input
        class="input-2 w-input"
        type="text"
        id="firstName"
        name="firstName"
        placeholder={t("ph.firstName")}
        bind:value={registrationState.values.firstName}
        onblur={() => registrationState.onBlurName("firstName")}
      />
      <Errors errors={registrationState.errors} path="firstName" />
    </div>
    <div class="input-wrap">
      <label for="lastName" class="field-label">{t("labels.lastName")}</label>
      <input
        class="input-2 w-input"
        type="text"
        id="lastName"
        name="lastName"
        placeholder={t("ph.lastName")}
        bind:value={registrationState.values.lastName}
        onblur={() => registrationState.onBlurName("lastName")}
      />
      <Errors errors={registrationState.errors} path="lastName" />
    </div>
  </div>

  <div class="input-group-wrap">
    <div class="input-wrap">
      <label for="phone" class="field-label">{t("labels.phone")}</label>
      <input
        class="input-2 w-input"
        type="text"
        id="phone"
        name="phone"
        placeholder={t("ph.phone")}
        bind:value={registrationState.values.phone}
        onblur={() => registrationState.onBlurPhone()}
      />
      <div class="text-explain">
        {@html t("hints.czPhone")}
      </div>
      <Errors errors={registrationState.errors} path="phone" />
    </div>
    <div class="input-wrap">
      <label for="email" class="field-label">{t("labels.email")}</label>
      <input
        class="input-2 w-input"
        type="email"
        id="email"
        name="email"
        placeholder={t("ph.email")}
        bind:value={registrationState.values.email}
        onblur={() => registrationState.onBlurEmail()}
      />
      <div class="text-explain">
        {@html t("hints.useRealEmail")}
      </div>
      <Errors errors={registrationState.errors} path="email" />
    </div>
  </div>
</div>
