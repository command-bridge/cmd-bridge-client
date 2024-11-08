<!-- MainLayout.vue -->
<template>
  <v-app>
    <!-- Sidebar (Navigation Drawer) -->
    <SideMenu v-model="drawer" @toggleDrawer="toggleDrawer"></SideMenu>

    <!-- App Bar (Top Navigation) -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon> <!-- Toggle drawer button -->
      <v-app-bar-title>{{ APP_NAME }}</v-app-bar-title>
    </v-app-bar>

    <!-- Main Content Area -->
    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import SideMenu from './SideMenu.layout.vue'
import { APP_NAME } from '@configs/consts';

export default defineComponent({
  name: 'MainLayout',
  components: {
    SideMenu
  },
  setup() {
    const drawer = ref(true); // Controls sidebar visibility

    const toggleDrawer = () => { drawer.value = !drawer.value };

    const selectedItem = ref(null);

    return {
      drawer,
      selectedItem,
      toggleDrawer,
      APP_NAME
    };
  },
});
</script>
