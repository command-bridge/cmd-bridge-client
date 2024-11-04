import { createRouter, createWebHistory } from 'vue-router';
import ActivationView from './views/activation/activation.view.vue';
/*import ConfigurationView from './components/configuration.view.vue';
import StatusView from './components/status.view.vue';*/

const routes = [
    { path: '/', redirect: '/activation' },
    {
        path: '/activation',
        name: 'Activation',
        component: ActivationView,
        meta: { requiresActivation: true }, // Meta para verificar o estado de ativação
    }/*,
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

// Funções simuladas para verificar o estado de ativação e configuração
function isActivated() {
    return localStorage.getItem('activated') === 'true';
}

function isConfigured() {
    return localStorage.getItem('configured') === 'true';
}

// Middleware para controle de navegação
router.beforeEach((to, from, next) => {
    if (to.meta.requiresActivation && !isActivated()) {
      // Só redireciona para "Activation" se não estiver lá
      if (to.name !== 'Activation') {
        next({ name: 'Activation' });
      } else {
        next();
      }
    } else if (to.meta.requiresConfiguration && !isConfigured()) {
      // Só redireciona para "Configuration" se não estiver lá
      if (to.name !== 'Configuration') {
        next({ name: 'Configuration' });
      } else {
        next();
      }
    } else {
      next();
    }
  });
  

export default router;