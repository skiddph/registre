<script setup>
import { onMounted } from 'vue'
import { useStore } from 'vuex'
const store = useStore()

onMounted(() => store.dispatch('darkModeInit'))

</script>
<template>
  <router-view />
</template>