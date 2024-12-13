import { app, BrowserWindow } from "electron";
import { APIClientService } from "./api-client.service";
import { randomUUID, UUID } from "crypto";
import { getBackendAPIAddress } from "./store";
import { EventSource } from "eventsource";
import { AxiosError } from "axios";
import { SSEHandler } from "./sse-handler";
import "../sse-services"
import logger from "./logger";

interface SSEToken {
    token: UUID;
}

class SSEConnection {

    eventSource: EventSource;
    connectionId = randomUUID();

    constructor(url: string) {

        this.eventSource = new EventSource(url);

        this.eventSource.addEventListener('message', this.handleMessage.bind(this));
        this.eventSource.addEventListener('error', this.handleError.bind(this));
        this.eventSource.addEventListener('open', this.handleOpen.bind(this));
    }

    handleOpen(event: MessageEvent) {
        logger.info(`[${this.connectionId}] Connected to SSE`);
        SSEService.setConnection(this);
    }

    handleMessage(event: MessageEvent) {
        const message = JSON.parse(event.data);
        SSEHandler.handleMessage(message);
    }

    handleError(event: MessageEvent) {
        logger.error(`[${this.connectionId}] SSE Error`, event);

        if(!SSEService.isConnected()) {

            this.destroy();
        }

        SSEService.reconnect('handleError');
    }

    destroy() {

        logger.info(`[${this.connectionId}] Closing connection`);

        this.eventSource.removeEventListener('message', this.handleMessage);
        this.eventSource.removeEventListener('error', this.handleError);
        this.eventSource.removeEventListener('open', this.handleOpen);

        this.eventSource.close();
    }

    getReadyState() {
        return this.eventSource.readyState;
    }
};

export class SSEService {
    private static client = APIClientService.getClient();
    private static sseConnection: SSEConnection | null = null;
    private static sessionStartTime: Date | null = null;
    private static lastHeartbeat: number = 0;
    private static totalUptimeStart = Date.now();
    private static connectionErrors = 0;

    public static async initiate() {
        await this.connect();
        setInterval(() => this.sendStatusToRenderer(), 1000);
        this.connectionHealthCheck();
    }

    public static setLastHeartbeat() {

        this.lastHeartbeat = Date.now();
    }

    public static setConnection(connection: SSEConnection) {

        this.sessionStartTime = new Date();
        this.sseConnection = connection;
        this.setLastHeartbeat();
    }

    private static async connect() {

        try {

            await this.client.post<SSEToken>("/device-events", {
                version: process.env.npm_package_version,
            });

            const token = APIClientService.getToken();
            const url = `${getBackendAPIAddress()}/device-events/stream/?token=${token}`;

            new SSEConnection(url);
        } catch (error) {

            if (error instanceof AxiosError) {

                logger.error('SSE Axios Error', error.message);
            } else {

                logger.error("SSE Error:", error);
            }

            await this.reconnect('connect throw');
        }
    }

    public static async reconnect(origin: string) {

        this.connectionErrors++;

        if (this.sseConnection) {

            this.sseConnection.destroy();

            await new Promise((resolve) => setTimeout(resolve, 100));

            this.sseConnection = null;
        }

        logger.info('Reconnecting to SSE in 5s...', origin)
        await new Promise((resolve) => setTimeout(resolve, 5000));

        await this.connect();
    }

    private static async connectionHealthCheck() {

        setInterval(() => {

            if(!this.sseConnection) {

                return;
            }

            const heartbeatFailed = this.lastHeartbeat + (60 * 1000) < Date.now();

            if (heartbeatFailed) {
                logger.warn("Heartbeat failed. Forcing reconnect...");
                this.reconnect('heartbeat');
            }
        }, 5000);
    }

    public static isConnected() {

        if(!this.sseConnection) {

            return false;
        }

        const state = this.sseConnection.getReadyState() || EventSource.CLOSED;
        const lastHeartbeatIsRecent = this.lastHeartbeat + (1000 * 30) >= Date.now();

        return state === EventSource.OPEN && lastHeartbeatIsRecent;
    }

    private static sendStatusToRenderer() {
        const sessionDuration = this.sessionStartTime
            ? Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000)
            : 0;
        const totalUptime = Math.floor((Date.now() - this.totalUptimeStart) / 1000);

        const status = {
            isConnected: this.isConnected(),
            sessionDuration,
            totalUptime,
            connectionErrors: this.connectionErrors,
        };

        const allWindows = BrowserWindow.getAllWindows();
        for (const win of allWindows) {
            win.webContents.send("sse-status-update", status);
        }
    }
}
