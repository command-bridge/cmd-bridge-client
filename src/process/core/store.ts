import { existsSync, unlinkSync } from 'fs';
import path from 'path';
import { app } from 'electron';
import logger from './logger';
import Store from 'electron-store';
import { machineIdSync } from 'node-machine-id';
import { STORE_DEFAULTS } from '../../types/defaults';
import { getValue, setValue } from './store-sqlite';
import { getAllSettings as sqliteGetAllSettings,
    resetSettings as sqliteResetSettings,
    updateSettings as sqliteUpdateSettings,
 } from './store-sqlite';

export type CommandBridgeClientStore = {
    access_token?: string,
    environment?: string,
    auto_startup: boolean,
    backend_api_address: string;
    install_date: string;
}

/**
 * This is a deprecated function that initializes the store.
 * It is kept for backward compatibility but should not be used in new code.
 * For new code, we using the SQLite-based store system.
 * @deprecated 
 */
export function loadOrCreateNewStoreIfFail() {

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

// Public API (same as before)
export function setAccessToken(token: string) { setValue('access_token', token); }
export function setEnvironment(env: string) { setValue('environment', env); }
export function setInstallDate(date: Date) { setValue('install_date', date.toISOString()); }

export function getAccessToken() { return getValue<string>('access_token'); }
export function getEnvironment() { return getValue<string>('environment'); }
export function getAutoStartup() { return getValue<boolean>('auto_startup'); }
export function getBackendAPIAddress() { return getValue<string>('backend_api_address'); }
export function getInstallDate() { return getValue<string>('install_date'); }

export function getAllSettings() {
    return sqliteGetAllSettings();
}

export function resetSettings() {
    sqliteResetSettings();
}

export function updateSettings(newSettings: CommandBridgeClientStore) {
    sqliteUpdateSettings(newSettings);
}

logger.info('Configuration system initialized');