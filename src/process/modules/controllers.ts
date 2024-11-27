import { ActivationController } from "./activation/activation.controller";
import { AppController } from "./app/app.controller";
import { SettingsController } from "./settings/settings.controller";

export interface IController {}

type Constructor<T = any> = new (...args: any[]) => T;

export function loadControllers() { 

    const controllers = new Map<Constructor, IController>([
        [ SettingsController, new SettingsController() ],
        [ ActivationController, new ActivationController() ],
        [ AppController, new AppController() ]
    ]); 

    return controllers;
};