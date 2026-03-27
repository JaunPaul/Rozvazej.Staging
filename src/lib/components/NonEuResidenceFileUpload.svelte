<script lang="ts">
  import { t } from "../i18n/i18n.svelte";
  import type { RegistrationState } from "../state/RegistrationState.svelte";
  import Errors from "./Errors.svelte";
  import FileItem from "./FileItem.svelte";

  let { registrationState }: { registrationState: RegistrationState } =
    $props();
  let filesNonEuResidenceInput: HTMLInputElement | undefined = $state();
</script>

<div class="upload">
  <label class="field-label" for="filesNonEuResidence"
    >{@html t("labels.doc.nonEuResidence")}</label
  >
  <div class="w-file-upload">
    <input
      id="filesNonEuResidence"
      name="filesNonEuResidence"
      class="w-file-upload-input"
      type="file"
      multiple
      onchange={(e) => {
        if (e.currentTarget.files) {
          registrationState.appendFiles("nonEuResidence", e.currentTarget.files);
        }
      }}
      bind:this={filesNonEuResidenceInput}
    />
    <button class="upload-button" onclick={() => filesNonEuResidenceInput?.click()}>
      <label for="File-1-2" class="w-file-upload-label">
        <div class="w-icon-file-upload-icon"></div>
        <div class="w-inline-block">
          {t("upload.button")}
        </div>
      </label></button
    >
    {#each registrationState.values.filesNonEuResidence as file}
      <FileItem f={file} b={"nonEuResidence"} {registrationState} />
    {/each}
    <div class="text-explain">
      {@html t("hints.doc.nonEuResidence")}
    </div>
  </div>
  <Errors errors={registrationState.errors} path="filesNonEuResidence" />
</div>
