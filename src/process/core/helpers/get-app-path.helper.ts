import { app } from "electron";
import { dirname } from "path";

export function getAppPath() {

    const exePath = app.getPath('exe');
    const exeDirectory = dirname(exePath);

    return exeDirectory;
}