<script lang="ts">
  import { t } from "../i18n/i18n.svelte";
  import type { RegistrationState } from "../state/RegistrationState.svelte";
  import Errors from "./Errors.svelte";
  import FileItem from "./FileItem.svelte";

  let { registrationState }: { registrationState: RegistrationState } =
    $props();
  let filesEuPassportInput: HTMLInputElement | undefined = $state();
</script>

<div class="upload">
  <label class="field-label" for="filesEuPassport"
    >{@html t("labels.doc.euPassport")}</label
  >
  <div class="w-file-upload">
    <input
      id="filesEuPassport"
      name="filesEuPassport"
      type="file"
      class="w-file-upload-input"
      multiple
      onchange={(e) => {
        if (e.currentTarget.files) {
          registrationState.appendFiles("euPassport", e.currentTarget.files);
        }
      }}
      bind:this={filesEuPassportInput}
    />
    <button class="upload-button" onclick={() => filesEuPassportInput?.click()}>
      <label for="File-1-2" class="w-file-upload-label">
        <div class="w-icon-file-upload-icon"></div>
        <div class="w-inline-block">
          {t("upload.button")}
        </div>
      </label></button
    >
    {#each registrationState.values.filesEuPassport as file}
      <FileItem f={file} b={"euPassport"} {registrationState} />
    {/each}
    <div class="text-explain">
      {@html t("hints.doc.euPassport")}
    </div>
  </div>
  <Errors errors={registrationState.errors} path="filesEuPassport" />
</div>
