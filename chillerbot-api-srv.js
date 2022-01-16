const express = require('express')
const app = express()
const cron = require('node-cron')
const dotenv = require('dotenv')
dotenv.config()

// const { insertPlaytime, getDb } = require('./src/database')
const logger = require('./src/logger')

const port = 9812

// Add headers
// https://stackoverflow.com/a/18311469
app.use(function (req, res, next) {
  // TODO: make this more dynamic and decide on a front end port (9090 for now)
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9090')

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

  // Set to true if you need the website to include cookies in the requests sent
  // res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next()
})

app.use(
  express.urlencoded({
    extended: true
  })
)

app.set('view engine', 'ejs')

const onlineClients = {}

cron.schedule('* * * * *', () => {
  logger.log('cron', `check online players ${onlineClients.length}`)
  for (const clientId in onlineClients) {
    logger.log('cron', `id=${clientId} username=${onlineClients[clientId].username} lastSeen=${onlineClients[clientId].lastSeen}`)
    const seenSecsAgo = (new Date() - onlineClients[clientId].lastSeen) / 1000
    if (seenSecsAgo > 60 * 3) {
      logger.log('cron', `username='${onlineClients[clientId].username}' left the game`)
      delete onlineClients[clientId]
    }
  }
})

app.get('/', (req, res) => {
  const reqAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  logger.log('server', `GET / ${reqAddr}`)
  res.end('OK')
})

app.use(express.json())

app.set('trust proxy', true)

app.post('/', (req, res) => {
  // const reqHost = `${req.protocol}://${req.header('Host')}`
  const reqAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  // const isOwnAddr = reqAddr === process.env.IP_ADDR
  // if (reqHost !== process.env.CAPTCHA_BACKEND && !isOwnAddr) {
  //   logger.log('captcha', `blocked post from invalid host='${reqHost}' addr='${reqAddr}' expected='${process.env.CAPTCHA_BACKEND}'`)
  //   res.end('ERROR')
  //   return
  // }
  // const score = req.body.score
  // if (score === 1) {
  //   // do not save robot scores to save memory
  //   captchaData[req.body.token] = score
  //   logger.log('captcha', `result=hooman ip=${req.ip}`)
  // } else {
  //   logger.log('captcha', `result=robot ip=${req.ip}`)
  // }
  logger.log('server', `POST / ${reqAddr}`)
  res.end('OK')
})

app.get('/api/v1/beat/:id/:name', (req, res) => {
  const clientId = decodeURIComponent(req.params.id)
  const name = decodeURIComponent(req.params.name)
  const reqAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  logger.log('server', `GET /api/v1/beat/${clientId}/${name} ${reqAddr}`)
  if (!onlineClients[clientId]) {
    logger.log('cron', `username='${name}' joined the game`)
  }
  onlineClients[clientId] = { username: name, lastSeen: new Date() }
  res.end('{}')
})

app.use(express.static('static'))

app.listen(port, () => {
  logger.log('server', `App running on http://localhost:${port}.`)
})
