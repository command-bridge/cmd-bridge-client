import { IPCHandlerResponse } from "../../core/ipc-handler-response";
import { getAccessToken, setAccessToken } from "../../core/store";

export class ActivationService {

    public static sendActivate(activationCode: string) {

        console.log('Get code (2)', activationCode);

        if (activationCode.length < 6) {

            return IPCHandlerResponse.Error('Wrong activation code');
        }

        setAccessToken(activationCode.toString());

        return IPCHandlerResponse.Success({ access_token: 'abcd-1234' });
    }

    public static isActivated() {

        return IPCHandlerResponse.Success(getAccessToken() !== '' ? true : false)
    }
}