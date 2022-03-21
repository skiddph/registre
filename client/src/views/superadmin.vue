<script setup>
import { watchEffect } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import AdminDashboard from '@/components/AdminDashboard.vue'

const store = useStore()
const router = useRouter()

watchEffect(() => {
  if (!(store.state.user.token && store.state.user.role === 1)) {
    router.push('/')
  }
})

document.title = "Dashboard | Superadmin"
</script>
<template>
  <AdminDashboard />
</template>