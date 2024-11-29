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
  import { defineComponent, ref, onMounted, onUnmounted } from "vue";
  import { ipcRenderer } from "electron";
  
  export default defineComponent({
    name: "HealthScreen",
    setup() {
      const isConnected = ref(false);
      const sessionDuration = ref(0);
      const totalUptime = ref(0);
      const connectionErrors = ref(0);
      const packetLoss = ref(0.2); // Perda de pacotes em percentual
      const connectionIntegrity = ref(95); // Perda de pacotes em percentual
  
      const handleStatusUpdate = (
        event: any,
        status: {
          isConnected: boolean;
          sessionDuration: number;
          totalUptime: number;
          connectionErrors: number;
        }
      ) => {
        isConnected.value = status.isConnected;
        sessionDuration.value = status.sessionDuration;
        totalUptime.value = status.totalUptime;
        connectionErrors.value = status.connectionErrors;
      };
  
      onMounted(() => {
        ipcRenderer.on("sse-status-update", handleStatusUpdate);
  
        onUnmounted(() => {
          ipcRenderer.removeListener("sse-status-update", handleStatusUpdate);
        });
      });
  
      const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
      };
  
      return {
        isConnected,
        sessionDuration,
        totalUptime,
        connectionErrors,
        formatTime,
        packetLoss,
        connectionIntegrity,
      };
    },
  });
  </script>
  
  