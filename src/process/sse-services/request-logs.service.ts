import { UUID } from "crypto";
import { SSEAction } from "../core/decorators/sse-actions.decorator";
import { readFileSync } from "fs";
import { join, resolve } from "path";
import { APIClientService } from "../core/api-client.service";
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { AxiosError } from "axios";
import logger from "../core/logger";
import { getBaseLogsPath } from "../core/helpers/get-base-logs-path.helper";

dayjs.extend(timezone);

export interface IRequestLogs {
    uuid: UUID,
}

export class SSERequestLogs {

    @SSEAction('logs')
    public static async requestLogs(payload: IRequestLogs) {
        try {

            const logs = readFileSync(this.getTodayLogPath(), 'utf8');

            await APIClientService.post('device-events/receive-logs', { ...payload, logs });
        } catch(err) {

            const error = err as AxiosError;

            logger.error(`[${error.name}] ${error.message}:`, error.response?.data);
        }
    }

    private static getTodayLogPath() {    
        const utcDateString = dayjs().format('YYYY-MM-DD');
        const logFileName = `process-${utcDateString}.log`;
    
        return join(getBaseLogsPath(), logFileName);
    };
}