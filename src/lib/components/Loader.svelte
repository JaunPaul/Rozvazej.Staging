<script lang="ts">
  import { Tween } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import { t } from "../i18n/i18n.svelte";
  import { fade } from "svelte/transition";

  type Props = {
    progressText?: string[];
  };
  let {
    progressText = [
      t("result.loading.stage1"),
      t("result.loading.stage2"),
      t("result.loading.stage3"),
    ],
  }: Props = $props();
  let bar = new Tween(0, {
    easing: cubicOut,
  });

  let currentStage = $state(0);

  function progress() {
    if (currentStage === 0) bar.set(40, { duration: 1500 });
    setInterval(() => {
      if (currentStage === 2) return;
      currentStage++;

      if (currentStage === 1) bar.set(80, { duration: 5000 });
      if (currentStage === 2) bar.set(99, { duration: 7000 });
    }, 5000);
  }
  progress();
</script>

<div class="loading-container">
  {#key currentStage}
    <div in:fade>{progressText[currentStage]}</div>
  {/key}

  <div class="load-bar">
    <div class="loader" style="width: {bar.current}%"></div>
  </div>
</div>
