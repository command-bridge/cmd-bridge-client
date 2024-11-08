<template>
    <v-container>
      <v-card class="mx-auto" max-width="600">
        <v-card-title class="text-h5">Client Health Status</v-card-title>
  
        <v-card-text>
          <!-- Connection Status Indicator -->
          <v-row align="center">
            <v-icon :color="isConnected ? 'green' : 'red'" large>
              {{ isConnected ? 'mdi-check-circle' : 'mdi-alert-circle' }}
            </v-icon>
            <v-spacer></v-spacer>
            <div>
              <span class="text-subtitle-1 font-weight-medium">Connection Status:</span>
              <span>{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
            </div>
          </v-row>
          <v-divider class="my-4"></v-divider>
  
          <!-- Session Duration Indicator -->
          <v-row align="center">
            <v-icon color="blue" large>mdi-timer-sand</v-icon>
            <v-spacer></v-spacer>
            <div>
              <span class="text-subtitle-1 font-weight-medium">Session Duration:</span>
              <span>{{ formatTime(sessionDuration) }}</span>
            </div>
          </v-row>
          <v-divider class="my-4"></v-divider>
  
          <!-- Total Uptime Indicator -->
          <v-row align="center">
            <v-icon color="purple" large>mdi-clock-outline</v-icon>
            <v-spacer></v-spacer>
            <div>
              <span class="text-subtitle-1 font-weight-medium">Total Uptime:</span>
              <span>{{ formatTime(totalUptime) }}</span>
            </div>
          </v-row>
          <v-divider class="my-4"></v-divider>
  
          <!-- Connection Integrity Indicator -->
          <v-row align="center">
            <v-progress-circular :value="connectionIntegrity" :color="connectionIntegrity > 80 ? 'green' : 'orange'" size="40">
              {{ connectionIntegrity }}%
            </v-progress-circular>
            <v-spacer></v-spacer>
            <div>
              <span class="text-subtitle-1 font-weight-medium">Connection Integrity:</span>
              <span>{{ connectionErrors }} errors ({{ packetLoss }}% packet loss)</span>
            </div>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  
  export default defineComponent({
    name: 'HealthScreen',
    setup() {
      // Example data - replace with real data or methods to fetch these stats
      const isConnected = ref(true); // Connection status
      const sessionDuration = ref(3600); // Session duration in seconds
      const totalUptime = ref(86400); // Total uptime in seconds (24 hours)
      const connectionIntegrity = ref(95); // Connection integrity in percentage
      const connectionErrors = ref(3); // Total connection errors
      const packetLoss = ref(0.2); // Packet loss in percentage
  
      // Example timer update - simulates uptime increment
      onMounted(() => {
        setInterval(() => {
          sessionDuration.value += 1;
          totalUptime.value += 1;
        }, 1000); // Update every second
      });
  
      // Helper method to format time in HH:mm:ss
      const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
      };
  
      return {
        isConnected,
        sessionDuration,
        totalUptime,
        connectionIntegrity,
        connectionErrors,
        packetLoss,
        formatTime,
      };
    },
  });
  </script>
  
  <style scoped>
  .v-icon {
    margin-right: 10px;
  }
  </style>
  