<script setup>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

useStore().dispatch('logout')
useRouter().push('/')

</script>
<template>
  <div>logging out...</div>
</template>