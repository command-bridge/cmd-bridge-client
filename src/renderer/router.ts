import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import ActivationView from './views/activation/activation.view.vue';
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
        path: '/configuration',
        name: 'Configuration',
        component: ConfigurationView,
        meta: { requiresConfiguration: true }, // Meta para verificar o estado de configuração
    },
    {
        path: '/health',
        name: 'Status',
        component: StatusView,
        meta: { requiresActivation: true, requiresConfiguration: true }, // Meta para verificar ativação e configuração
    },*/
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