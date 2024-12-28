import Store from 'electron-store';
import { STORE_DEFAULTS } from '../../types/defaults';
import { machineIdSync } from 'node-machine-id';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';
import { app } from 'electron';
import logger from './logger';

// Configurando o electron-store com criptografia
export type CommandBridgeClientStore = {
    access_token?: string,
    environment?: string,
    auto_startup: boolean,
    backend_api_address: string;
    install_date: string;
}

const store = loadOrCreateNewStoreIfFail();

function loadOrCreateNewStoreIfFail() {

    try {
        return new Store<CommandBridgeClientStore>({
            encryptionKey: machineIdSync(),
            defaults: STORE_DEFAULTS
        });
    } catch(error) {
    
        logger.warn('Failed to initialize the store. Resetting due to machine ID change or corrupted store.', error);

        try {
            const storeFileName = 'config.json';
            const storePath = path.join(app.getPath('userData'), storeFileName);
            
            if (existsSync(storePath)) {
                unlinkSync(storePath);
                logger.info('Store file removed successfully.');
            }
        } catch (fileError) {
            logger.error('Failed to remove the old store file:', fileError);
        }
    
        return new Store<CommandBridgeClientStore>({
            encryptionKey: machineIdSync(),
            defaults: STORE_DEFAULTS
        });
    }
}

export function setAccessToken(token: string) {
    store.set('access_token', token);
}

export function setEnvironment(environment: string) {
    store.set('environment', environment);
}

export function setInstallDate(date: Date) {
    store.set('install_date', date.toISOString());
}

export function getAccessToken() {
    return store.get('access_token');
}

export function getEnvironment() {
    return store.get('environment');
}

export function getAutoStartup() {
    return store.get('auto_startup');
}

export function getBackendAPIAddress() {
    return store.get('backend_api_address');
}

export function getInstallDate() {
    return store.get('install_date');
}

export function getAllSettings() {
    return store.store;
}

export function resetSettings() {
    store.clear();
}

export function updateSettings(newSettings: CommandBridgeClientStore) {
    store.set(newSettings);
}

logger.info('Loaded store', store.store);