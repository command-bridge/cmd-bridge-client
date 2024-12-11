import { NsisUpdater } from "electron-updater"
import { isDevelopment } from "../../shared/helpers/is-development.helper";
import { UPDATE_FEED_URL } from "../../../configs/consts";
import logger from "./logger";

export async function triggerUpdate() {

    const autoUpdater = new NsisUpdater({
        provider: 'generic',
        url: isDevelopment() ? 'http://localhost:5000' : UPDATE_FEED_URL,
    })
    const result = await autoUpdater.checkForUpdatesAndNotify()

    if(result?.updateInfo) {

        logger.info('Updating to ', result.updateInfo.version);
    }

    autoUpdater.on('update-available', () => {
        logger.info('Update available. Downloading...');
    });

    autoUpdater.on('update-not-available', () => {
        logger.info('No updates available.');
    });

    autoUpdater.on('update-downloaded', () => {
        logger.info('Update downloaded. Ready to install.');
        // Quit and install the update
        autoUpdater.quitAndInstall();
    });

    autoUpdater.on('error', (err) => {
        logger.error('Error during update process:', err);
    });
}