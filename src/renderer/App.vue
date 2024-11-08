<template>
  <p v-if="!state.loaded">Loading...</p>
  <component v-else :is="layoutComponent" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import ActivationLayout from './layouts/Activation.layout.vue';
import MainLayout from './layouts/Main.layout.vue';
import { state } from './store';

export default defineComponent({
  name: 'App',
  setup() {
    const layoutComponent = computed(() => (state.isActivated ? MainLayout : ActivationLayout));

    return {
      layoutComponent,
      state,
    };
  },
});
</script>