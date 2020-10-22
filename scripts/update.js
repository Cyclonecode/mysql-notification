#!/usr/bin/env node
const connection = require('./db').connection;
const argv = require('./db').argv;
const logger = require('./logger');

if (!argv.id) {
  logger.error(`You need to specify an id`);
  process.exit(-1)
}
if (!(argv.title && argv.content && argv.image)) {
  logger.error(`You need to specify some value to change.`);
  process.exit(-1)
}

let sql = 'UPDATE post SET ';
const data = [];
if (argv.title) {
  sql += 'title = ?,';
  data.push(argv.title);
}
if (argv.content) {
  sql += 'content = ?,';
  data.push(argv.content);
}
if (argv.image) {
  sql += 'image = ?,';
  data.push(argv.image);
}
sql = sql.slice(0, -1);
sql += ' WHERE id = ?';
data.push(argv.id);
connection.query(sql, data, (err, result) => {
  if (err) {
    throw err;
  }
  logger.info(`Updated ${result.affectedRows} record(s)`);
});
connection.end();
