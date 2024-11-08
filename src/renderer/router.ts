import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import ActivationView from './views/activation/activation.view.vue';
import SettingsView from './views/settings/settings.view.vue';
import HealthView from './views/health/health.view.vue';
import { state } from './store';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Redirector',
        component: {
            template: '<div></div>', // Placeholder component for redirection
        },
    },
    {
        path: '/activation',
        name: 'Activation',
        component: ActivationView,
        meta: { requiresActivation: false },
    },
    {
        path: '/settings',
        name: 'Settings',
        component: SettingsView,
        meta: { requiresActivation: true },
    },
    {
        path: '/health',
        name: 'Health',
        component: HealthView,
        meta: { requiresActivation: true },
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Middleware para controle de navegação
router.beforeEach((to, from, next) => {

    if (to.name === 'Redirector') {
        if (state.isActivated) {

            next('/health');
        } else {

            next('/activation');
        }
    }
    else if (to.meta.requiresActivation && !state.isActivated) {

        next('/activation');
    } else {

        next();
    }
});


export default router;