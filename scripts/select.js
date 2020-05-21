#!/usr/bin/env node
const connection = require('./db').connection
const argv = require('./db').argv
const logger = require('./logger')

connection.connect(function(err) {
  if (err) {
    logger.error('Failed to connect')
    throw err
  }
  let sql = 'SELECT * FROM post'
  if (argv.id) {
    sql += ' WHERE id = ' + argv.id
  }
  connection.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    for (let i = 0; i < result.length; i++) {
      logger.info('', result[i])
    }
    process.exit(0)
  })
})
