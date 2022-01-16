const express = require('express')
const app = express()
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

app.get('/', (req, res) => {
  res.end('OK')
})

app.use(express.json())

app.set('trust proxy', true)

app.post('/', (req, res) => {
  // const reqHost = `${req.protocol}://${req.header('Host')}`
  // const reqAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress
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
  res.end('OK')
})

app.get('/api/players/:player', (req, res) => {
  res.end('OK')
  // const player = decodeURIComponent(req.params.player)
  // const players = []
  // if (!process.env.PLAYER_NAMES_PATH) {
  //   res.end('[]')
  //   return []
  // }
  // if (!fs.existsSync(process.env.PLAYER_NAMES_PATH)) {
  //   res.end('[]')
  //   return []
  // }
  // fs.readFileSync(process.env.PLAYER_NAMES_PATH, 'UTF-8')
  //   .split(/\r?\n/)
  //   .filter(data => data.toLowerCase().includes(player.toLowerCase()))
  //   .forEach(line => {
  //     const data = line.trim().split(' ')
  //     players.push([parseInt(data[0], 10), data.slice(1).join(' ').trim()])
  //   })
  // players.sort((p1, p2) => p2[0] - p1[0])
  // res.send(JSON.stringify(players.map(player => player[1]).slice(0, 10)))
})

app.use(express.static('static'))

app.listen(port, () => {
  logger.log('server', `App running on http://localhost:${port}.`)
})
