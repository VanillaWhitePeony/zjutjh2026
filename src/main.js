import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'

const app = createApp(App)
app.use(router)   // 必须调用
app.use(createPinia())
app.mount('#app')
//createApp(App).use(router).mount('#app')