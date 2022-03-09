<template>
  <teleport to="body">
    <div v-if="open" class="wrapper">
      <div class="container">
        <div v-if="loading" class="loading">
          <icon icon="spinner" />
        </div>
        <h3>Select Data to backup</h3>
        <div class="checkboxes">
          <div v-for="(      field, i      ) in fields" class="checkbox" :key="i">
            <input type="checkbox" :ref="field" :id="field" />
            <label :for="field">{{ field }}</label>
          </div>
        </div>
        <div class="actions">
          <button @click="close">Cancel</button>
          <button @click="backup">Backup</button>
        </div>
      </div>
    </div>
  </teleport>
</template>
<script>
import { format } from 'date-fns'
export default {
  name: 'DataExport',
  emits: [ 'close' ],
  props: {
    open: {
      type: Boolean,
      default: false
    },
    fields: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    loading: false
  }),
  methods: {
    close() {
      this.$emit('close')
    },
    download(data) {
      let j = document.createElement("a")
      j.download = "logbook-" + format(Date.now(), 'yyyyMMddHHmmss') + ".json"
      j.href = URL.createObjectURL(new Blob([ JSON.stringify(data, null, 2) ]))
      j.click()
    },
    async backup() {
      const selected = []
      for (let field of this.fields)
        if (this.$refs[ field ][ 0 ].checked)
          selected.push(field)

      this.loading = true
      const auth = this.$store.state.token ? true : false;
      const API_URL = this.$store.state.api_url;
      await fetch(`${API_URL}/backup`, {
        method: 'POST',
        headers: {
          ...((auth, token) => (auth ? { 'Authorization': `Bearer ${token}` } : {}))(auth, this.$store.state.token),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: selected
        })
      })
        .then(e => e.json())
        .then((e) => {
          this.download(e)
        })
        .catch(e => ({ error: e.message || e.error }))
        .finally(() => {
          this.loading = false
          this.close()
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.wrapper {
  * {
    user-select: none;
  }

  @apply fixed top-0 left-0 right-0 bottom-0 z-50 flex flex-col items-center justify-center;
  background-color: rgba(0, 0, 0, 0.6);

  .container {
    @apply bg-white py-4 px-8 rounded shadow relative;
    width: 100%;
    max-width: 500px;

    .loading {
      @apply flex absolute w-full h-full top-0 left-0 rounded items-center justify-center;
      background-color: rgba(0, 0, 0, 0.8);

      .loader,
      svg {
        @apply text-white w-8 h-8;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    }

    h3 {
      @apply text-lg text-gray-900;
    }

    .checkboxes {
      @apply flex flex-col my-4 mx-2;

      .checkbox {
        input[type="checkbox"] {
          @apply mr-2;
        }
        input[type="checkbox"],
        label {
          @apply cursor-pointer;
        }
        label {
          @apply capitalize;
        }
      }
    }

    .actions {
      @apply flex flex-row justify-end;

      button {
        @apply bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 ml-4 rounded transition-colors duration-300 ease-in-out;
      }
    }
  }
}
</style>