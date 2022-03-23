<script setup>
import TabbedMenu from './TabbedMenu.vue'
import DashboardActions from './DashboardActions.vue'
import AddForm from './AddForm.vue'
import SearchResult from './SearchResult.vue'
import { useStore } from 'vuex'
const store = useStore()
</script>
<template>
  <div class="dashboard-container">
    <TabbedMenu />
    <DashboardActions />

    <!-- <AddForm /> -->
    <SearchResult />
  </div>
</template>