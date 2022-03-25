<script setup>
import { ref, watch, watchEffect, reactive } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

watchEffect(async () => {
  await store.dispatch('system/get', false)
  await store.dispatch('system/get', true)
})

const setActive = (key) => store.dispatch('dashboard/active', key)

</script>
<template>
  <div class="tabbed-menu">
    <div
      :class="`item ${store.state.dashboard.active == 'overview' ? 'active' : 'inactive'}`"
      @click="setActive('overview')"
    >overview</div>
    <div
      :class="`item ${store.state.dashboard.active == 'employees' ? 'active' : 'inactive'}`"
      @click="setActive('employees')"
    >employees</div>
    <div
      v-for="   tab    in store.state.dashboard.tabs"
      :class="`item ${store.state.dashboard.active == tab ? 'active' : 'inactive'}`"
      :key="tab"
      @click="setActive(tab)"
    >{{ tab }}</div>
    <div
      v-if="store.state.user.role == 1"
      :class="`item ${store.state.dashboard.active == 'admins' ? 'active' : 'inactive'}`"
      @click="setActive('admins')"
    >admins</div>
    <div
      :class="`item ${store.state.dashboard.active == 'logs' ? 'active' : 'inactive'}`"
      @click="setActive('logs')"
    >logs</div>
  </div>
</template>
<style lang='scss' scoped>
.tabbed-menu {
  @apply w-full flex flex-wrap items-end justify-start px-2 pt-4;

  .item {
    @apply py-1 px-2 rounded border border-gray-600 md:text-sm mr-2 cursor-pointer capitalize mb-2;
    user-select: none;

    &.active {
      @apply bg-gray-600 text-gray-100;
    }

    &.inactive {
      @apply text-gray-600 hover:bg-gray-200;
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