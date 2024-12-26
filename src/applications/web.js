require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const errorMiddleware = require('../middlewares/error.middleware')
const api = require('../controllers')
const ResponseError = require('../utils/response-error')

const web = express()

const allowedOrigins = process.env.ALLOWED_ORIGIN

web.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new ResponseError(403, 'not allowed by CORS'))
        }
    }
}))

web.use(express.json())

web.use('/api', api)

let raw = fs.readFileSync('package.json').toString('utf-8')
let data = JSON.parse(raw)
let appInfo = (({ name, version, description, author }) => ({ name, version, description, author }))(data)

web.get('/', (req, res) => { res.send(appInfo) })

web.use(errorMiddleware)

module.exports = web