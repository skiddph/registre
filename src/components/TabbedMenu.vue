<script setup>
import { ref, watch, watchEffect, reactive } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const tabs = ref([ 'Employees', 'Office', 'Unit', 'Position' ]);
store.commit('setTabs', tabs.value)

const active = ref(0);

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
    <div class="item inactive"></div>
    <div
      v-for="(  v, k  ) in tabs"
      :class="`item pointer ${active == k ? 'active' : 'inactive'}`"
      :key="`${v}-${k}`"
      @click="setActive(k)"
    >{{ v }}</div>
    <div class="item spacer inactive"></div>
  </div>
</template>

<style lang="scss" scoped>
.tabbed-menu {
  @apply w-full flex flex-wrap items-end justify-start mb-4;

  .item {
    @apply sm:py-2 sm:px-4 p-2;

    &.pointer {
      @apply cursor-pointer;
    }

    &.active {
      @apply border-x border-t border-gray-300;
    }

    &.inactive {
      border-bottom: 1px solid #e6e6e6;
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