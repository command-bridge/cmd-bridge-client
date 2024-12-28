import { getAccessToken, getEnvironment, getInstallDate } from "../store";

export function getActivationSettingsOrFail() {

    const access_token = getAccessToken();
    const environment = getEnvironment();
    const installDate = getInstallDate();

    if (!access_token || access_token === '') {

        throw new Error('Install not activated');
    }

    return { access_token, environment, installDate }
}

export function isInstallActivated() {

    try {

        getActivationSettingsOrFail();

        return true;
    } catch (error) {

        return false;
    }
}