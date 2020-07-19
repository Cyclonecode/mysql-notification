require('dotenv').config();
const mysql = require('mysql');
const logger = require('./logger');
// parse any arguments
const argv = require('minimist')(process.argv.slice(2));

const MYSQL_USERNAME = process.env.MYSQL_USERNAME || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'mysql_note';
const MYSQL_HOSTNAME = process.env.MYSQL_HOSTNAME || 'localhost';
const MYSQL_PORT = process.env.MYSQL_PORT || 3306;

const connection = mysql.createConnection({
  host: MYSQL_HOSTNAME,
  user: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  port: MYSQL_PORT,
});

connection.connect((err) => {
  if (err) {
    logger.error('Failed to connect');
    throw err;
  }
});

module.exports = {
  argv,
  connection,
};
