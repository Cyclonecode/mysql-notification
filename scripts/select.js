#!/usr/bin/env node
const connection = require('./db').connection;
const argv = require('./db').argv;
const logger = require('./logger');

connection.connect((err) => {
  if (err) {
    logger.error('Failed to connect');
    throw err;
  }
  let sql = 'SELECT * FROM post';
  const data = [];
  if (argv.id) {
    sql += ' WHERE id = ?';
    data.push(argv.id);
  }
  connection.query(sql, data, (err, result) => {
    if (err) {
      throw err;
    }
    for (let i = 0; i < result.length; i++) {
      logger.info('', result[i]);
    }
    process.exit(0);
  });
});
