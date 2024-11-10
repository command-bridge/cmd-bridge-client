<template>
    <v-form ref="form" v-model="valid" lazy-validation>
        <h1>{{ t('activation.title') }}</h1>
        <p>{{ t('activation.description') }}</p>

        <!-- Alerta de erro, exibido somente se houver mensagem de erro -->
        <v-alert v-if="errorMessage" type="error" dismissible @input="errorMessage = ''">
            {{ errorMessage }}
        </v-alert>

        <v-otp-input v-model="model.validation_key" length="6" :rules="[rules.required]"></v-otp-input>
        <v-btn color="primary" @click="onSubmit" :disabled="!model.isValid()">{{ t('activation.actionButton') }}</v-btn>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import i18next from '../../../shared/i18n';
import { ipcRenderer } from 'electron';
import { ActivationModel } from './activation.model';
import { IPCHandlerResponse } from '../../../process/core/ipc-handler-response';
import { loadInitialData } from '../../../renderer/store';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'Activation',
    setup() {

        const router = useRouter();
        const model = ref(new ActivationModel());
        const errorMessage = ref('');
        const valid = ref(false);

        const rules = {
            required: (value: string) => !!value || 'Required.',
            length: (value: string) => value.length === 6 || 'Fill all digits.'
        };

        // Método para tradução
        const t = (key: string) => i18next.t(key);

        const onSubmit = async () => {
            console.log('OTP Code:', model.value.validation_key);

            const response = IPCHandlerResponse.From(await ipcRenderer.invoke('activation', model.value.validation_key));

            if (response.isError()) {

                errorMessage.value = response.getError() || 'Unknown error';
            } else {

                errorMessage.value = '';

                await loadInitialData();

                router.push('/');

                console.log(response.getResponse());
            }
        };

        return {
            model,
            valid,
            errorMessage,
            rules,
            t,
            onSubmit
        };
    },
    methods: {
        t: (key: string) => i18next.t(key)
    }
});
</script>