
import { RegisterIPC } from "../../core/decorators/register-ipc.decorator";
import { IPCHandlerResponse } from "../../core/ipc-handler-response";
import { IController } from "../controllers";

export class AppController implements IController {

    @RegisterIPC('get-app-version')
    public getAppVersion() {
        return IPCHandlerResponse.Success(process.env.npm_package_version);
    } 
}
