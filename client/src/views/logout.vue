<script setup>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
store.dispatch('dashboard/reset')
store.dispatch('user/reset')
store.dispatch('system/reset')
useRouter().push('/')

</script>
<template>
  <div>logging out...</div>
</template>