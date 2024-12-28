import { APIClientService } from "../../core/api-client.service";
import { IPCHandlerResponse } from "../../core/ipc-handler-response";
import { getAccessToken, setAccessToken, setEnvironment, setInstallDate } from "../../core/store";
import { DeviceActivateDto } from "./device-activate.dto";
import { generateDeviceHash } from "../../core/helpers/generate-device-hash.helper";
import { SSEService } from "../../core/sse-service";

export class ActivationService {

    public static async sendActivate(activationCode: string) {

        const installDate = new Date();
        const hash = generateDeviceHash(installDate);

        const result = await APIClientService.post<DeviceActivateDto>('device/activate', {
            activation_code: activationCode,
            device_hash: hash
        });

        setAccessToken(result.data.integration_token);
        setEnvironment(result.data.environment);
        setInstallDate(installDate);

        await SSEService.initiate();

        return IPCHandlerResponse.Success({ access_token: result.data.integration_token });
    }

    public static isActivated() {

        return IPCHandlerResponse.Success(getAccessToken() !== '' ? true : false)
    }
}