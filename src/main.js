import { createApp } from 'vue'
import store from './store'
import router from './router'
import App from './App.vue'
import VueQrcodeReader from "qrcode-reader-vue3";

import '@/styles/global.scss'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCamera, faCameraRotate, faLightbulb, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faCamera)
library.add(faCameraRotate)
library.add(faLightbulb)
library.add(faSpinner)

const app = createApp(App)
app.use(router)
app.use(store)
app.use(VueQrcodeReader)
app.component('icon', FontAwesomeIcon)
app.mount('#app')