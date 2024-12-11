import { app, BrowserWindow } from "electron";
import { APIClientService } from "./api-client.service";
import { UUID } from "crypto";
import { getBackendAPIAddress } from "./store";
import EventSource from "eventsource";
import { AxiosError } from "axios";
import { SSEHandler } from "./sse-handler";
import "../sse-services"
import logger from "./logger";

interface SSEToken {
    token: UUID;
}

export class SSEService {
    private static client = APIClientService.getClient();
    private static eventSource: EventSource | null = null;
    private static sessionStartTime: Date | null = null;
    private static lastAttemptConnectionTimestamp: number = 0;
    private static totalUptimeStart = Date.now();
    private static connectionErrors = 0;

    public static async initiate() {
        await this.connect();
        setInterval(() => this.sendStatusToRenderer(), 1000);
        this.connectionHealthCheck();
    }

    private static async connect() {
        logger.info('Connecting to SSE');

        try {

            this.lastAttemptConnectionTimestamp = Date.now();

            await this.client.post<SSEToken>("/device-events", {
                version: process.env.npm_package_version,
            });

            const token = APIClientService.getToken();
            const url = `${getBackendAPIAddress()}/device-events/stream/?token=${token}`;

            this.eventSource = new EventSource(url);

            this.eventSource.onopen = () => {
                logger.info('Connected to SSE');
                this.sessionStartTime = new Date();
            };

            this.eventSource.onmessage = (event) => {
                const message = JSON.parse(event.data);
                SSEHandler.handleMessage(message);
            };        

            this.eventSource.onerror = async (error) => {
                logger.error('SSE error', error);
                await this.reconnect();
            };
        } catch (error) {

            if(error instanceof AxiosError) {

                logger.error('SSE Axios Error', error.message);
            } else {

                logger.error("SSE Error:", error);
            }

            await this.reconnect();        
        }
    }

    private static async connectionHealthCheck() {

        setInterval(() => {

            const lastConnectionAttemptWasOlderThan30Seconds = Date.now() - (1000 * 30) > this.lastAttemptConnectionTimestamp;

            if ((!this.eventSource || !this.isConnected()) && lastConnectionAttemptWasOlderThan30Seconds) {
                logger.warn("Connection appears to be closed. Reconnecting...");
                this.reconnect();
            }
        }, 5000);        
    }

    private static async reconnect() {

        this.connectionErrors++;
        
        if (this.eventSource) {
            this.eventSource.close();

            await new Promise((resolve) => setTimeout(resolve, 100)); 

            this.eventSource = null;
        }

        logger.info('Reconnecting to SSE in 5s...')
        await new Promise((resolve) => setTimeout(resolve, 5000));
        
        await this.connect();
    }

    private static isConnected() {

        const state = this.eventSource?.readyState || EventSource.CLOSED;

        return state === EventSource.OPEN;
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
