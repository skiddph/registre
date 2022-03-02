<script setup>
import { ref } from 'vue'
import Scanner from '@/components/Scanner.vue'
import Legends from '@/components/Legends.vue'
const name = ref('')
const nameHandler = (employee) => {
  name.value = employee
}
</script>
<template>
  <div class="scan-wrapper">
    <Legends />
    <div class="center">
      <Scanner @name="nameHandler" />
      <div v-if="name" class="name">{{ name }}</div>
      <div class="legends">
        <Legends />
      </div>
    </div>
    <div class="spacer"></div>
  </div>
</template>
<style lang="scss" scoped>
.scan-wrapper {
  @apply w-full flex flex-row items-start justify-between;

  div:nth-child(1):not(.center){
    @apply hidden md:block;
    flex:1;
  }

  .center {
    @apply mx-auto;
    flex:3;
    max-width:520px;

    .name {
      @apply text-center py-2 font-bold text-3xl;
    }

    div:last-child:not(.name){
      @apply block md:hidden;
      flex:1;
    }
  }

  .spacer {
    @apply hidden md:block;
    flex:1;
  }
}
</style>