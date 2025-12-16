<script lang="ts">
  import { t } from "../i18n/i18n.svelte";
  import type { RegistrationState } from "../state/RegistrationState.svelte";
  import Errors from "./Errors.svelte";
  import FileItem from "./FileItem.svelte";

  let { registrationState }: { registrationState: RegistrationState } =
    $props();
  let filesDriversLicenseInput: HTMLInputElement | undefined = $state();
</script>

<div class="upload">
  <label class="field-label" for="filesDriversLicense"
    >{@html t("labels.doc.driversLicense")}</label
  >
  <div class="w-file-upload">
    <input
      id="filesDriversLicense"
      name="filesDriversLicense"
      type="file"
      class="w-file-upload-input"
      multiple
      onchange={(e) => {
        if (e.currentTarget.files) {
          registrationState.appendFiles(
            "driversLicense",
            e.currentTarget.files,
          );
        }
      }}
      bind:this={filesDriversLicenseInput}
    />
    <button
      class="upload-button"
      onclick={() => filesDriversLicenseInput?.click()}
    >
      <label for="File-1-2" class="w-file-upload-label">
        <div class="w-icon-file-upload-icon"></div>
        <div class="w-inline-block">
          {t("upload.button")}
        </div>
      </label></button
    >
    {#each registrationState.values.filesDriversLicense as file}
      <FileItem f={file} b={"driversLicense"} {registrationState} />
    {/each}
    <div class="text-explain">
      {@html t("hints.doc.filesDriversLicense")}
    </div>
  </div>
  <Errors errors={registrationState.errors} path="filesDriversLicense" />
</div>
