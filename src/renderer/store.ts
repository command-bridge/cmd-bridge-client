import { reactive } from 'vue';
import { IPCHandlerResponse } from '../process/core/ipc-handler-response';
import { IPCResponseIsActivated } from '../types/ipc-response/is-activated.type';
import { ipcRenderer } from 'electron';

const state = reactive({
    isActivated: false,
    loaded: false
});

export async function loadInitialData() {

    try {

        state.isActivated = await IPCHandlerResponse.From(await ipcRenderer.invoke('is-activated')).getResponse<IPCResponseIsActivated>();
    } catch (error) {

        console.error('Error retrieving isActivated status:', error);
    } finally {

        state.loaded = true;
    }
};
export { state };