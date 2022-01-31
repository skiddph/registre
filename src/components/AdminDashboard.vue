<script setup>
import { ref, watchEffect } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const tabbedMenuList = ref([ 'Employees', 'Office', 'Unit', 'Position' ]);

const activeTab = ref(0);
const addState = ref(false);
const search = ref('');

watchEffect(() => {
  if(store.state.role == 1){
    tabbedMenuList.value.push('Admin');
  }
})

</script>

<template>
  <div class="dashboard-container">
    <div class="tabbed-menu">
      <div class="item inactive"></div>
      <div
        v-for="(    v, k    ) in tabbedMenuList"
        :class="`item pointer ${activeTab == k ? 'active' : 'inactive'}`"
        :key="`${v}-${k}`"
        @click="activeTab = k"
      >{{ v }}</div>
      <div class="item spacer inactive"></div>
    </div>
    <div class="actions-container">
      <div class="search-container">
        <label for="search">Search:</label>
        <input type="text" name="search" v-model="search" autocomplete="off" />
      </div>
      <button>ADD</button>
    </div>
    <div class="search-result-container">
      Search
    </div>
  </div>
</template>
<style lang="scss">
.dashboard-container {
  @apply p-0 w-full;

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
    }
  }

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

  .search-result-container {

  }
}
</style>