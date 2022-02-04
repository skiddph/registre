<script setup>
import { useStore } from 'vuex'
import { ref, reactive, watch, watchEffect } from 'vue'

const store = useStore();

const employees = ref(store.state.employees);
const offices = ref(store.state.offices);
const units = ref(store.state.units);
const positions = ref(store.state.positions);
const admins = ref(store.state.admins);
const list = [ employees, offices, units, positions, admins ];

const search = ref(store.state.dash.search);
const active = ref(store.state.dash.active);

watch([
  store.state.dash,
  store.state.employees,
  store.state.offices,
  store.state.units,
  store.state.positions,
  store.state.admins,
], () => {
  search.value = store.state.dash.search;
  active.value = store.state.dash.active;
  employees.value = store.state.employees;
  offices.value = store.state.offices;
  units.value = store.state.units;
  positions.value = store.state.positions;
  admins.value = store.state.admins;
});
const th = ref([])
const result = ref([]);

watchEffect(() => {
  if (list.length > 0) {
    result.value = list[ active.value ].value.filter(v => {
      for (let key in v) {
        if (v[ key ].toString().toLowerCase().includes(search.value.toLowerCase())) {
          return true;
        }
      }
    }) || []

    th.value = []
    for (let key in list[ active.value ].value[ 0 ]) {
      if (key != 'id') {
        th.value.push(key)
      }
    }
  }
})

const updateList = () => {
  employees = ref(store.state.employees);
  offices = ref(store.state.offices);
  units = ref(store.state.units);
  positions = ref(store.state.positions);
  admins = ref(store.state.admins);
}

const action = {
  delete: (id) => {
    store.dispatch('delete', { tab: active.value, id })

  },
  edit: (id) => {
    store.dispatch('edit', { tab: active.value, id })
  },
}

</script>
<template>
  <div class="search-result-container">
    <div class="result-for" v-if="search">
      <span class="result-for-text">{{ th.length }} Results for:</span>
      <span class="query">{{ search }}</span>
    </div>
    <div class="table-container">
      <table v-if="result.length > 0">
        <tr class="w-full">
          <th v-for="(  v, k  ) in th" :key="k">{{ v }}</th>
          <th>Actions</th>
        </tr>
        <tr v-for="  item  in result">
          <td v-for="  h  in th" :key="`${item.id}-${h}`">{{ item[ h ] }}</td>
          <td>
            <button v-if="th.length > 1" class="edit" @click="action.edit(item.id)">Edit</button>
            <button class="delete" @click="action.delete(item.id)">Delete</button>
          </td>
        </tr>
      </table>
    </div>
    <div v-if="result.length == 0" class="no-result">
      <span>No result found</span>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.search-result-container {
  @apply w-full;

  .result-for {
    @apply py-2  text-gray-600 text-sm;

    .result-for-text {
      @apply font-bold;
    }

    .query {
      @apply font-normal;
    }
  }

  .table-container {
    overflow-x: auto;

    table {
      @apply w-full border-b;

      th {
        @apply capitalize;
      }

      tr:first-child {
        @apply bg-gray-100;
      }

      tr:not(:last-child) {
        @apply border-b;
      }

      tr {
        td:last-child,
        th:last-child {
          @apply text-right;
        }

        th,
        td {
          @apply px-2 py-2 sm:py-3;
        }

        td {
          @apply text-gray-700;
          button {
            @apply py-1 px-2 ml-2 rounded;

            &.edit {
              @apply bg-teal-600 text-white;
            }

            &.delete {
              @apply bg-red-600 text-white hover:bg-red-700;
            }
          }
        }
      }
    }
  }

  .no-result {
    @apply text-center py-12 text-gray-500 font-bold;
  }
}
</style>