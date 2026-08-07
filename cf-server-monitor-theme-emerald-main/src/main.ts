import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { setupIconify } from '@/utils/iconify'
import { message } from '@/utils/message'
import { publicAsset } from '@/utils/publicAsset'
import App from './App.vue'
import router from './router'

import './styles/main.css'

const favicon = document.createElement('link')
favicon.rel = 'icon'
favicon.href = publicAsset('assets/runsing-logo.jpeg')
document.head.appendChild(favicon)

window.$message = message

setupIconify().catch((err) => {
  console.warn('[main] iconify init failed', err)
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
