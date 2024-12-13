import { SSEAction } from "../core/decorators/sse-actions.decorator";
import { SSEService } from "../core/sse-service";
import { triggerUpdate } from "../core/trigger-update";

export class SSEHeartbeatService {

    @SSEAction('heartbeat')
    public static heartbeat() {

        SSEService.setLastHeartbeat();
    }
}