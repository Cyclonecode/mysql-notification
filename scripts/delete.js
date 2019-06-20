#!/usr/bin/env node
const db = require('./db')

const id = db.argv.id || parseInt(db.argv.id)

db.con.connect(function(err) {
  if (err) {
    console.log('Failed to connect')
    throw err
  }
  let sql = 'DELETE FROM post' + (id ? ' WHERE id = ' + id : '')
  db.con.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    console.log('Removed ' + result.affectedRows + ' record(s)')
    process.exit(0)
  })
})
