import { machineIdSync } from "node-machine-id";
import { APIClientService } from "./api-client.service";
import { getAllSettings, getInstallDate } from "./store";
import { generateDeviceHash } from "./helpers/generate-device-hash.helper";
import logger from "./logger";
import { isTokenExpired } from "./helpers/is-token-expired.helper";
import { getActivationSettingsOrFail } from "./helpers/get-activation-settings.helper";

type DeviceLoginDto = {
    token: string;
}

export class AuthenticateService {

    static async refreshToken() {

        const currentToken = APIClientService.getToken();

        if (currentToken && currentToken.length > 0) {

            if (!isTokenExpired(currentToken)) {
                return;
            }

            logger.info('Token expired. Going refresh');
        }

        const { access_token, environment, installDate } = getActivationSettingsOrFail()

        const device_hash = installDate && installDate != ''
            ? generateDeviceHash(new Date(installDate as string))
            : machineIdSync(true) //retro compatibility with older versions than 0.0.8 where there was no install date;

        const sessionToken = await this.tokenRequestWithRetry(device_hash, access_token, environment);
        APIClientService.setToken(sessionToken);
    }

    static async tokenRequestWithRetry(device_hash: string, access_token?: string, environment?: string) {

        let token: string | undefined = undefined;
        let retries = 0;
        const initialRetryMs = 15000;
        const eachRetryIncreaseMs = 5000;
        const maxRetryIntervalMs = 60000 * 5;

        while (!token) {

            try {
                const result = await APIClientService.post<DeviceLoginDto>('device/login', {
                    integration_token: access_token,
                    environment: environment,
                    device_hash,
                });

                retries = 0;

                token = result.data.token
            } catch (error) {

                const retryDelay = Math.min(initialRetryMs + (eachRetryIncreaseMs * retries), maxRetryIntervalMs);

                logger.error(error)
                logger.warn(`Failed to request token at #${retries}... Trying again in ${Math.floor(retryDelay / 1000)}s.`);

                retries++;

                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }

        return token;
    }
}