<script setup>
import { watchEffect, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
const store = useStore()
const router = useRouter()

const route = ref('')

watchEffect(() => {
  route.value = router.currentRoute.value.name
})

</script>
<template>
  <div v-if="!store.state.token" class="navbar-container">
    <div class="navbar">
      <router-link class="brand" to="/">{{ store.state.app.name || 'Logbook' }}</router-link>
      <div class="spacer"></div>
      <router-link v-if="route !== 'login'" class="link" to="/login">LOGIN</router-link>
      <router-link v-if="route !== 'register'" class="link" to="/register">REGISTER</router-link>
    </div>
  </div>
  <div v-if="store.state.token" class="navbar-container">
    <div class="navbar">
      <router-link class="brand" to="/">{{ store.state.app.name || 'Logbook' }}</router-link>
      <div class="spacer"></div>
      <router-link v-if="!(route === 'superadmin' || route === 'admin')" class="link" to="/">DASHBOARD</router-link>
      <router-link v-if="route !== 'logs'" class="link" to="/logs">LOGS</router-link>
      <router-link class="link" to="/logout">LOGOUT</router-link>
    </div>
  </div>
</template>