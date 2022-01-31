<script setup>
import { useStore } from 'vuex'
const store = useStore()
</script>
<template>
  <div v-if="!store.state.token" class="navbar-container">
    <div class="navbar">
      <router-link class="brand" to="/">{{store.state.app.name || 'Logbook'}}</router-link>
      <div class="spacer"></div>
      <router-link class="link" to="/login">LOGIN</router-link>
      <router-link class="link" to="/register">REGISTER</router-link>
    </div>
  </div>
  <div v-if="store.state.token" class="navbar-container">
    <div class="navbar">
      <router-link class="brand" to="/">{{store.state.app.name || 'Logbook'}}</router-link>
      <div class="spacer"></div>
      <router-link class="link" to="/">DASHBOARD</router-link>
      <router-link class="link" to="/logs">LOGS</router-link>
      <router-link class="link" to="/logout">LOGOUT</router-link>
    </div>
  </div>
</template>