<script setup>
import { useStore } from 'vuex'
import { watchEffect } from 'vue'
import TabbedMenu from './TabbedMenu.vue'
import DashboardActions from './DashboardActions.vue'
import AddForm from './AddForm.vue'
import SearchResult from './SearchResult.vue'

const store = useStore()

watchEffect(() => {
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