import { IPCHandlerResponse } from "../../core/ipc-handler-response";
import { CommandBridgeClientStore, getAllSettings, resetSettings, updateSettings } from "../../core/store";

export class SettingsService {

    public static getSettings() {

        return IPCHandlerResponse.Success(getAllSettings());
    }

    public static resetSettings() {

        resetSettings();

        return IPCHandlerResponse.Success(getAllSettings());
    }

    public static updateSettings(updatedSettings: CommandBridgeClientStore) {

        updateSettings(updatedSettings)

        return IPCHandlerResponse.Success(true);
    }      
}