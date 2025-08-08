import winston from 'winston';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import DailyRotateFile from 'winston-daily-rotate-file';

// Configuration des chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '../logs');

// Créer le dossier logs s'il n'existe pas
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Format personnalisé avec timestamp
const logFormat = winston.format.printf(
  ({ level, message, timestamp, stack }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  }
);

// Configuration du logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    winston.format.colorize({ all: true }),
    logFormat
  ),
  transports: [
    // Transport console
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true
    }),
    
    // Transport fichier avec rotation quotidienne
    new DailyRotateFile({
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'debug'
    }),
    
    // Fichier d'erreurs séparé
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 3
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log')
    })
  ]
});

// Proxy pour les messages de démarrage
const originalInfo = logger.info.bind(logger);
logger.info = (message) => {
  if (typeof message === 'string' && message.includes('PATERSON-MD')) {
    // Formattage spécial pour le message de démarrage
    return originalInfo('\n' + message + '\n');
  }
  return originalInfo(message);
};

// Logger pour les requêtes HTTP
export const httpLogger = winston.createLogger({
  level: 'http',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'http.log'),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 7
    })
  ]
});

export default logger;
