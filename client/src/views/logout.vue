<script setup>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

useStore().dispatch('user/reset')
useRouter().push('/')

</script>
<template>
  <div>logging out...</div>
</template>