#!/usr/bin/env node
const db = require('./db')
const logger = require('./logger')

const id = db.argv.id || parseInt(db.argv.id)

db.con.connect(function(err) {
  if (err) {
    logger.error('Failed to connect')
    throw err
  }
  const sql = 'DELETE FROM post' + (id ? ' WHERE id = ' + id : '')
  db.con.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    logger.info('Removed ' + result.affectedRows + ' record(s)')
    process.exit(0)
  })
})
