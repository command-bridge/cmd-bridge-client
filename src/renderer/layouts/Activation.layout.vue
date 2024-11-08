<template>
    <v-app>
      <div id="app">
        <router-view></router-view>
      </div>
    </v-app>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'ActivationLayout'
  });
  </script>
  