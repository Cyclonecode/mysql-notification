#!/usr/bin/env node
const connection = require('./db').connection
const argv = require('./db').argv
const sprintf = require('sprintf-js').sprintf
const logger = require('./logger')

if (!argv.id) {
  throw new Error('You need to specify an id')
}
if (!argv.title && !argv.content && !argv.image) {
  throw new Error('You need to specify some value to change.')
}

connection.connect(function(err) {
  if (err) {
    logger.error('Failed to connect')
    throw err
  }
  let sql = 'UPDATE post SET '
  if (argv.title) {
    sql += sprintf("title = '%s',", argv.title)
  }
  if (argv.content) {
    sql += sprintf("content = '%s',", argv.content)
  }
  if (argv.image) {
    sql += sprintf("image = '%s',", argv.image)
  }
  sql = sql.slice(0, -1)
  sql += sprintf(" WHERE id = %d", id)
  connection.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    logger.info('Updated ' + result.affectedRows + ' record(s)')
    process.exit(0)
  })
})
