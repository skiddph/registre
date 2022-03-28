<script setup>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ref, watchEffect, onMounted } from 'vue'
const store = useStore()
const router = useRouter()
const newField = ref(null)
const loading = ref(true)

watchEffect(() => {
  if (store.state.user.token && store.state.user.role > 0) {
    loading.value = false
  } else {
    router.push('/logout')
  }
})

const upsert = async (fields, removeNewField = false) => {
  loading.value = true
  await store.dispatch('system/upsert', {
    key: 'dropdown_fields',
    value: fields
  })
    .then(async () => {
      await store.dispatch('system/get', false)
      await store.dispatch('system/get', true)
      if (removeNewField) {
        newField.value = ""
      }
    })
    .catch((e) => {
      alert(e.message)
    })
    .finally(() => {
      loading.value = false
    })
}

const removeField = async (i) => {
  const fields = store.state.system?.dropdown_fields?.slice() || []
  fields.splice(i, 1)
  await upsert(fields)
}
const addField = async () => {
  const fields = store.state.system?.dropdown_fields?.slice() || []
  newField.value = String(newField.value).trim().toLowerCase()
  if (!newField.value) {
    alert('Please enter a field name')
    return
  }
  fields.push(newField.value)
  await upsert(fields, true)
}
</script>
<template>
  <div class="wrapper">
    <div class="container">
    <h1>System Settings</h1>
    </div>
  </div>
  <div v-if="store.state.user.role == 1" class="wrapper">
    <div class="container">
      <div class="title">Dropdown Fields</div>
      <div v-if="!loading" class="fields">
        <div v-for="(      v, i      ) in store.state.system.dropdown_fields" class="field">
          {{ v }}
          <icon icon="close" @click="removeField(i)" />
        </div>
      </div>
      <div v-if="!loading" class="action">
        <input type="text" v-model="newField" placeholder="Field name" />
        <button>
          <icon icon="plus" @click="addField" />
        </button>
      </div>
      <div v-if="loading" class="skeleton"></div>
    </div>
  </div>
  <div class="wrapper">
    <div class="container">
      <div class="title">Appearance</div>
      <div class="switches">
        <div class="switch">
          <div class="label">Dark Mode</div>
          <icon
            :icon="store.state.darkMode ? 'toggle-on' : 'toggle-off'"
            @click="store.dispatch('toggleDarkMode')"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<style lang='scss' scoped>
.wrapper {
  @apply w-full flex flex-col items-center justify-center my-4 px-2;

  * {
    user-select: none;
  }

  .container {
    @apply w-full p-4 border rounded-xl;
    max-width: 500px;

    & > h1 {
      @apply text-xl text-center;
    }

    .title {
      @apply text-lg mb-2;
    }

    .fields {
      @apply w-full flex flex-col justify-center items-start;

      .field {
        @apply w-full hover:bg-blue-100 py-2 px-4 rounded-xl flex items-center justify-between transition-all duration-200;

        svg {
          @apply transition-all duration-200 opacity-0;
          transform: scale(0);
        }

        &:hover svg {
          @apply text-blue-400 opacity-100 hover:text-blue-900 text-xl cursor-pointer;
          transform: scale(1);

          &:hover {
            transform: scale(1.2);
          }
        }
      }
    }

    .switches {
      @apply w-full flex flex-col items-center justify-center;

      .switch {
        @apply w-full flex flex-row items-center justify-between;
      }

      svg {
        @apply text-blue-400 hover:text-blue-700 text-xl cursor-pointer transition-all duration-200;
      }
    }

    .action {
      @apply border-t mt-4 pt-4 flex flex-row items-center;

      input {
        @apply flex-1 bg-gray-200 focus:bg-gray-300 outline-none rounded-xl py-2 px-4 mr-4 transition-all ease-in-out duration-200;
      }

      button {
        @apply flex items-center justify-center;
        svg {
          @apply w-6 h-6 text-green-100 bg-green-400 hover:bg-green-500 rounded-full p-1 transition-all ease-in-out duration-200;
        }
      }
    }

    .skeleton {
      @apply w-full h-16 py-24 bg-gray-200 rounded-xl;
    }
  }
}
</style>