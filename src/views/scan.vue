<template>
  <audio ref="in" :src="SoundIn"></audio>
  <audio ref="out" :src="SoundOut"></audio>
  <audio ref="err" :src="SoundError"></audio>
  <div ref="cont" class="scanner-container">
    <qrcode-stream :camera="camera" :torch="torch" @detect="onDetect" @init="onInit">
      <div class="message-container">
        <Indicator :state="state" />
        <span v-if="error" class="message error">{{ error }}</span>
        <span v-if="success" class="message success">{{ success }}</span>
      </div>
    </qrcode-stream>
    <div class="actions">
      <button @click="toggleCamera">Switch cam</button>
      <button v-if="hasTorch" @click="toggleFlash">Flash</button>
    </div>

    <div class="legends">
      <h3>Legends</h3>
      <div>
        <Indicator state="ready" />- Ready
      </div>
      <div>
        <Indicator state="loading" />- Detected
      </div>
      <div>
        <Indicator state="in" />- Employee In
      </div>
      <div>
        <Indicator state="out" />- Employee Out
      </div>
      <div>
        <Indicator state="error" />- Error
      </div>
    </div>
  </div>
</template>
<script>
import Indicator from '@/components/Indicator.vue'
import SoundIn from '@/assets/in.mp3'
import SoundOut from '@/assets/out.mp3'
import SoundError from '@/assets/error.mp3'

export default {
  components: {
    Indicator
  },
  data() {
    return {
      cameras: [ 'rear', 'front' ],
      activeCamera: 0,
      camera: 'auto',
      hasTorch: false,
      torch: false,
      error: '',
      success: '',
      state: 'loading',
      lastDecode: Date.now() * 1000,
      idle: null,
      idle2: null,
      sndIn: null,
      sndOut: null,
      sndError: null,
      SoundIn: SoundIn,
      SoundOut: SoundOut,
      SoundError: SoundError
    }
  },
  methods: {
    async log(id) {
      this.state = 'loading'
      const res = await this.$store.dispatch('log', id)
      if (res.error) {
        this.state = 'error'
        this.error = res.error
        this.success = ''
        this.$refs.err.play()
      } else if (res?.isOut) {
        this.state = 'out'
        this.success = 'Out'
        this.error = ''
        this.$refs.out.play()
      } else if (res?.id) {
        this.state = 'in'
        this.success = 'In'
        this.error = ''
        this.$refs.in.play()
      } else {
        this.state = 'error'
        this.error = 'Unknown error'
        this.success = ''
        this.$refs.err.play()
      }
    },
    async onDetect(promise) {
      try {
        clearTimeout(this.idle)
        clearTimeout(this.idle2)
      } catch {
        //
      }

      try {
        const { content } = await promise
        await this.log(content)
          .then(() => {
            this.loading = false
            this.idle2 = setTimeout(() => {
              if (this.state !== 'ready' && this.state !== 'loading') {
                this.state = 'ready'
                this.error = ''
                this.success = ''
              }
            }, 3000)

            this.idle = setTimeout(() => {
              if (this.state === 'ready') {
                let tmp = this.camera
                this.toggleCamera()
                setTimeout(() => {
                  this.camera = tmp
                }, 2000)
              }
            }, 15000)
          })
          .finally(() => {
            this.lastDecode = Date.now() * 1000
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
        console.log(error)
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
      } finally {
        // hide loading indicator
      }

      this.state = 'ready'
      this.error = ''
      this.success = ''
    },
    toggleCamera() {
      this.activeCamera = (this.activeCamera + 1)
      if (this.activeCamera >= this.cameras.length) this.activeCamera = 0
      this.camera = this.cameras[ this.activeCamera ]
    },
    toggleFlash() {
      this.flash = !this.flash
    },
  }
}
</script>