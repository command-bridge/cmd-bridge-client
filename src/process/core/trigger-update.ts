import { NsisUpdater } from "electron-updater"
import { isDevelopment } from "../../shared/helpers/is-development.helper";
import { UPDATE_FEED_URL } from "../../../configs/consts";

export async function triggerUpdate() {

    const autoUpdater = new NsisUpdater({
        provider: 'generic',
        url: isDevelopment() ? 'http://localhost:5000' : UPDATE_FEED_URL,
    })
    const result = await autoUpdater.checkForUpdatesAndNotify()

    if(result?.updateInfo) {

        console.log('Updating to ', result.updateInfo.version);
    }

    autoUpdater.on('update-available', () => {
        console.log('Update available. Downloading...');
    });

    autoUpdater.on('update-not-available', () => {
        console.log('No updates available.');
    });

    autoUpdater.on('update-downloaded', () => {
        console.log('Update downloaded. Ready to install.');
        // Quit and install the update
        autoUpdater.quitAndInstall();
    });

    autoUpdater.on('error', (err) => {
        console.error('Error during update process:', err);
    });
}