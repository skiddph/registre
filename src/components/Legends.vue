<script setup>
import Indicator from '@/components/Indicator.vue'
</script>
<template>
  <div class="legends">
    <h3>Legends</h3>
    <div>
      <Indicator state="ready" />Ready
    </div>
    <div>
      <Indicator state="loading" />Detected
    </div>
    <div>
      <Indicator state="in" />Employee In
    </div>
    <div>
      <Indicator state="out" />Employee Out
    </div>
    <div>
      <Indicator state="error" />Error
    </div>
  </div>
</template>
<style lang="scss" scoped>
.legends {
  @apply w-full text-sm mt-6 mb-6;
  h3 {
    @apply font-bold pl-2;
  }
  div {
    @apply flex flex-row items-center justify-start;
  }
}
</style>