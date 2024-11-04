export class ActivationModel {
    public validation_key?: string;

    public isValid() {
        return this.validation_key && this.validation_key.length === 6
    }
}