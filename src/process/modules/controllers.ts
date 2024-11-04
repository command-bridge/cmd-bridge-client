import { ActivationController } from "./activation/activation.controller";

export interface IController {}

type Constructor<T = any> = new (...args: any[]) => T;

export function loadControllers() { 

    const controllers = new Map<Constructor, IController>([
        [ ActivationController, new ActivationController() ]
    ]); 

    return controllers;
};