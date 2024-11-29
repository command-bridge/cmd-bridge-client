import { app, BrowserWindow } from "electron";
import { SSEAction } from "../core/decorators/sse-actions.decorator";

export class SSERestartService {

    @SSEAction('restart')
    public static restart() {

        const windows = BrowserWindow.getAllWindows();

        windows.forEach(window => window.close());
      
        app.relaunch();
        app.exit(0);
    }
}