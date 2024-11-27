
import { RegisterIPC } from "../../core/decorators/register-ipc.decorator";
import { CommandBridgeClientStore } from "../../core/store";
import { IController } from "../controllers";
import { SettingsService } from "./settings.service";

export class SettingsController implements IController {

    @RegisterIPC('get-settings')
    public getSettings() {

        return SettingsService.getSettings()
    }

    @RegisterIPC('reset-settings')
    public resetSettings() {

        return SettingsService.resetSettings()
    }    

    @RegisterIPC('update-settings')
    public updateSettings(updatedSettings: CommandBridgeClientStore) {

        return SettingsService.updateSettings(updatedSettings);
    }    
}


 