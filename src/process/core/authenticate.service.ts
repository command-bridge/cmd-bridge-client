import { machineIdSync } from "node-machine-id";
import { APIClientService } from "./api-client.service";
import { getAllSettings } from "./store";
import { SSEService } from "./sse-service";

type DeviceLoginDto = { 
    token: string;
}

export class AuthenticateService {

    static sessionToken: string;

    static async initiate() {

        const { access_token, environment } = getAllSettings()

        if(!access_token && access_token === '') {

            return;
        }

        const result = await APIClientService.post<DeviceLoginDto>('device/login', {
            integration_token: access_token,
            environment: environment,
            device_hash: machineIdSync(true)
        });

        this.sessionToken = result.data.token;

        APIClientService.setToken(this.sessionToken);
        SSEService.initiate();
    }
}