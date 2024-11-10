
import { RegisterIPC } from "../../core/decorators/register-ipc.decorator";
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
}


 