#!/usr/bin/env node
const logger = require('./logger');
const connection = require('./db').connection;
const argv = require('./db').argv;

const sql = 'DELETE FROM post' + (argv.id ? ' WHERE id = ?' : '');
const data = argv.id ? [argv.id] : [];

connection.query(sql, data, (err, result) => {
  if (err) {
    throw err;
  }
  logger.info(`Removed ${result.affectedRows} record(s)`);
});
connection.end();
