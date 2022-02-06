import { createApp } from 'vue'
import store from './store'
import router from './router'
import App from './App.vue'
import VueQrcodeReader from "qrcode-reader-vue3";

import '@/styles/global.scss'

const app = createApp(App)
app.use(router)
app.use(store)
app.use(VueQrcodeReader)
app.mount('#app')