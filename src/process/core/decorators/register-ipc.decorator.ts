import { ipcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import { IPCHandlerResponse } from '../ipc-handler-response';
import logger from '../logger';

function RegisterIPC(channel: string) {
  return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
    // Ensure this decorator is only used on methods
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error(`@RegisterIPC decorator can only be applied to methods.`);
    }

    const originalMethod = descriptor.value;

    logger.info('Registering channel', [ channel, target.name ]);

    ipcMain.handle(channel, async (event: IpcMainInvokeEvent, ...args: any[]) => {
      return (await originalMethod.apply(target, args) as IPCHandlerResponse).getSerializable();
    });
  };
}

export { RegisterIPC };