import { RegisterIPC } from "../../core/decorators/register-ipc.decorator";
import { ActivationService } from "./activation.service";
import { IController } from "../controllers";

export class ActivationController implements IController {

    @RegisterIPC('activation')
    public sendActivate(activationCode: string) {

        return ActivationService.sendActivate(activationCode);
    }

    @RegisterIPC('is-activated')
    public isActivated() {

        return ActivationService.isActivated();
    }
}


 