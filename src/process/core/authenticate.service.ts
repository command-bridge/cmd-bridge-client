import { machineIdSync } from "node-machine-id";
import { APIClientService } from "./api-client.service";
import { getAllSettings, getInstallDate } from "./store";
import { SSEService } from "./sse-service";
import { generateDeviceHash } from "./helpers/generate-device-hash.helper";

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

        const installDate = getInstallDate();

        const device_hash = installDate != '' 
            ? generateDeviceHash(new Date(installDate)) 
            : machineIdSync(true) //retro compatibility with older versions than 0.0.8 where there was no install date;

        const result = await APIClientService.post<DeviceLoginDto>('device/login', {
            integration_token: access_token,
            environment: environment,
            device_hash,
        });

        this.sessionToken = result.data.token;

        APIClientService.setToken(this.sessionToken);
        SSEService.initiate();
    }
}