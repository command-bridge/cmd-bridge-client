import { getSSEActions } from "./decorators/sse-actions.decorator";

export interface SubjectMessage {
    action: string;
    payload?: Record<string, any> | string;
}

export class SSEHandler {
    private static registeredClasses: any[] = [];

    public static register(classInstance: any) {
        this.registeredClasses.push(classInstance);
    }

    public static handleMessage(message: SubjectMessage) {
        for (const classInstance of this.registeredClasses) {
            const actions = getSSEActions(classInstance);
            const methodName = actions[message.action];

            if (methodName && typeof classInstance[methodName] === 'function') {
                console.log(classInstance.name, methodName);
                classInstance[methodName](message.payload);

                return;
            }
        }

        console.log('No SSE handler found for message:', message)
    }
}