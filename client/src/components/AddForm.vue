<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const loading = ref(false);
const error = ref("");

const field = ref("");

const submitAdd = async () => {
  if (store.state.dashboard.tabs.includes(store.state.dashboard.active)) {
    loading.value = true;
    error.value = "";
    await store.dispatch('dashboard/addfielddata', field.value)
      .then(e => { if (e == "error") error.value = e.message; })
      .finally(() => {
        field.value = "";
        loading.value = false
        store.dispatch('dashboard/cancelform')
      })
      .catch(e => {
        console.log(e)
        error.value = e.message
      })
  } else {
    loading.value = true;
    error.value = "";
    await store.dispatch('dashboard/adddata')
      .then(e => { if (e == "error") error.value = e.message; })
      .finally(() => {
        loading.value = false
        store.dispatch('dashboard/cancelform')
      })
      .catch(e => {
        console.log(e)
        error.value = e.message
      })
  }
}

const submitEdit = async (data) => {
  loading.value = true;
  error.value = "";
  await store.dispatch('dashboard/updatedata')
    .finally(() => {
      loading.value = false
      store.dispatch('dashboard/cancelform')
    })
    .catch(e => {
      console.log(e)
      error.value = e.message
    })
}

// schedule time range
const str_from = ref(null);
const str_to = ref(null);

const setDefaultTime = () => {
  if (str_from.value?.value) str_from.value.value = "08:00";
  if (str_to.value?.value) str_to.value.value = "17:00";
}

const scheduleTimeHandler = async () => {
    
}

onMounted(() => setDefaultTime)

</script>
<template>
  <div
    v-if="store.state.dashboard.addform || store.state.dashboard.editform"
    class="add-form-container"
  >
    <div class="add-form">
      <h1 class="form-title">Add {{ store.state.dashboard.active }}</h1>
      <div v-if="error" class="message">
        <span class="error" @click="error = ''">{{ error }}</span>
      </div>

      <div v-if="store.state.dashboard.active == 'employees'" class="collection">
        <div class="group">
          <label for="id">Employee ID</label>
          <input
            type="text"
            name="id"
            v-model="store.state.dashboard.formdata[ 'id' ]"
            autocomplete="off"
          />
        </div>
        <div class="group">
          <label for="name">Name</label>
          <input
            type="text"
            name="name"
            v-model="store.state.dashboard.formdata[ 'name' ]"
            autocomplete="off"
          />
        </div>
        <div class="group" v-for="     dd       in store.state.dashboard.tabs">
          <label for="office">{{ String(dd) }}</label>
          <select name="office" v-model="store.state.dashboard.formdata[ dd ]">
            <option
              v-for="     v      in store.state.dashboard.data[ dd ]"
              :key="v"
              :value="v"
            >{{ v }}</option>
          </select>
        </div>
      </div>

      <div v-if="store.state.dashboard.active == 'admins'" class="collection">
        <div class="group">
          <label for="id">Username</label>
          <input
            type="text"
            name="id"
            v-model="store.state.dashboard.formdata[ 'user' ]"
            autocomplete="off"
          />
        </div>
        <div class="group">
          <label for="name">Name</label>
          <input
            type="password"
            name="name"
            v-model="store.state.dashboard.formdata[ 'name' ]"
            autocomplete="off"
          />
        </div>
        <div class="group">
          <label for="name">Role</label>
          <select name="role" v-model="store.state.dashboard.formdata[ 'role' ]">
            <option value="2">Admin</option>
            <option value="1">Super Admin</option>
          </select>
        </div>
        <div class="group">
          <label for="name">Password</label>
          <input
            type="password"
            name="name"
            v-model="store.state.dashboard.formdata[ 'pass' ]"
            autocomplete="off"
          />
        </div>
      </div>

      <div
        v-if="store.state.dashboard.tabs.includes(store.state.dashboard.active) && store.state.dashboard.active !== 'schedule'"
      >
        <label for="name">{{ store.state.dashboard.active }} name</label>
        <input type="text" name="name" v-model="field" autocomplete="off" />
      </div>

      <div v-if="store.state.dashboard.active == 'schedule'" class="schedule-add">
        <label for="name">{{ store.state.dashboard.active }} Time Range</label>
        <div class="row">
          <div class="group">
            <label for>From</label>
            <input type="time" />
          </div>
          <div class="group">
            <label for>To</label>
            <input type="time" />
          </div>
        </div>
      </div>

      <div class="add-form-actions">
        <button @click="store.dispatch('dashboard/cancelform', false)">Cancel</button>
        <button v-if="store.state.dashboard.addform" @click="submitAdd">Add</button>
        <button v-if="store.state.dashboard.editform" @click="submitEdit">Update</button>
      </div>
    </div>
  </div>
</template>
<style lang='scss' scoped>
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
      @apply text-center mb-4 text-sm;

      .error {
        @apply text-red-500;
        cursor: pointer;
      }
    }

    label {
      @apply text-gray-500 font-bold block text-sm pl-1 capitalize;
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

    .schedule-add {
      @apply w-full flex flex-col justify-end;

      .row {
        @apply w-full flex flex-row items-center justify-center my-4;
        .group {
          @apply flex-1 flex flex-row items-center border justify-center mx-2 rounded;

          label {
            @apply text-gray-700 font-normal block text-sm pr-2 capitalize;
          }

          input {
            @apply p-0 m-0 border-0;
          }
        }
      }
    }
  }
}
</style>