<script lang="ts">
  import type { CustomErrors } from "../types";

  interface Props {
    errors?: CustomErrors;
    path?: string;
  }
  let { errors = {}, path = undefined }: Props = $props();
</script>

{#if path && errors[path]}
  <ul class="errors text-explain">
    {#if Array.isArray(errors[path])}
      {#each errors[path] as message}
        <li>{message}</li>
      {/each}
    {:else if typeof errors[path] === "string"}
      <li>{errors[path]}</li>
    {/if}
  </ul>
{/if}

<!-- <style>
  .errors {
    list-style-type: none;
    margin: 8px 0px 0px 0px;
    padding: 0px 0px 8px 0px;
    color: indianred;
  }
</style> -->
