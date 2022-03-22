import { createApp } from 'vue'
import store from './store'
import router from './router'
import App from './App.vue'
import VueQrcodeReader from "qrcode-reader-vue3";

import '@/styles/global.scss'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faCamera,
  faCameraRotate,
  faLightbulb,
  faSpinner,
  faFileImport,
  faFileExport,
  faTrash,
  faSignOut,
  faSignIn,
  faQrcode,
  faTasks,
  faDashboard,
  faList,
  faFile,
  faUser,
  faKey,
  faAt
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faCamera)
library.add(faCameraRotate)
library.add(faLightbulb)
library.add(faSpinner)
library.add(faFileImport)
library.add(faFileExport)
library.add(faTrash)
library.add(faSignOut)
library.add(faSignIn)
library.add(faTasks)
library.add(faDashboard)
library.add(faQrcode)
library.add(faList)
library.add(faFile)
library.add(faUser)
library.add(faKey)
library.add(faAt)


const app = createApp(App)
app.use(router)
app.use(store)
app.use(VueQrcodeReader)
app.component('icon', FontAwesomeIcon)

router.isReady().then(() => {
  app.mount('#app')
})