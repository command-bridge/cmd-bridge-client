import { APIClientService } from "../../core/api-client.service";
import { IPCHandlerResponse } from "../../core/ipc-handler-response";
import { getAccessToken, setAccessToken, setEnvironment } from "../../core/store";
import { machineIdSync } from 'node-machine-id';
import { DeviceActivateDto } from "./device-activate.dto";
import { AuthenticateService } from "../../core/authenticate.service";

export class ActivationService {

    public static async sendActivate(activationCode: string) {

        const result = await APIClientService.post<DeviceActivateDto>('device/activate', {
            activation_code: activationCode,
            device_hash: machineIdSync(true)
        });

        setAccessToken(result.data.integration_token);
        setEnvironment(result.data.environment);

        await AuthenticateService.initiate();

        return IPCHandlerResponse.Success({ access_token: result.data.integration_token });
    }

    public static isActivated() {

        return IPCHandlerResponse.Success(getAccessToken() !== '' ? true : false)
    }
}