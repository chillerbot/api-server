const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./db/main.db')

const dbQuery = `
CREATE TABLE IF NOT EXISTS Playtime(
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT,
  username TEXT,
  ip TEXT,
  minutes INTEGER
)`

db.run(dbQuery)

const insertPlaytime = (key, username, ip, minutes) => {
  const insertQuery = `INSERT INTO Playtime(
    key, username, ip, minutes
  ) VALUES (?, ?, ?, ?);
  `
  db.run(insertQuery,
    key,
    username,
    ip,
    minutes,
    (err) => {
      if (err) {
        throw err
      }
    })
}

const getDb = () => db

module.exports = {
  insertPlaytime,
  getDb
}
