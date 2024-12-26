const fs = require('fs')
const path = require('path')
const winston = require('winston')
const morgan = require('morgan')
const uuid = require('uuid')
const DailyRotateFile = require('winston-daily-rotate-file')

const logsDir = path.join(__dirname, '..', '..', 'logs')

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
}

const { combine, timestamp, json } = winston.format

exports.logger = winston.createLogger({
    level: 'http',
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        json()
    ),
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
            filename: path.join(logsDir, '/system-logs/%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            format: combine(
                timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                json()
            ),
            maxSize: '20m',
            maxFiles: '3d'
        }),
        new DailyRotateFile({
            filename: path.join(logsDir, '/error-logs/%DATE%.log'),
            level: 'error',
            handleExceptions: true,
            handleRejections: true,
            datePattern: 'YYYY-MM-DD',
            format: combine(
                timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                json()
            ),
            maxSize: '20m',
            maxFiles: '7d'
        })
    ]
})

function assign_id (req, res, next) {
    req.id = uuid.v4()
    next()
}

morgan.token('id', (req) => req.id)
morgan.token('remote-addr', (req) => req.ip)
morgan.token('remote-user', (req) => req.user || '-')

exports.httpLogger = [
    assign_id,
    morgan(
        (tokens, req, res) => {
            const responseTime = tokens['response-time'](req, res)
            
            const logEntry = {
                id: tokens.id(req, res),
                'remote-addr': tokens['remote-addr'](req, res),
                'remote-user': tokens['remote-user'](req, res),
                method: tokens.method(req, res),
                url: tokens.url(req, res),
                http_version: tokens['http-version'](req, res),
                status: tokens.status(req, res),
                'content-length': tokens.res(req, res, 'content-length') || 0,
                referrer: tokens.referrer(req, res) || '-',
                'user-agent': tokens['user-agent'](req, res),
                response_time: `${responseTime} ms`
            }

            return JSON.stringify(logEntry)
        },
        {
            stream: {
                write: (message) => exports.logger.http(JSON.parse(message))
            }
        }
    )
]