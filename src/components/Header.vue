<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import DataExport from '@/components/DataExport.vue'
import DataImport from '@/components/DataImport.vue'
import DataReset from '@/components/DataReset.vue'
const store = useStore()

const fields = [ 'user', 'unit', 'position', 'office', 'logs', 'employee' ]

const dataExport = ref(false)
const dataImport = ref(false)
const dataReset = ref(false)
</script>
<template>
  <DataExport :fields="fields" :open="dataExport" @close="dataExport = false" />
  <DataImport :open="dataImport" @close="dataImport = false" />
  <DataReset :open="dataReset" @close="dataReset = false" />
  <div v-if="!store.state.token" class="wrapper">
    <div class="container">
      <router-link class="brand" to="/">
        <img src="/favicon.ico" alt="logo" class="logo" />
        <span class="title">{{ store.state.app.name || 'Logbook' }}</span>
      </router-link>
      <div class="spacer"></div>
      <a
        v-if="store.state.superadmincount == 0"
        class="link"
        @click="dataImport = true"
        title="Data Import"
      >
        <icon icon="file-import" />
      </a>
      <router-link class="link" to="/scan" title="QR Code Scanner">
        <icon icon="qrcode" />
      </router-link>
      <router-link class="link" to="/login" title="Sign in">
        <icon icon="sign-in" />
      </router-link>
      <router-link
        v-if="store.state.superadmincount == 0"
        class="link"
        to="/register"
        title="Register"
      >
        <icon icon="tasks" />
      </router-link>
    </div>
  </div>
  <div v-if="store.state.token" class="wrapper">
    <div class="container">
      <router-link class="brand" to="/">
        <img src="/favicon.ico" alt="logo" class="logo" />
        <span class="title">{{ store.state.app.name || 'Logbook' }}</span>
      </router-link>
      <div class="spacer"></div>
      <button class="link">
        <icon icon="file" />
        <div class="items">
          <button @click="dataExport = true">
            <div class="icon">
              <icon icon="file-export" />
            </div>Backup
          </button>
          <button @click="dataImport = true">
            <div class="icon">
              <icon icon="file-import" />
            </div>Restore
          </button>
          <button @click="dataReset = true">
            <div class="icon">
              <icon icon="trash" />
            </div>Reset
          </button>
        </div>
      </button>
      <router-link v-if="store.state.role == 1" class="link" to="/superadmin" title="Dashboard">
        <icon icon="dashboard" />
      </router-link>
      <router-link v-if="store.state.role != 1" class="link" to="/admin" title="Dashboard">
        <icon icon="dashboard" />
      </router-link>
      <router-link class="link" to="/logs" title="Logs">
        <icon icon="list" />
      </router-link>
      <router-link class="link" to="/logout" title="Sign out">
        <icon icon="sign-out" />
      </router-link>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import "@/styles/variables.scss";

.wrapper {
  @apply w-full flex flex-row border-b sticky top-0 z-10 items-center justify-center;
  @apply bg-white;

  .container {
    @apply px-4 py-0 w-full flex flex-row items-center justify-start;
    max-width: $max-width;

    .brand {
      @apply font-bold text-xl py-3;
      @apply flex flex-row items-center;
      .logo {
        @apply h-8 mr-2;
      }
      .title {
        @apply hidden sm:block font-normal text-gray-700;
        font-family: Verdana, Geneva, Tahoma, sans-serif;
      }
    }

    .link {
      @apply px-2 py-1 sm:mr-4 text-sm font-semibold;
      @apply text-gray-400 border-b-2 border-white hover:border-gray-700 hover:text-gray-700;
      @apply transition-colors duration-300 ease-in-out uppercase;
      font-family: Arial, Helvetica, sans-serif;
      &.router-link-active {
        @apply border-gray-700 text-gray-700;
      }

      .items {
        @apply absolute bg-white border rounded flex-col justify-center shadow-lg z-10 hidden;
        transform: translateX(-80%);

        button {
          @apply flex flex-row items-center;
          .icon {
            @apply w-6;
          }
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