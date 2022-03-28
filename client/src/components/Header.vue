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
  <div v-if="!store.state.user.token" class="wrapper">
    <div class="container">
      <router-link class="brand" to="/">
        <img src="/favicon.ico" alt="logo" class="logo" />
        <span class="title">{{ store.state.app.name || 'Logbook' }}</span>
      </router-link>
      <div class="spacer"></div>
      <a
        v-if="store.state.user.sac == 0"
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
        v-if="store.state.user.sac == 0"
        class="link"
        to="/register"
        title="Register"
      >
        <icon icon="tasks" />
      </router-link>
    </div>
  </div>
  <div v-if="store.state.user.token" class="wrapper">
    <div class="container">
      <router-link class="brand" to="/">
        <img src="/favicon.ico" alt="logo" class="logo" />
        <span class="title">{{ store.state.app.name || 'Logbook' }}</span>
      </router-link>
      <div class="spacer"></div>
      <button class="link">
        <icon icon="cog" />
        <div class="items">
          <button @click="dataExport = true">
            <div class="icon">
              <icon icon="file-export" />
            </div>Backup Data
          </button>
          <button @click="dataImport = true">
            <div class="icon">
              <icon icon="file-import" />
            </div>Restore Data
          </button>
          <button @click="dataReset = true">
            <div class="icon">
              <icon icon="trash" />
            </div>Reset Data
          </button>
          <router-link to="/dropdown_fields">
            <div class="icon">
              <icon icon="list-ul" />
            </div>Dropdown Fields
          </router-link>
        </div>
      </button>
      <router-link class="link" to="/logout" title="Sign out">
        <icon icon="power-off" />
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
      @apply px-5 md:px-2 py-2 sm:mr-4 text-sm font-semibold;
      @apply text-gray-400 border-b-2 border-white hover:border-gray-700 hover:text-gray-700;
      @apply transition-colors duration-300 ease-in-out uppercase;
      font-family: Arial, Helvetica, sans-serif;
      &.router-link-active {
        @apply border-gray-700 text-gray-700;
      }

      .items {
        @apply absolute bg-white border rounded flex-col justify-center shadow-lg z-10 hidden;
        transform: translateX(-80%);

        button, a {
          @apply flex flex-row items-center text-sm font-normal capitalize;
          @apply py-2 px-4 hover:bg-gray-200 text-gray-600 hover:text-gray-900 text-left;
          .icon {
            @apply w-6;
          }
          svg {
            @apply mr-2;
          }
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
.dark {
  .wrapper {
    @apply bg-gray-900 border-gray-600;

    .container {
      .brand {
        .title {
          @apply text-blue-200;
        }
      }

      .link {
        @apply text-blue-100 border-blue-100;
        @apply hover:border-blue-300 hover:text-blue-300;
        &.router-link-active {
          @apply border-blue-400 text-blue-400;
        }

        .items {
          @apply bg-gray-900 shadow-none border-blue-200;

          button {
            @apply hover:bg-blue-200 text-blue-200 bg-gray-900 hover:text-gray-900;
          }
        }
      }
    }
  }
}
</style>