<script setup>
import { ref, watchEffect } from 'vue'
import { useStore } from 'vuex'
import {format} from 'date-fns'
const store = useStore();

const logsH = ref([])
const setTabs = (e) => logsH.value = [ "name", ...e.filter(e => e != "schedule"), 'AM_IN', 'AM_OUT', 'PM_IN', 'PM_OUT' ]  
const parseSchedule = (e) => {
  return String(e).split('-').map(e => format(new Date(parseInt(e)), 'h:mm a')).join(' - ')
}
watchEffect(() => setTabs(store.state.dashboard.tabs))
</script>
<template>
  <div v-if="!store.state.dashboard.result_loading" class="search-result-container">
    <!-- RESULTS OVERVIEW -->
    <div class="result-for" v-if="store.state.dashboard.search">
      <span class="result-for-text">{{ store.state.dashboard.result.length }} Results for:</span>
      <span class="query">{{ store.state.dashboard.search }}</span>
    </div>

    <!-- TABLE CONTAINER -->
    <div class="table-container" id="for-print">
      <!-- OVERVIEW | EMPLOYEES | DROPDOWN_FIELDS | ADMINS -->
      <table
        v-if="store.state.dashboard.result.length > 0 && store.state.dashboard.active != 'logs'"
        :class="store.state.dashboard.active == 'logs' || store.state.dashboard.active == 'overview' ? 'table-for-print' : ''"
      >
        <tr class="w-full">
          <th v-for="( v, k ) in store.state.dashboard.result_headers" :key="k">{{ v }}</th>
          <th
            v-if="store.state.dashboard.active != 'overview' && store.state.dashboard.active != 'logs'"
            class="actions"
          >Actions</th>
        </tr>
        <tr v-for="( item, i )  in store.state.dashboard.result">
          <td v-for=" h  in store.state.dashboard.result_headers" :key="h">
            {{
              store.state.dashboard.active == "schedule" || h == "schedule" ? parseSchedule(h == 'value' ? item : item[ h ]) : (h == 'value' ? item : item[ h ]) || '-'
            }}
          </td>
          <td
            v-if="store.state.dashboard.active != 'overview' && store.state.dashboard.active != 'logs'"
            class="actions"
          >
            <button
              v-if="store.state.dashboard.result_headers.length > 1"
              class="edit"
              @click="store.dispatch('dashboard/editform', item)"
            >Edit</button>
            <button
              v-if="store.state.dashboard.tabs.includes(store.state.dashboard.active)"
              class="delete"
              @click="store.dispatch('dashboard/deletefielddata', i)"
            >Delete</button>
            <button
              v-if="!store.state.dashboard.tabs.includes(store.state.dashboard.active)"
              class="delete"
              @click="store.dispatch('dashboard/deletefielddata', item.id)"
            >Delete</button>
          </td>
        </tr>
      </table>

      <!-- LOGS -->
      <table
        v-if="store.state.dashboard.active == 'logs'"
        :class="store.state.dashboard.active == 'logs' || store.state.dashboard.active == 'overview' ? 'table-for-print' : ''"
      >
        <tr class="w-full">
          <th v-for="  v   in logsH" :key="v">{{ v.replaceAll('_', ' ') }}</th>
        </tr>
        <tr v-for="  item   in store.state.dashboard.result">
          <td v-for="  h   in logsH" :key="h">{{ item[ h ] || '-' }}</td>
        </tr>
      </table>
    </div>

    <!-- NO RESULT -->
    <div v-if="store.state.dashboard.result.length == 0" class="no-result">
      <span>No result found</span>
    </div>
  </div>
</template>
<style lang='scss' scoped>
.search-result-container {
  @apply w-full;

  .result-for {
    @apply py-2  text-gray-600 text-sm;

    .result-for-text {
      @apply font-bold pr-2;
    }

    .query {
      @apply font-normal;
    }
  }

  .table-container {
    @apply px-2;
    overflow-x: auto;

    table {
      @apply w-full border-b;

      th {
        @apply uppercase font-normal text-base;
      }

      tr:first-child {
        @apply bg-gray-100;
      }

      tr:not(:last-child) {
        @apply border-b;
      }

      tr {
        .actions {
          @apply text-right;
        }

        th,
        td {
          @apply px-2 py-1;
        }

        td {
          @apply text-gray-700;
          button {
            @apply hover:underline ml-4 md:ml-2 md:text-sm;

            &.edit {
              @apply text-teal-600;
            }

            &.delete {
              @apply text-red-600 hover:text-red-700;
            }
          }
        }
      }
    }

    .table-for-print {
      @apply w-full border-b;

      th {
        @apply uppercase font-normal text-sm;
      }

      tr:first-child {
        @apply bg-gray-100;
      }

      tr {
        .actions {
          @apply text-right;
        }

        th,
        td {
          @apply px-2 py-0;
        }
      }
    }
  }

  .no-result {
    @apply text-center py-12 text-gray-500 font-bold;
  }
}
</style>