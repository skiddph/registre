<script setup>
import { useStore } from 'vuex'
const store = useStore()
</script>
<template>
  <div v-if="!store.state.token" class="navbar-container">
    <div class="navbar">
      <router-link class="brand" to="/">{{ store.state.app.name || 'Logbook' }}</router-link>
      <div class="spacer"></div>
      <router-link class="link" to="/scan">SCANNER</router-link>
      <router-link class="link" to="/login">LOGIN</router-link>
      <router-link v-if="store.state.superadmincount == 0" class="link" to="/register">REGISTER</router-link>
    </div>
  </div>
  <div v-if="store.state.token" class="navbar-container">
    <div class="navbar">
      <router-link class="brand" to="/">{{ store.state.app.name || 'Logbook' }}</router-link>
      <div class="spacer"></div>
      <router-link v-if="store.state.role == 1" class="link" to="/superadmin">DASHBOARD</router-link>
      <router-link v-if="store.state.role != 1" class="link" to="/admin">DASHBOARD</router-link>
      <router-link class="link" to="/logs">LOGS</router-link>
      <router-link class="link" to="/logout">LOGOUT</router-link>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import '@/styles/variables.scss';

.navbar-container {
  @apply w-full flex flex-col items-center justify-center shadow sticky top-0 bg-white;

  .navbar {
    @apply px-1 py-0 w-full flex flex-row items-center justify-start;
    max-width: $max-width;

    .brand {
      @apply font-bold sm:text-2xl text-xl sm:py-3;
    }

    .link {
      @apply px-2 py-1 sm:mr-4 text-sm font-semibold text-gray-500 border-b-2 border-white hover:border-gray-900 hover:text-gray-900 transition-colors duration-300 ease-in-out uppercase;
      font-family: Arial, Helvetica, sans-serif;
      &.router-link-active {
        @apply hidden;
      }
    }

    .spacer {
      flex: 1;
    }
  }
}
</style>