<template>
  <teleport to="#app">
    <div v-if="open" class="wrapper">
      <div class="container">
        <div v-if="loading" class="loading">
          <icon icon="spinner" />
        </div>
        <form :action="$store.state.api_url + '/data/restore'" method="post" encType="multipart/form-data">
          <span>Select File to Restore</span>
          <div class="upload">
            <input type="file" accept=".json" name="file" />
          </div>
          <div class="actions">
            <button @click="close">Cancel</button>
            <button type="submit">Restore</button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
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
  emits: [ 'close' ],
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>
<style lang="scss" scoped>
.wrapper {
  * {
    user-select: none;
  }

  @apply fixed top-0 left-0 right-0 bottom-0 z-20 flex flex-col items-center justify-center px-4;
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
        @apply w-full border text-sm rounded;
      }
    }

    .actions {
      @apply flex flex-row justify-end;

      button {
        @apply bg-blue-500 text-base hover:bg-blue-700 text-white py-1 px-4 ml-4 rounded transition-colors duration-300 ease-in-out;
      }
    }
  }
}
.dark {
  .wrapper {
    .container {
      @apply bg-gray-900 shadow-none;

      .loading {
        .loader,
        svg {
          @apply text-gray-400;
        }
      }

      h3 {
        @apply text-lg text-gray-300;
      }

      .upload {
        input[type="file"] {
          @apply border-gray-400 text-gray-400;
        }
      }

      .actions {

        button {
          @apply border border-blue-300 bg-gray-900 text-blue-300 ;
          @apply hover:bg-blue-300 hover:text-gray-900;
        }
      }
    }
  }
}
</style>