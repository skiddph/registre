<script setup>
import { ref } from 'vue'
import {useStore} from 'vuex'
const store = useStore()

</script>
<template>
  <div class="actions-container">
    <div class="search-container">
      <label for="search">Search:</label>
      <input type="text" name="search" v-model="store.state.dash.search" autocomplete="off" />
    </div>
    <button @click="store.commit('setAddState', true)">ADD</button>
  </div>
</template>