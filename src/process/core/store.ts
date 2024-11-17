import Store from 'electron-store';

// Configurando o electron-store com criptografia
export type CommandBridgeClientStore = {
    access_token?: string,
    environment?: string,
    auto_startup: boolean,
}
const store = new Store<CommandBridgeClientStore>({
    encryptionKey: 'chave-secreta-segura',
    defaults: {
        access_token: '',
        environment: '',
        auto_startup: true
    }
});

export function setAccessToken(token: string) {
    store.set('access_token', token);
}

export function setEnvironment(environment: string) {
    store.set('environment', environment);
}

export function getAccessToken() {
    return store.get('access_token');
}

export function getAllSettings() {
    return store.store;
}

export function resetSettings() {
    store.clear();
}

console.log('Loaded store', store.store);