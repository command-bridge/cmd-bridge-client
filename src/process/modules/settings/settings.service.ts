import { IPCHandlerResponse } from "../../core/ipc-handler-response";
import { getAllSettings, resetSettings } from "../../core/store";

export class SettingsService {

    public static getSettings() {

        return IPCHandlerResponse.Success(getAllSettings());
    }

    public static resetSettings() {

        resetSettings();

        return IPCHandlerResponse.Success(getAllSettings());
    }    
}