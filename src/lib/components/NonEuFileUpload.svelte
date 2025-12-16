<script lang="ts">
  import { t } from "../i18n/i18n.svelte";
  import type { RegistrationState } from "../state/RegistrationState.svelte";
  import Errors from "./Errors.svelte";
  import FileItem from "./FileItem.svelte";

  let { registrationState }: { registrationState: RegistrationState } =
    $props();
  let filesnonEuInput: HTMLInputElement | undefined = $state();
</script>

<div class="upload">
  <label class="field-label" for="filesNonEu"
    >{@html t("labels.doc.nonEu")}</label
  >
  <div class="w-file-upload">
    <input
      id="filesNonEu"
      name="filesNonEu"
      class="w-file-upload-input"
      type="file"
      multiple
      onchange={(e) => {
        if (e.currentTarget.files) {
          registrationState.appendFiles("nonEu", e.currentTarget.files);
        }
      }}
      bind:this={filesnonEuInput}
    />
    <button class="upload-button" onclick={() => filesnonEuInput?.click()}>
      <label for="File-1-2" class="w-file-upload-label">
        <div class="w-icon-file-upload-icon"></div>
        <div class="w-inline-block">
          {t("upload.button")}
        </div>
      </label></button
    >
    {#each registrationState.values.filesNonEu as file}
      <FileItem f={file} b={"nonEu"} {registrationState} />
    {/each}
    <div class="text-explain">
      {@html t("hints.doc.nonEu")}
    </div>
  </div>
  <Errors errors={registrationState.errors} path="filesNonEu" />
</div>
