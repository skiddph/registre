<script setup>
import { ref, watch } from 'vue'
import { useStore } from 'vuex'
import html2canvas from 'html2canvas';
import RangeDatePicker from '@/components/RangeDatePicker.vue'

const search = ref('')
const store = useStore()
const overviewFilterOn = ref(false)
const refresh = async () => {
  store.commit('dashboard/result_loading', true)
  await store.dispatch('system/get', false)
  await store.dispatch('system/get', true)
  store.state.dashboard.tabs.forEach(async (tab) => {
    await store.dispatch('dashboard/data', tab)
  })
  await store.dispatch('dashboard/data', 'employees')
  await store.dispatch('dashboard/data', 'overview')
  if (store.state.user.role == 1) await store.dispatch('dashboard/data', 'admins')
  store.commit('dashboard/result_loading', false)
  await store.dispatch('dashboard/search', search.value)
}

refresh()

watch(search, () => {
  store.dispatch('dashboard/search', search.value)
})

const overviewFilterHandler = async (e) => {
  store.commit('logs/report_range', [ e.from, e.to ])
  await store.dispatch('dashboard/data', 'overview')
  await store.dispatch('dashboard/search', search.value)
  overviewFilterOn.value = false
}

const print = async () => {
  const sr = document.querySelector('.search-result-container')
  const tableCanvas = await html2canvas(sr)
  const w = window.open('', '', 'left=0,top=0,width=3508,height=3508,toolbar=0,scrollbars=0,status=0')
  w.document.body.appendChild(tableCanvas)
  w.print()
  w.close()
}

</script>
<template>
  <RangeDatePicker
    v-if="store.state.dashboard.active == 'overview' && overviewFilterOn"
    @cancel="overviewFilterOn = false"
    @submit="overviewFilterHandler"
  />
  <div class="actions-container" v-if="!store.state.dashboard.result_loading">
    <div class="search-container">
      <label for="search">Search:</label>
      <input type="text" name="search" v-model="search" autocomplete="off" />
    </div>
    <div class="buttons">
      <button @click="refresh">Refresh</button>
      <button
        v-if="store.state.dashboard.active != 'overview'"
        @click="store.commit('dashboard/addform', true)"
      >Add</button>
      <button
        v-if="store.state.dashboard.active == 'overview'"
        @click="overviewFilterOn = true"
      >Filter</button>
      <button v-if="store.state.dashboard.active == 'overview'" @click="print">Print</button>
    </div>
  </div>
</template>
<style lang='scss' scoped>
.actions-container {
  @apply w-full flex flex-col items-center justify-center p-2 mb-2;

  .search-container {
    @apply w-full flex flex-row mb-2 items-center justify-center border border-gray-300 px-4 py-2 md:py-1 md:px-2 rounded-md transition duration-300 ease-in-out;
    flex: 1;

    label {
      @apply text-gray-400 text-sm;
      user-select: none;
    }

    input {
      @apply pl-2 bg-transparent outline-none border-0 w-full;
      flex: 1;
    }

    &:focus-within {
      @apply border-gray-500;
    }
  }

  .buttons {
    @apply w-full flex flex-row items-center justify-end;
    button {
      @apply bg-blue-600 text-white md:text-sm py-1 px-4  ml-4 md:ml-2 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out;
    }
  }
}
</style>