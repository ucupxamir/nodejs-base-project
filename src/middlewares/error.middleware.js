const ResponseError = require('../utils/response-error')

const errorMiddleware = async (err, req, res, next) => {
    if (!err) {
        next()
    }

    if (err instanceof ResponseError) {
        res.status(err.status).send({
            errors: err.message.replace(/\"/g, '').split('. ')
        })
    } else {
        console.error(err)
        res.status(500).send({
            errors: ['internal server error']
        })
    }
}

module.exports = errorMiddleware