<script setup>
import { useStore } from 'vuex'
const store = useStore()
store.dispatch('usercount')
import Header from '@/components/Header.vue'
import Main from '@/components/Main.vue'
</script>
<template>
  <Header />
  <Main>
    <router-view />
  </Main>
</template>