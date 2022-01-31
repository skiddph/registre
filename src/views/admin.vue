<script setup>
import { watchEffect } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import AdminDashboard from '@/components/AdminDashboard.vue'

const store = useStore()
const router = useRouter()

watchEffect(() => {
  if (!(store.state.token && store.state.role === 2)) {
    router.push('/')
  }
})

</script>
<template>
    <AdminDashboard />
</template>