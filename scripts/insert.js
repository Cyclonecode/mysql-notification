#!/usr/bin/env node
const connection = require('./db').connection
const sprintf = require('sprintf-js').sprintf
const argv = require('./db').argv
const logger = require('./logger')

const title = argv.title || ''
const content = argv.content || ''
const image = argv.image || ''

connection.connect((err) => {
  if (err) {
    logger.error('Failed to connect')
    throw err
  }
  const sql = sprintf("INSERT INTO post VALUES(NULL, '%s', '%s', '%s')", title, content, image)
  connection.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    logger.info('Inserted ' + result.affectedRows + ' record(s)')
    process.exit(0)
  })
})
