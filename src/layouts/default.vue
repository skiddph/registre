<script setup>
import { useStore } from 'vuex'
const store = useStore()
store.dispatch('usercount')
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
      <router-link class="link" to="/logout">LOGOUT</router-link>
    </div>
  </div>
  <div class="main-container">
    <div class="main">
      <router-view />
    </div>
  </div>
</template>
<style lang="scss">
.navbar-container {
  @apply w-full flex flex-col items-center justify-center shadow;

  .navbar {
    @apply px-2 py-0 w-full flex flex-row items-center justify-start;
    max-width: 800px;

    .brand {
      @apply font-bold text-2xl py-3;
    }

    .link {
      @apply px-4 py-4 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors duration-200 ease-in-out;
    }

    .spacer {
      flex: 1;
    }
  }
}

.main-container {
  @apply w-full flex flex-col items-center justify-center;

  .main {
    @apply py-2 px-4 w-full flex flex-col items-center justify-center;
    max-width: 800px;
  }
}
</style>