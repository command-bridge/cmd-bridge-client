import { ipcMain } from 'electron';
import { inspect } from 'util';
import winston from 'winston';
import 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...params }) => {
        const splat = params[Symbol.for('splat')] as [];
        const metaString = splat && splat.length ? ` ${inspect(splat, { depth: null })}` : '';
        return `[${timestamp}] [${level.toUpperCase()}]: ${message} ${metaString}`;
    })
);

const dailyRotateFileTransportRenderer = new winston.transports.DailyRotateFile({
    filename: 'logs/renderer-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

const rendererLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        dailyRotateFileTransportRenderer,
        new winston.transports.Console(),
    ],
});

ipcMain.on('log-message', (event, { level, message }) => {
    rendererLogger.log(level, message);
});
