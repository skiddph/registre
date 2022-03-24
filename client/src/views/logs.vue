<script setup>
import { watchEffect, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import RangeDatePicker from '@/components/RangeDatePicker.vue'
const store = useStore()
const router = useRouter()

const filter = ref(false)
filterHandler
document.title = "Logs | Registre"
</script>
<template>
  <RangeDatePicker
    v-if="filter"
    @cancel="filter = false"
    @submit="filterHandler"
  />
  <div class="wrapper">
    <div class="header">
      <button class="filter" @click="filter = true">Filter</button>
    </div>
  </div>
</template>
<style lang="scss">
</style>