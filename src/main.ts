import { createApp } from 'vue'
import App from './App.vue'

import './assets/main.css'

const app = createApp(App);

app.config.globalProperties.locale = "en-GB";

app.mount('#app');