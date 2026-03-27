<script lang="ts">
  import { t } from "../i18n/i18n.svelte";
  import type { RegistrationState } from "../state/RegistrationState.svelte";
  import Errors from "./Errors.svelte";
  import FileItem from "./FileItem.svelte";

  let { registrationState }: { registrationState: RegistrationState } =
    $props();
  let filesEuResidenceInput: HTMLInputElement | undefined = $state();
</script>

<div class="upload">
  <label class="field-label" for="filesEuResidence"
    >{@html t("labels.doc.euResidence")}</label
  >
  <div class="w-file-upload">
    <input
      id="filesEuResidence"
      name="filesEuResidence"
      type="file"
      class="w-file-upload-input"
      multiple
      onchange={(e) => {
        if (e.currentTarget.files) {
          registrationState.appendFiles("euResidence", e.currentTarget.files);
        }
      }}
      bind:this={filesEuResidenceInput}
    />
    <button
      class="upload-button"
      onclick={() => filesEuResidenceInput?.click()}
    >
      <label for="File-1-2" class="w-file-upload-label">
        <div class="w-icon-file-upload-icon"></div>
        <div class="w-inline-block">
          {t("upload.button")}
        </div>
      </label></button
    >
    {#each registrationState.values.filesEuResidence as file}
      <FileItem f={file} b={"euResidence"} {registrationState} />
    {/each}
    <div class="text-explain">
      {@html t("hints.doc.euResidence")}
    </div>
  </div>
  <Errors errors={registrationState.errors} path="filesEuResidence" />
</div>
