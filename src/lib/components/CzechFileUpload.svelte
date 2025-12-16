<script lang="ts">
  import { t } from "../i18n/i18n.svelte";
  import type { RegistrationState } from "../state/RegistrationState.svelte";
  import Errors from "./Errors.svelte";
  import FileItem from "./FileItem.svelte";

  let { registrationState }: { registrationState: RegistrationState } =
    $props();
  let filesNationalIdInput: HTMLInputElement | undefined = $state();
</script>

<div class="upload">
  <label class="field-label" for="filesNationalId"
    >{@html t("labels.doc.nationalId")}</label
  >
  <div class="w-file-upload">
    <input
      id="filesNationalId"
      name="filesNationalId"
      type="file"
      class="w-file-upload-input"
      multiple
      onchange={(e) => {
        if (e.currentTarget.files) {
          registrationState.appendFiles("nationalId", e.currentTarget.files);
        }
      }}
      bind:this={filesNationalIdInput}
    />
    <button class="upload-button" onclick={() => filesNationalIdInput?.click()}>
      <label for="File-1-2" class="w-file-upload-label">
        <div class="w-icon-file-upload-icon"></div>
        <div class="w-inline-block">
          {t("upload.button")}
        </div>
      </label></button
    >
    {#each registrationState.values.filesNationalId as file}
      <FileItem f={file} b={"nationalId"} {registrationState} />
    {/each}
    <div class="text-explain">
      {@html t("hints.doc.nationalId")}
    </div>
  </div>
  <Errors errors={registrationState.errors} path="filesNationalId" />
</div>
