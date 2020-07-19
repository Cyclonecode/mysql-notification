require('dotenv').config();
const mysql = require('mysql');
const logger = require('./logger');
// parse any arguments
const argv = require('minimist')(process.argv.slice(2));

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOSTNAME || 'localhost',
  user: process.env.MYSQL_USERNAME || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'mysql_note',
  port: process.env.MYSQL_PORT || 3306,
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
