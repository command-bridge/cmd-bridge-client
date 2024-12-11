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

const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/process-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        dailyRotateFileTransport,
        new winston.transports.Console(),
    ],
});

const originalStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = (chunk: string | Uint8Array, encodingOrCallback?: BufferEncoding | ((err?: Error | undefined) => void), callback?: (err?: Error | undefined) => void): boolean => {
    
    if (typeof encodingOrCallback === 'function') {
        if(chunk && chunk.length) logger.error(`[stderr] ${chunk.toString()}`);
        return originalStderrWrite(chunk, encodingOrCallback);
    } else {
        if(chunk && chunk.length) logger.error(`[stderr] ${chunk.toString()}`);
        return originalStderrWrite(chunk, encodingOrCallback, callback);
    }
};

export default logger;
