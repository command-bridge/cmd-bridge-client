type SerializableTypeValue = undefined | boolean | number | string | Date;

interface SerializableType {
    [key: string]: SerializableTypeValue | SerializableType;
}

interface SerializableResponse extends SerializableType {
    error?: boolean;
    errorMessage?: string;
    response?: SerializableTypeValue | SerializableType;
}

export class IPCHandlerResponse {

    private serializableData: SerializableResponse = {}

    constructor(response: SerializableResponse) {

        this.serializableData = response;
    }

    public getSerializable() {

        return this.serializableData;
    }

    public isError() {
        
        return this.serializableData.error;
    }

    public getError() {

        return this.serializableData.errorMessage;
    }

    public getResponse<T>() {

        return this.serializableData.response as unknown as Promise<T>;
    }

    public static From(response: SerializableResponse) {

        return new IPCHandlerResponse(response);
    }

    public static Error(errorMessage: string) {

        return new IPCHandlerResponse({
            errorMessage,
            error: true
        })
    }

    public static Success(response: SerializableTypeValue | SerializableType) {

        return new IPCHandlerResponse({
            response
        })
    }
}