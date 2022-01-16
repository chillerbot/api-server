const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./db/main.db')

const dbQuery = `
CREATE TABLE IF NOT EXISTS Playtime(
  username TEXT NOT NULL PRIMARY KEY,
  ip TEXT,
  minutes INTEGER
)`

db.run(dbQuery)

const insertPlaytime = (username, ip, minutes) => {
  const insertQuery = `INSERT INTO Playtime(
    username, ip, minutes
  ) VALUES (?, ?, ?);
  `
  db.run(insertQuery,
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
