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
  search.value = store.state.dash.search;
  active.value = store.state.dash.active;
  employees.value = store.state.employees;
  offices.value = store.state.offices;
  units.value = store.state.units;
  positions.value = store.state.positions;
  admins.value = store.state.admins;
})

watchEffect(() => {
  try {
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
  } catch (e) {
    // empty
  }
})

const updateList = () => {
  employees.value = store.state.employees;
  offices.value = store.state.offices;
  units.value = store.state.units;
  positions.value = store.state.positions;
  admins.value = store.state.admins;

}

const action = {
  delete: async (id) => {
    const result = await store.dispatch('delete', { tab: active.value, id })
    if (result.error) alert(`Failed to delete: ${result.error}`)
  },
  edit: (id) => {
    store.commit('setEditState', { state: true, id })
  },
}

</script>
<template>
  <div class="search-result-container">
    <div class="result-for" v-if="search">
      <span class="result-for-text">{{ result.length }} Results for:</span>
      <span class="query">{{ search }}</span>
    </div>
    <div class="table-container">
      <table v-if="result.length > 0">
        <tr class="w-full">
          <th v-for="(    v, k    ) in th" :key="k">{{ v }}</th>
          <th>Actions</th>
        </tr>
        <tr v-for="    item    in result">
          <td v-for="    h    in th" :key="`${item.id}-${h}`">{{ item[ h ] }}</td>
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