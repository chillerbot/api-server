/* ChillerDragon's logger */

const fs = require('fs')

let _logfile = null

const log = (type, msg) => {
  const ts = new Date().toISOString().split('T').join(' ').split(':').join(':').split('.')[0]
  const logmsg = `[${ts}][${type}] ${msg}`
  console.log(logmsg)
  if (!_logfile) {
    // 2023-08-31 09:30:15 -> 2023-08-31_09-30
    const ts_slug = ts.replace(' ', '_').replace(':', '-').split(':')[0]
    _logfile = `logs/chillerbot_api_${ts_slug}.txt`
  }
  fs.appendFile(_logfile, logmsg + '\n', (err) => {
    if (err) {
      throw err
    }
  })
}

module.exports = {
  log
}
