<script setup>
import { watchEffect } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

watchEffect(() => {
  if (!(store.state.token && store.state.role === 1)) {
    router.push('/')
  }
})

</script>
<template>
  <div>
    <h1>Superadmin Layout</h1>
    <router-view />
  </div>
</template>