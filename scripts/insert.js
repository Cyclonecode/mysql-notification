#!/usr/bin/env node
const connection = require('./db').connection
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
  const sql = "INSERT INTO post VALUES(NULL, ?, ?, ?)"
  const data = [
    title,
    content,
    image
  ]
  connection.query(sql, data, (err, result) => {
    if (err) {
      throw err
    }
    logger.info('Inserted ' + result.affectedRows + ' record(s)')
    process.exit(0)
  })
})
