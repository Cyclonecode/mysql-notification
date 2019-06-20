#!/usr/bin/env node
const db = require('./db')

const id = db.argv.id || parseInt(db.argv.id)

db.con.connect(function(err) {
  if (err) {
    console.error('Failed to connect')
    throw err
  }
  let sql = 'SELECT * FROM post'
  if (id) {
    sql += ' WHERE id = ' + id
  }
  db.con.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    for (let i = 0; i < result.length; i++) {
      console.info(result[i])
    }
    process.exit(0)
  })
})
