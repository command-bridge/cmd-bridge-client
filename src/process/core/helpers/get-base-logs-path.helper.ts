import { app } from "electron";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const BASE_LOGS_PATH = join(app.getPath('userData'), 'logs');

export function getBaseLogsPath() {

    if (!existsSync(BASE_LOGS_PATH)) {
        mkdirSync(BASE_LOGS_PATH, { recursive: true });
    }

    return BASE_LOGS_PATH;
}