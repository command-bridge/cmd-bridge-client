<template>
    <v-container>
      <v-card class="mx-auto" max-width="400">
        <v-card-title>Settings</v-card-title>
  
        <v-card-text>
          <!-- Server Address (Read-only) -->
          <v-text-field
            label="Server Address"
            :value="serverAddress"
            readonly
            prepend-icon="mdi-server"
          />
  
          <!-- Auto-Start Checkbox -->
          <v-checkbox
            label="Start with Windows"
            v-model="autoStart"
          />
  
          <!-- Reset Button -->
          <v-btn color="error" @click="resetSettings" block>
            Reset All Settings
          </v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { SERVER_ADDRESS } from '@configs/consts';
  
  export default defineComponent({
    name: 'SettingsScreen',
    setup() {
      // State for auto-start, defaulting to true
      const autoStart = ref(true);
  
      // Server address (from constants, read-only)
      const serverAddress = SERVER_ADDRESS;
  
      // Method to reset settings
      const resetSettings = () => {
        autoStart.value = true; // Reset autoStart to default value
        console.log('All settings have been reset to default.');
      };
  
      return {
        serverAddress,
        autoStart,
        resetSettings,
      };
    },
  });
  </script>
  
  <style scoped>
  /* Optional: Adjust styling for the layout */
  </style>
  