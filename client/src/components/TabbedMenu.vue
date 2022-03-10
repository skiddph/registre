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