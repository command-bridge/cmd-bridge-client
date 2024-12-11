import { SSEHandler } from "../core/sse-handler";
import { SSECheckUpdatesService } from "./check-updates.service";
import { SSEPackagesService } from "./packages.service";
import { SSERequestLogs } from "./request-logs.service";
import { SSERestartService } from "./restart.service";

SSEHandler.register(SSECheckUpdatesService);
SSEHandler.register(SSERestartService);
SSEHandler.register(SSEPackagesService);
SSEHandler.register(SSERequestLogs);