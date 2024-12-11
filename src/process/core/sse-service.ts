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
    private static connectionStatus: "connected" | "disconnected" = "disconnected";
    private static sessionStartTime: Date | null = null;
    private static totalUptimeStart = Date.now();
    private static connectionErrors = 0;

    public static async initiate() {
        await this.connect();
        setInterval(() => this.sendStatusToRenderer(), 1000);
    }

    private static async connect() {
        logger.info('Connecting to SSE');

        try {

            await this.client.post<SSEToken>("/device-events", {
                version: process.env.npm_package_version,
            });

            const token = APIClientService.getToken();
            const url = `${getBackendAPIAddress()}/device-events/stream/?token=${token}`;

            this.eventSource = new EventSource(url);

            this.eventSource.onopen = () => {
                logger.info('Connected to SSE');
                this.updateConnectionStatus("connected");
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

    private static async reconnect() {

        this.updateConnectionStatus("disconnected");
        this.connectionErrors++;
        
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        logger.info('Reconnecting to SSE in 5s...')
        await new Promise((resolve) => setTimeout(resolve, 5000));
        
        await this.connect();
    }

    private static updateConnectionStatus(status: "connected" | "disconnected") {
        this.connectionStatus = status;
    }

    private static sendStatusToRenderer() {
        const sessionDuration = this.sessionStartTime
            ? Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000)
            : 0;
        const totalUptime = Math.floor((Date.now() - this.totalUptimeStart) / 1000);

        const status = {
            isConnected: this.connectionStatus === "connected",
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
