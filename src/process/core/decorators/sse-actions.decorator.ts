const SSE_ACTIONS_METADATA = Symbol('SSEActionsMetadata');

export function SSEAction(action: string) {
    return function (target: Object, propertyKey: string | symbol) {
        const existingActions = Reflect.getMetadata(SSE_ACTIONS_METADATA, target) || {};
        existingActions[action] = propertyKey;
        Reflect.defineMetadata(SSE_ACTIONS_METADATA, existingActions, target);
    };
}

export function getSSEActions(target: Object): Record<string, string | symbol> {
    return Reflect.getMetadata(SSE_ACTIONS_METADATA, target) || {};
}