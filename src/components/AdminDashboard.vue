<script setup>
import { useStore } from 'vuex'
import { watchEffect } from 'vue'

const store = useStore()

import TabbedMenu from './TabbedMenu.vue'
import DashboardActions from './DashboardActions.vue'
import AddForm from './AddForm.vue'
import SearchResult from './SearchResult.vue'


watchEffect(() => {
  // store.dispatch('setActive', store.state.dash.active)
  store.dispatch('getList')
})

</script>

<template>
  <div class="dashboard-container">
    <TabbedMenu />
    <DashboardActions />
    <AddForm />
    <SearchResult />
  </div>
</template>
<style lang="scss" scoped>
.dashboard-container {
  @apply p-0 w-full;
}
</style>