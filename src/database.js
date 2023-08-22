const db = require('better-sqlite3')('./db/main.db')

const dbQuery = `
CREATE TABLE IF NOT EXISTS Playtime(
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT,
  username TEXT,
  ip TEXT,
  minutes INTEGER
)`

db.exec(dbQuery)

const insertPlaytime = (key, username, ip, minutes) => {
  const insertQuery = `INSERT INTO Playtime(
    key, username, ip, minutes
  ) VALUES (?, ?, ?, ?);
  `
  const stmt = db.prepare(insertQuery)
  stmt.run(
    key,
    username,
    ip,
    minutes
  )
}

const getPlaytime = (key) => {
  const row = db.prepare('SELECT sum(minutes) AS playtime FROM Playtime WHERE key = ?').get(key)
  return row.playtime
}

const getDb = () => db

module.exports = {
  insertPlaytime,
  getPlaytime,
  getDb
}
