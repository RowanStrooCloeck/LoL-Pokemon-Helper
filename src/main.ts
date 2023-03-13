import { createApp } from 'vue'
import { Quasar } from 'quasar'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'

// Import Quasar css
import 'quasar/dist/quasar.css'

import App from './App.vue'

import './assets/style/main.css'

const app = createApp(App);

app.use(Quasar, {
    plugins: {}, // import Quasar plugins and add here
})

app.config.globalProperties.locale = "en-GB";

app.mount('#app');