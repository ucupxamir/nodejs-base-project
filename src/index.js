require('dotenv').config()
const app = require('./applications/web')
const {logger} = require('./applications/logger')

const port = process.env.PORT
const env = process.env.NODE_ENV

app.listen(port, () => {
  logger.info('Server running at port ' + port + ' using ' + env + ' env')
})