#!/usr/bin/env node
const connection = require('./db').connection;
const logger = require('./logger');
const argv = require('./db').argv;

const sql = `SELECT * FROM post ${argv.id ? ' WHERE id = ?' : ''}`
const data = argv?.id

connection.query(sql, data, (err, result) => {
  if (err) {
    throw err;
  }
  result.forEach(it => {
    logger.info('', it);
  });
});
connection.end();
