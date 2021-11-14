import dotenv from 'dotenv';
import mysql from 'mysql';
import { logger } from './logger';
// parse any arguments
import minimist from 'minimist';
const argv = minimist(process.argv.slice(2));
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOSTNAME || 'localhost',
  user: process.env.MYSQL_USERNAME || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'mysql_note',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
});

connection.connect((err) => {
  if (err) {
    logger.error('Failed to connect');
    throw err;
  }
});

export { connection, argv };
