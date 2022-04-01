<template>
  <teleport to="#app">
    <div v-if="open" class="wrapper">
      <div class="container">
        <div v-if="loading" class="loading">
          <icon icon="spinner" />
        </div>
        <h3>Are you sure?</h3>
        <p>By clicking the 'reset' button below, all of your data will be deleted. Do you want to continue?</p>
        <div class="actions">
          <button @click="close">Cancel</button>
          <button class="red" @click="reset">Reset</button>
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
    }
  },
  data: () => ({
    loading: false
  }),
  methods: {
    close() {
      this.$emit('close')
    },
    async reset() {
      this.loading = true
      await this.$store.dispatch('resetData')
        .then((e) => e ? this.$router.push('/logout'): e)
        .then(e => !e ? this.close() : e)
        .finally(() => this.loading = false)
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

    p {
      @apply text-gray-700 text-base mt-6 mb-12;
    }

    .actions {
      @apply flex flex-row justify-end;

      button {
        @apply bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 ml-4 rounded transition-colors duration-300 ease-in-out;

        &.red {
          @apply bg-red-500 hover:bg-red-700;
        }
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
        @apply text-gray-300;
      }

      p {
        @apply text-gray-400;
      }

      .actions {
        @apply flex flex-row justify-end;

        button {
          @apply bg-gray-900 hover:bg-blue-400 text-blue-400 hover:text-gray-900 border border-blue-400;

          &.red {
            @apply bg-gray-900 hover:bg-red-500 text-red-500 hover:text-gray-900 border border-red-500;
          }
        }
      }
    }
  }
}
</style>