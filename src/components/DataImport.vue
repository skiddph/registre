<template>
  <div v-if="open" class="wrapper">
    <div class="container">
      <div v-if="loading" class="loading">
        <icon icon="spinner" />
      </div>
      <h3>
        <span>Select File to Restore</span>
        <div class="upload">
          <input type="file" @change="fileHandler" accept=".json" />
        </div>
        <div class="actions">
          <button @click="close">Cancel</button>
          <button @click="restore">Restore</button>
        </div>
      </h3>
    </div>
  </div>
</template>
<script>
export default {
  name: 'DataExport',
  props: {
    open: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    loading: false,
    filedata: null
  }),
  emits: [ 'close' ],
  methods: {
    close() {
      this.$emit('close')
    },
    fileHandler(e) {
      var input = e.target;
      var reader = new FileReader();
      const data = null
      reader.onload = () => this.filedata = JSON.parse(reader.result).data;
      reader.readAsText(input.files[ 0 ]);
    },
    async restore() {
      this.loading = true
      const auth = this.$store.state.token ? true : false;
      const API_URL = this.$store.state.api_url;
      await fetch(`${API_URL}/restore`, {
        method: 'POST',
        headers: {
          ...((auth, token) => (auth ? { 'Authorization': `Bearer ${token}` } : {}))(auth, this.$store.state.token),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: this.filedata
        })
      })
        .then(e => e.json())
        .then((e) => {
          console.log(e)
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

  @apply fixed top-0 left-0 right-0 bottom-0 z-20 flex flex-col items-center justify-center;
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

    .upload {
      @apply w-full flex flex-row items-center justify-center mt-6 mb-12;

      input[type="file"] {
        @apply w-full border;
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