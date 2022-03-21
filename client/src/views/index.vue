<script setup>
import { watchEffect } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

watchEffect(async () => {
  await store.dispatch('user/get')

  console.log(store.state.user.sac)

  if (store.state.user.token) {
    if (store.state.user.role === 1) {
      router.push('/superadmin')
    } else if (store.state.user.role === 2) {
      router.push('/admin')
    } else {
      router.push('/logout')
    }
  } else if (store.state.user.sac > 0) {
    router.push('/scan')
  } else {
    console.log(store.state.user.toke)
    router.push('/register')
  }
})

</script>
<template>
  <div>loading...</div>
</template>