<template>
    <v-container class="d-flex align-center justify-center" style="height: 60vh">
        <v-card class="mx-auto text-center" max-width="400">
            <v-card-title>App Information</v-card-title>
            <v-card-text>
                <v-list-item>
                    <v-list-item-title>Version:</v-list-item-title>
                    <v-list-item-subtitle>{{ app.version }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                    <v-list-item-title>Build Date:</v-list-item-title>
                    <v-list-item-subtitle>{{ app.buildDate }}</v-list-item-subtitle>
                </v-list-item>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { IPCHandlerResponse } from '../../../process/core/ipc-handler-response';
import { ipcRenderer } from 'electron';

export default defineComponent({
    name: 'HomeScreen',
    setup() {
        // Access version from package.json or environment variables
        const app = ref({
            version: '',
            buildDate: process.env.VUE_APP_BUILD_DATE
        });

        onMounted(async () => {

            app.value.version = await IPCHandlerResponse.From(await ipcRenderer.invoke('get-app-version')).getResponse<string>() || 'Unknown';
        });

        return {
            app
        };
    },
});
</script>

<style scoped>
/* Optional: Add custom styling */
</style>
