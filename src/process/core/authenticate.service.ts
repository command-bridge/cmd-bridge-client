import { machineIdSync } from "node-machine-id";
import { APIClientService } from "./api-client.service";
import { getAccessToken, getAllSettings } from "./store";

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

        console.log('Token loaded', this.sessionToken);
    }
}