import mysql from 'mysql';
import config from './config';
import { logger } from './logger';
// parse any arguments
import minimist from 'minimist';
const argv = minimist(process.argv.slice(2));

const connection = mysql.createConnection({
  host: config.db.host,
  user: config.db.username,
  password: config.db.password,
  database: config.db.name,
  port: config.db.port,
});

connection.connect((err) => {
  if (err) {
    logger.error('Failed to connect');
    throw err;
  }
});

export { connection, argv };
