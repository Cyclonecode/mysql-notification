require('dotenv').config()
const mysql = require('mysql')
// parse any arguments
const argv = require('minimist')(process.argv.slice(2))

const MYSQL_USERNAME = process.env.MYSQL_USERNAME || 'root'
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || ''
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'mysql_note'
const MYSQL_HOSTNAME = process.env.MYSQL_HOSTNAME || 'localhost'
const MYSQL_PORT = process.env.MYSQL_PORT || 3306

const connection = mysql.createConnection({
  host: MYSQL_HOSTNAME,
  user: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  port: MYSQL_PORT,
})

module.exports = {
  argv,
  connection,
}
