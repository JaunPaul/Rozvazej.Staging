<script lang="ts">
  import type { RegistrationState } from "../state/RegistrationState.svelte";

  type Props = {
    f: File;
    b: any;
    registrationState: RegistrationState;
  };
  let { f, b, registrationState }: Props = $props();
  function removeFile(bucket: any, file: File) {
    registrationState.removeFile(bucket, file);
  }
</script>

<div tabindex="-1" class="w-file-upload-success mt-4 mr-2">
  <div class="w-file-upload-file">
    <div class="w-file-upload-file-name">{f.name}</div>
    <button
      aria-label="Remove file"
      tabindex="0"
      class="w-file-remove-link"
      onclick={() => removeFile(b, f)}
    >
      <div class="w-icon-file-upload-remove"></div>
    </button>
  </div>
</div>
