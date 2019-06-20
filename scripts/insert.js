#!/usr/bin/env node
const db = require('./db')

const title = db.argv.title ? db.argv.title : ''
const content = db.argv.content ? db.argv.content : ''
const image = db.argv.image ? db.argv.image : ''

db.con.connect(function(err) {
  if (err) {
    console.log('Failed to connect')
    throw err
  }
  let sql = db.sprintf("INSERT INTO post VALUES(NULL, '%s', '%s', '%s')", title, content, image)
  db.con.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    console.log('Inserted ' + result.affectedRows + ' record(s)')
    process.exit(0)
  })
})
