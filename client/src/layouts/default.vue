<script setup>
import { useStore } from 'vuex'
import Header from '@/components/Header.vue'
import Main from '@/components/Main.vue'
const store = useStore()
store.dispatch('user/get')
</script>
<template>
  <Header />
  <Main>
    <router-view />
  </Main>
</template>