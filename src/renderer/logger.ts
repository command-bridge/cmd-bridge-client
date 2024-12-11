import { ipcRenderer } from "electron";

const originalLog = console.log.bind(console);
console.log = (...args: any[]) => {
    ipcRenderer.send('log-message', { level: 'info', message: args.join(' ') });
    originalLog(...args);
};

const originalError = console.error.bind(console);
console.error = (...args: any[]) => {
    ipcRenderer.send('log-message', { level: 'error', message: args.join(' ') });
    originalError(...args);
};
