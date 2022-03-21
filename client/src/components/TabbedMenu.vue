<script setup>
import { ref, watch, watchEffect, reactive } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const tabs = ref([ 'Employees', 'Office', 'Unit', 'Position' ]);
store.commit('setTabs', tabs.value)

const active = ref(store.state.dash.active);

watchEffect(() => {
  if (store.state.role == 1) {
    tabs.value = [ 'Employees', 'Office', 'Unit', 'Position', 'Admin' ]
  } else {
    tabs.value = [ 'Employees', 'Office', 'Unit', 'Position' ]
  }
  store.commit('setTabs', tabs.value)
})

const setActive = (index) => {
  active.value = index
  store.dispatch('setActive', index)
}

</script>
<template>
  <div class="tabbed-menu">
    <div
      v-for="(   v, k   ) in tabs"
      :class="`item pointer ${active == k ? 'active' : 'inactive'}`"
      :key="`${v}-${k}`"
      @click="setActive(k)"
    >{{ v }}</div>
  </div>
</template>
<style lang='scss' scoped>
.tabbed-menu {
  @apply w-full flex flex-wrap items-end justify-start mb-4 m-2;

  .item {
    @apply py-1 px-2 rounded border border-gray-600 md:text-sm mr-2 cursor-pointer;

    &.active {
      @apply bg-gray-600 text-gray-100;
    }

    &.inactive {
      @apply text-gray-600; 
    }

    &.spacer {
      flex: 1;
    }

    .count {
      @apply text-xs text-gray-600;
    }
  }
}
</style>