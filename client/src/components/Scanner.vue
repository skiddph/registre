<template>
  <audio ref="in" :src="SoundIn"></audio>
  <audio ref="out" :src="SoundOut"></audio>
  <audio ref="err" :src="SoundError"></audio>
  <div class="scanner-wrapper">
    <div class="camera">
      <qrcode-stream :camera="camera" :torch="torch" @detect="onDetect" @init="onInit">
        <div class="camera-overlay">
          <div class="top" v-if="state != 'loading'">
            <Indicator :state="state" large />
            <div class="message" v-if="error">{{ error }}</div>
            <div class="message" v-if="success">{{ success }}</div>
          </div>
          <div class="loading-wrapper" v-if="state == 'loading'">
            <div class="loading-top">
              <div class="flex">
                <Indicator :state="state" large />
              </div>
            </div>
            <div class="loading">
              <icon icon="spinner" />
            </div>
          </div>
          <div class="bottom" v-if="state == 'ready'">
            <div class="camera-info">
              <span>{{ activeCamera + 1 }}/{{ cameras.length }} - {{ cameras[ activeCamera ]?.toUpperCase() }}</span>
            </div>
            <div class="server-time">{{ time }}</div>

            <div class="actions">
              <button v-if="hasTorch" @click="toggleFlash">
                <icon icon="lightbulb" />
              </button>
              <button @click="toggleCamera">
                <icon icon="camera-rotate" />
              </button>
            </div>
          </div>
        </div>
      </qrcode-stream>
    </div>
  </div>
</template>
<script>
import Indicator from '@/components/Indicator.vue'
import SoundIn from '@/assets/in.mp3'
import SoundOut from '@/assets/out.mp3'
import SoundError from '@/assets/error.mp3'

export default {
  name: 'Scanner',
  components: {
    Indicator
  },
  emits: [ 'name' ],
  data: () => ({
    perLogDelay: 5000,
    idleDelay: 15000,
    isIdle: false,
    cameras: [ 'auto', 'rear', 'front' ],
    activeCamera: 0,
    tempCamera: 0,
    camera: 'auto',
    hasTorch: false,
    torch: false,
    error: '',
    success: '',
    employee: '',
    state: 'loading',
    idle: setTimeout(() => null, 0),
    perLogTimeout: setTimeout(() => null, 0),
    sndIn: null,
    sndOut: null,
    sndError: null,
    SoundIn: SoundIn,
    SoundOut: SoundOut,
    SoundError: SoundError,
  }),
  created() {
    this.$store.dispatch('system/servertime')
    setInterval(() => this.$store.dispatch('system/servertime'), 60000)
  },
  computed: {
    time() {
      return this.$store.state.system.servertime
    }
  },
  methods: {
    onStateIn(log) {
      this.state = 'in'
      this.success = 'In'
      this.error = ''
      this.employee = log.data?.name
      this.$refs.in.play()
    },
    onStateOut(log) {
      this.state = 'out'
      this.success = 'Out'
      this.error = ''
      this.employee = log.data?.name
      this.$refs.out.play()
    },
    onStateError(log) {
      this.state = 'error'
      this.error = log ? log.message || log.error || 'Unknown error' : 'Unknown error'
      this.success = ''
      this.employee = log ? log.data?.name || "" : ""
      this.$refs.err.play()
    },
    setOnReady() {
      this.perLogTimeout = setTimeout(() => {
        if (this.state !== 'ready' && this.state !== 'loading') {
          this.state = 'ready'
          this.error = ''
          this.success = ''
          this.employee = ''
        }
      }, this.perLogDelay)
    },
    setOnIdle() {
      this.idle = setTimeout(() => {
        if (this.state === 'ready') {
          this.state = 'loading'
          this.tempCamera = this.activeCamera
          this.isIdle = true
          this.toggleCamera()
        }
      }, this.idleDelay)
    },
    async log(id) {
      this.state = 'loading'
      const res = await this.$store.dispatch('logs/create', id)
        .catch(() => null)

      if (!res) return this.onStateError({ message: "Unknown Error"})
      if (res.status == "error" && res.status != "success") return this.onStateError(res);
      if(res.data.time_sigm == "OUT") return this.onStateOut(res);
      if(res.data.time_sigm == "IN") return this.onStateIn(res);
      return this.onStateError(res);
    },
    async onDetect(promise) {
      clearTimeout(this.idle)
      clearTimeout(this.idle2)

      try {
        const { content } = await promise
        await this.log(content)
          .then(() => {
            this.loading = false
            this.setOnReady()
            this.setOnIdle()
          })
      } catch (error) {
        this.state = 'error'
        this.error = error
        this.success = ''
      }
    },
    async onInit(p) {
      try {
        const { capabilities } = await p
        this.hasTorch = !!capabilities.torch
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          // user denied camera access permisson
        } else if (error.name === 'NotFoundError') {
          // no suitable camera device installed
        } else if (error.name === 'NotSupportedError') {
          // page is not served over HTTPS (or localhost)
        } else if (error.name === 'NotReadableError') {
          // maybe camera is already in use
        } else if (error.name === 'OverconstrainedError') {
          // did you requested the front camera although there is none?
        } else if (error.name === 'StreamApiNotSupportedError') {
          // browser seems to be lacking features
        }
        console.log(error.name)
      } finally {
        // hide loading indicator
      }
      if (this.isIdle) {
        if (this.activeCamera !== this.tempCamera) {
          this.isIdle = false
          this.activeCamera = this.tempCamera == 0 ? this.cameras.length : this.tempCamera - 1
          this.toggleCamera()
        }
      } else {
        this.state = 'ready'
        this.error = ''
        this.success = ''
      }
    },
    toggleCamera() {
      this.state = 'loading'
      this.activeCamera = (this.activeCamera + 1)
      if (this.activeCamera >= this.cameras.length) this.activeCamera = 0
      this.camera = this.cameras[ this.activeCamera ]
    },
    toggleFlash() {
      this.flash = !this.flash
    },
    employeeHandler(employee) {
      this.$emit('name', employee)
    }
  },
  watch: {
    'employee': {
      handler: 'employeeHandler',
      immediate: true
    }
  }
}
</script>
<style lang="scss" scoped>
.scanner-wrapper {
  @apply w-full flex flex-col items-center justify-center md:mt-4;
  .employee-name {
    @apply text-sm text-white bg-gray-700 px-2;
  }
  .camera {
    @apply w-full h-full bg-gray-900 md:rounded-lg overflow-hidden;
  }

  .camera-overlay {
    @apply w-full h-full flex flex-col items-start justify-between md:rounded-lg overflow-hidden;
    .top {
      @apply w-full flex flex-row items-start justify-between;

      .message {
        @apply text-white text-lg px-2;
        background: rgba(0, 0, 0, 0.8);
      }
    }

    .loading-wrapper {
      @apply w-full h-full relative;
      background: rgba(0, 0, 0, 0.5);
      .loading-top {
        @apply absolute;
      }
      .loading {
        @apply w-full h-full flex flex-col items-center justify-center;
        svg {
          @apply text-white text-4xl px-2;
          animation: spin infinite 1s linear;
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
    }

    .bottom {
      @apply w-full flex flex-row items-center justify-between;
    }

    .bottom {
      background: rgba(0, 0, 0, 0.5);
    }
    .camera-info {
      @apply px-2 text-white;
      span {
        @apply pr-2 text-sm;
      }
    }

    .server-time {
      @apply px-2 text-white text-lg;
    }

    .actions {
      button,
      .action {
        @apply my-2 mx-2;
        svg,
        .icon {
          @apply w-4 h-4 bg-white text-gray-600 hover:text-gray-900 active:bg-gray-700 active:text-white p-3 rounded-full transition duration-200 ease-in-out;
        }
      }
    }
  }

  .message-container {
    @apply w-full flex flex-row items-center justify-start;

    .message {
      @apply text-sm text-white bg-gray-700 px-2;
    }
  }
}
</style>