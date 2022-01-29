<script setup>
import { watchEffect } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

watchEffect(async () => {
  await store.dispatch('usercount')

  if (store.state.token) {
    if (store.state.role === 1) {
      router.push('/superadmin')
    } else if (store.state.role === 2) {
      router.push('/admin')
    } else {
      router.push('/logout')
    }
  } else if (store.state.usercount > 0) {
    router.push('/scan')
  } else {
    router.push('/register')
  }
})

</script>
<template>
  <div>loading...</div>
</template>
<route lang="yaml">
layout: default
</route>