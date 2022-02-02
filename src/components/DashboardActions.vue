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
<style lang="scss" scoped>
.actions-container {
  @apply w-full flex flex-row items-center justify-center p-2 mb-2;

  .search-container {
    @apply flex flex-row items-center justify-center bg-gray-200 px-4 py-2 rounded-md transition duration-300 ease-in-out;
    flex: 1;

    label {
      @apply text-gray-600 font-bold;
    }

    input {
      @apply pl-4 bg-transparent outline-none border-0 w-full;
      flex: 1;
    }

    &:focus-within {
      @apply bg-gray-300;
    }
  }

  button {
    @apply bg-blue-600 text-white py-2 px-4 ml-4 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out;
  }
}
</style>