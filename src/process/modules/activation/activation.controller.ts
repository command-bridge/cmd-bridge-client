import { RegisterIPC } from "../../core/decorators/register-ipc.decorator";
import { ActivationService } from "./activation.service";
import { IController } from "../controllers";

export class ActivationController implements IController {

    @RegisterIPC('activation')
    public static sendActivate(activationCode: string) {

        return ActivationService.sendActivate(activationCode);
    }

    @RegisterIPC('is-activated')
    public static isActivated() {

        return ActivationService.isActivated();
    }
}


 