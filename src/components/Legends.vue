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
      <Indicator state="loading" />Loading
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
  * {
    user-select: none;
  }
  @apply w-full text-sm md:text-base my-3 md:my-6;
  h3 {
    @apply font-bold pl-2 md:text-lg md:mb-2;
  }
  div {
    @apply flex flex-row items-center justify-start;
  }
}
.dark {
  .legends {
    h3 {
      @apply text-gray-300;
    }
    div {
      @apply text-gray-400;
    }
  }
}
</style>