const express = require('express')
const app = express()
const cron = require('node-cron')
const dotenv = require('dotenv')
dotenv.config()

const { insertPlaytime, getPlaytime } = require('./src/database')
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
  logger.log('cron', `check online players ${Object.keys(onlineClients).length}`)
  for (const clientId in onlineClients) {
    const client = onlineClients[clientId]
    logger.log('cron', `id=${clientId} username=${client.username} lastSeen=${client.lastSeen}`)
    const seenSecsAgo = (new Date() - client.lastSeen) / 1000
    if (seenSecsAgo > 60 * 3) {
      const playtime = Math.round((new Date() - client.firstSeen) / 1000 / 60)
      logger.log('cron', `username='${client.username}' left the game (playtime=${playtime})`)
      if (playtime > 0) {
        insertPlaytime(clientId, client.username, client.ip, playtime)
      }
      delete onlineClients[clientId]
    }
  }
})

const saveCurrentPlaytimes = () => {
  for (const clientId in onlineClients) {
    const client = onlineClients[clientId]
    const seenSecsAgo = (new Date() - client.lastSeen) / 1000
    if (seenSecsAgo > 60 * 3) {
      const playtime = Math.round((new Date() - client.firstSeen) / 1000 / 60)
      logger.log('cron', `saving username='${client.username}' (playtime=${playtime})`)
      if (playtime > 0) {
        insertPlaytime(clientId, client.username, client.ip, playtime)
      }
      onlineClients[clientId].firstSeen = new Date()
    }
  }
}

cron.schedule('0 * * * *', () => {
  // do hourly saves in case the server restarts or crashes
  saveCurrentPlaytimes()
})

const getIpAddr = (req) => {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'object') {
    return forwarded.pop()
  } else if (typeof forwarded === 'string') {
    return forwarded.split(',').pop()
  }
  return req.socket.remoteAddress
}

app.get('/', (req, res) => {
  const reqAddr = getIpAddr(req)
  logger.log('server', `GET / ${reqAddr}`)
  res.end('OK')
})

app.use(express.json())

app.set('trust proxy', true)

app.post('/', (req, res) => {
  // const reqHost = `${req.protocol}://${req.header('Host')}`
  const reqAddr = getIpAddr(req)
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

app.get('/api/v1/beat/:id/:client/:name', (req, res) => {
  const clientId = decodeURIComponent(req.params.id)
  const name = decodeURIComponent(req.params.name)
  const client = decodeURIComponent(req.params.client)
  const reqAddr = getIpAddr(req)
  logger.log('server', `GET /api/v1/beat/${clientId}/${client}/${name} ${reqAddr}`)
  if (!onlineClients[clientId]) {
    logger.log('server', `username='${name}' joined the game (client=${client})`)
    onlineClients[clientId] = {
      username: name,
      lastSeen: new Date(),
      firstSeen: new Date(),
      ip: reqAddr,
      client: client
    }
  } else {
    onlineClients[clientId].username = name
    onlineClients[clientId].lastSeen = new Date()
  }
  res.end(JSON.stringify(
    getPlaytime(clientId) || 0
  ))
})

app.get('/api/v1/users', (req, res) => {
  res.end(JSON.stringify(
    Object.keys(onlineClients).map(id => onlineClients[id].username)
  ))
})

app.get('/api/v1/playtime/:id', (req, res) => {
  const clientId = decodeURIComponent(req.params.id)
  res.end(JSON.stringify(
    getPlaytime(clientId)
  ))
})

app.use(express.static('static'))

process.on("SIGINT", () => {
  console.log('[*] Got shutdown. Saving current playtimes ...')
  saveCurrentPlaytimes()
  process.exit()
})

app.listen(port, () => {
  logger.log('server', `App running on http://localhost:${port}.`)
})
