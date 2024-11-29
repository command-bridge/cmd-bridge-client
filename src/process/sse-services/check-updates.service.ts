import { SSEAction } from "../core/decorators/sse-actions.decorator";
import { triggerUpdate } from "../core/trigger-update";

export class SSECheckUpdatesService {

    @SSEAction('check-updates')
    public static checkUpdates() {

        return triggerUpdate();
    }
}