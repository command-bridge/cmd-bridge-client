import { SSEHandler } from "../core/sse-handler";
import { SSECheckUpdatesService } from "./check-updates.service";
import { SSERestartService } from "./restart.service";

SSEHandler.register(SSECheckUpdatesService);
SSEHandler.register(SSERestartService);