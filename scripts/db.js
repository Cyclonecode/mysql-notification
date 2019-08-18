const mysql = require('mysql')
// parse any arguments
const argv = require('minimist')(process.argv.slice(2))
const sprintf = require('sprintf-js').sprintf

const MYSQL_USERNAME = argv.user || 'root'
const MYSQL_PASSWORD = argv.pass || ''
const MYSQL_DATABASE = argv.database || 'mysql_note'
const MYSQL_HOSTNAME = argv.host || 'localhost'
const MYSQL_PORT = argv.port ? parseInt(argv.port) : 3306

const con = mysql.createConnection({
  host: MYSQL_HOSTNAME,
  user: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  port: MYSQL_PORT,
})

module.exports = {
  argv: argv,
  sprintf: sprintf,
  con: con
}
