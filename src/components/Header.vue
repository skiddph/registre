<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import DataExport from '@/components/DataExport.vue'
import DataImport from '@/components/DataImport.vue'
const store = useStore()

const fields = [ 'user', 'unit', 'position', 'office', 'logs', 'employee' ]

const dataExport = ref(false)
const dataImport = ref(false)
const dataReset = ref(null)
</script>
<template>
  <DataExport :fields="fields" :open="dataExport" @close="dataExport = false" />
  <DataImport :open="dataImport" @close="dataImport = false" />
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
      <button class="link">
        <span>Data</span>
        <div class="items">
          <button @click="dataExport = true">
            <icon icon="file-export" />Backup
          </button>
          <button @click="dataImport = true">
            <icon icon="file-import" />Restore
          </button>
          <button @click="dataReset = true">
            <icon icon="trash" />Reset
          </button>
        </div>
      </button>
      <router-link v-if="store.state.role == 1" class="link" to="/superadmin">DASHBOARD</router-link>
      <router-link v-if="store.state.role != 1" class="link" to="/admin">DASHBOARD</router-link>
      <router-link class="link" to="/logs">LOGS</router-link>
      <router-link class="link" to="/logout">LOGOUT</router-link>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import "@/styles/variables.scss";

.navbar-container {
  @apply w-full flex flex-col items-center justify-center shadow sticky top-0 bg-white z-10;

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

      .items {
        @apply absolute bg-white border rounded flex-col justify-center shadow-lg z-10 hidden;

        button {
          svg {
            @apply mr-2;
          }
          @apply py-2 px-4 hover:bg-gray-200 text-gray-600 hover:text-gray-900 text-left;
        }
      }

      &:hover .items {
        @apply flex;
      }
    }

    .spacer {
      flex: 1;
    }
  }
}
</style>