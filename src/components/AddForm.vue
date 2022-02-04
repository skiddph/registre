<script setup>
import { ref, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const tabs = ref(store.state.dash.tabs)
const active = ref(store.state.dash.active)

const admins = store.state.admins;
const employees = store.state.employees;
const offices = store.state.offices;
const units = store.state.units;
const positions = store.state.positions;
const list = ref([ employees, offices, units, positions, admins ]);

const name = ref('');
const user = ref('');
const pass = ref('');
const cpass = ref('');
const id = ref('');
const error = ref('');
const office = ref('');
const unit = ref('');
const position = ref('');

const loading = ref(false);

watch([store.state.dash], () => {
  tabs.value = store.state.dash.tabs
  active.value = store.state.dash.active
})

const actions = [
  // Employee
  async () => {
    error.value = ''
    loading.value = true
    let data = {
      tab: active.value,
      data: {
        id: id.value,
        name: name.value,
        office: office.value,
        unit: unit.value,
        position: position.value,
      }
    }

    await store.dispatch('create', data)
      .then(e => {
        error.value = e.error || false
        if (!error.value) {
          name.value = ''
          id.value = ''
          office.value = ''
          unit.value = ''
          position.value = ''
          store.commit('setAddState', false)
        }
      })
      .catch(e => {
        error.value = e.error || e.message || "Failed to add employee"
      })
      .finally(() => {
        loading.value = false
      })
  },

  // Office
  async () => {
    error.value = ''
    loading.value = true
    let data = {
      tab: active.value,
      data: {
        name: name.value,
      }
    }

    await store.dispatch('create', data)
      .then(e => {
        error.value = e.error || false
        if (!error.value) {
          name.value = ''
          id.value = ''
          store.commit('setAddState', false)
        }
      })
      .catch(e => {
        error.value = e.error || e.message || "Failed to add office"
      })
      .finally(() => {
        loading.value = false
      })
  },

  // Unit
  async () => {
    error.value = ''
    loading.value = true
    let data = {
      tab: active.value,
      data: {
        name: name.value,
      }
    }

    await store.dispatch('create', data)
      .then(e => {
        error.value = e.error || false
        if (!error.value) {
          name.value = ''
          id.value = ''
          store.commit('setAddState', false)
        }
      })
      .catch(e => {
        error.value = e.error || e.message || "Failed to add unit"
      })
      .finally(() => {
        loading.value = false
      })
  },

  // Position
  async () => {
    error.value = ''
    loading.value = true
    let data = {
      tab: active.value,
      data: {
        name: name.value,
      }
    }

    await store.dispatch('create', data)
      .then(e => {
        error.value = e.error || false
        if (!error.value) {
          name.value = ''
          id.value = ''
          store.commit('setAddState', false)
        }
      })
      .catch(e => {
        error.value = e.error || e.message || "Failed to add position"
      })
      .finally(() => {
        loading.value = false
      })
  },

  // Admin
  async () => {
    error.value = ''
    loading.value = true
    let data = {
      tab: active.value,
      data: {
        name: name.value,
        user: user.value,
        pass: pass.value,
      }
    }

    if (pass.value !== cpass.value) {
      error.value = 'Passwords do not match'
      loading.value = false
      return
    } else {
      await store.dispatch('create', data)
      .then(e => {
        error.value = e.error || false
        if (!error.value) {
          name.value = ''
          id.value = ''
          user.value = ''
          pass.value = ''
          cpass.value = ''
          store.commit('setAddState', false)
        }
      })
      .catch(e => {
        error.value = e.error || e.message || "Failed to add admin"
      })
      .finally(() => {
        loading.value = false
      })
    }
  },
]

</script>
<template>
  <div v-if="store.state.dash.add" class="add-form-container">
    <div class="add-form">
      <h1 class="form-title">Add {{ tabs[ active ] }}</h1>
      <div v-if="error" class="message">
        <span class="error"  @click="error = ''">
          {{ error }}
        </span>
      </div>
      <!-- Employee -->
      <div v-if="active == 0">
        <label for="id">Employee ID</label>
        <input type="text" name="id" v-model="id" autocomplete="off" />
        <label for="name">Name</label>
        <input type="text" name="name" v-model="name" autocomplete="off" />
        <label for="office">Office</label>
        <select name="office" v-model="office">
          <option v-for="v in store.state.offices" :key="v.id" :value="v.name">{{v.name}}</option>
        </select>
        <label for="unit">Unit</label>
        <select name="unit" v-model="unit">
          <option v-for="v in store.state.units" :key="v.id" :value="v.name">{{v.name}}</option>
        </select>
        <label for="position">Position</label>
        <select name="position" v-model="position">
          <option v-for="v in store.state.positions" :key="v.id" :value="v.name">{{v.name}}</option>
        </select>
      </div>

      <!-- Office -->
      <div v-if="active == 1">
        <label for="name">Name</label>
        <input type="text" name="name" v-model="name" autocomplete="off" />
      </div>

      <!-- Unit -->
      <div v-if="active == 2">
        <label for="name">Name</label>
        <input type="text" name="name" v-model="name" autocomplete="off" />
      </div>

      <!-- Position -->
      <div v-if="active == 3">
        <label for="name">Name</label>
        <input type="text" name="name" v-model="name" autocomplete="off" />
      </div>

      <!-- Admin -->
      <div v-if="active == 4">
        <label for="name">Name</label>
        <input type="text" name="name" v-model="name" autocomplete="off" />
        <label for="user">Username</label>
        <input type="text" name="user" v-model="user" autocomplete="off" />
        <label for="pass">Password</label>
        <input type="password" name="pass" v-model="pass" autocomplete="off" />
        <label for="cpass">Confirm Password</label>
        <input type="password" name="cpass" v-model="cpass" autocomplete="off" />
      </div>

      <!--- Actions -->
      <div class="add-form-actions">
        <button @click="store.commit('setAddState', false)">Cancel</button>
        <button @click="actions[ active ]">Add</button>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.add-form-container {
  @apply p-2 fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-10 flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden;
  background-color: rgba(0, 0, 0, 0.5);

  .add-form {
    @apply bg-white w-full rounded p-4;
    max-width: 500px;

    .form-title {
      @apply text-2xl font-bold mb-4;
    }

    .message {
      @apply  text-center mb-4 text-sm;

      .error {
        @apply text-red-500;
        cursor: pointer;
      }
    }

    label {
      @apply text-gray-500 font-bold block text-sm pl-1;
    }

    input,
    select {
      @apply block border p-2 mb-2 sm:mb-4 w-full rounded-lg outline-none;
    }

    .add-form-actions {
      @apply flex flex-row items-center justify-end pt-4;

      button {
        @apply bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out ml-4;
      }
    }
  }
}
</style>