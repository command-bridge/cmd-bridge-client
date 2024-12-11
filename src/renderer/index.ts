import './logger';
import './app.css';
import { createApp } from 'vue';
import App from './App.vue';

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Routes
import router from './router';
import { loadInitialData } from './store';

loadInitialData().then(() => {
    // Only create the app and start the router after state is loaded
    const vuetify = createVuetify({
        components,
        directives,      
    })

    const app = createApp(App);

    app.use(vuetify);
    app.use(router);

    app.mount('#app');
}).catch(error => {

    console.error('Failed loading initial data:');
    console.error(error);
});

