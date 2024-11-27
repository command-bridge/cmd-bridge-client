<template>
    <v-container>
        <v-card class="mx-auto" max-width="400">
            <v-card-title>Settings</v-card-title>

            <v-card-text>
                <!-- Server Address (Read-only) -->
                <v-text-field 
                    label="Backend API Address" 
                    :value="settings.backend_api_address" 
                    readonly 
                    prepend-icon="mdi-server" 
                />

                <!-- Auto-Start Checkbox -->
                <v-checkbox 
                    label="Start with Windows" 
                    v-model="settings.auto_startup" 
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
import { defineComponent, onMounted, ref, watch } from 'vue';
import { IPCHandlerResponse } from '../../../process/core/ipc-handler-response';
import { CommandBridgeClientStore } from '../../../process/core/store';
import { loadInitialData } from '../../../renderer/store';
import { ipcRenderer } from 'electron';
import { useRouter } from 'vue-router';
import { STORE_DEFAULTS } from '../../../types/defaults';

export default defineComponent({

    name: 'SettingsScreen',
    setup() {

        const router = useRouter();
        const settings = ref<CommandBridgeClientStore>(STORE_DEFAULTS);

        onMounted(async () => {

            settings.value = await IPCHandlerResponse.From(await ipcRenderer.invoke('get-settings')).getResponse<CommandBridgeClientStore>();
        
            watch(settings, async (newSettings) => {

                const plainSettings = JSON.parse(JSON.stringify(newSettings));
                await ipcRenderer.invoke('update-settings', plainSettings)
            }, { deep: true });
        });

        // Method to reset settings
        const resetSettings = async () => {

            const resetedSettings = await IPCHandlerResponse.From(await ipcRenderer.invoke('reset-settings')).getResponse<CommandBridgeClientStore>()

            if (resetedSettings) {

                settings.value = resetedSettings;

                console.log('All settings have been reset to default.');

                await loadInitialData();

                router.push('/');
            }
        }

        return {
            settings,
            resetSettings,
        };
    },
});
</script>

<style scoped>
/* Optional: Adjust styling for the layout */
</style>