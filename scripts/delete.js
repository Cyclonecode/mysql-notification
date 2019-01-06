#!/usr/bin/env node
const mysql = require('mysql')

// parse any arguments
const argv = require('minimist')(process.argv.slice(2))

const MYSQL_USERNAME = argv.u ? argv.u : 'root'
const MYSQL_PASSWORD = argv.p ? argv.p : ''
const MYSQL_DATABASE = argv.n ? argv.n : 'mysql_note'
const MYSQL_HOSTNAME = argv.h ? argv.h : 'localhost'
const RECORD_ID = argv.i ? parseInt(argv.i) : false

const con = mysql.createConnection({
  host: MYSQL_HOSTNAME,
  user: MYSQL_USERNAME,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE
})

con.connect(function(err) {
  if (err) {
    console.log('Failed to connect')
    throw err
  }
  let sql = 'DELETE FROM post' + (RECORD_ID ? ' WHERE id = ' + RECORD_ID : '')
  console.log(sql)
  con.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    console.log('Removed ' + result.affectedRows + ' record(s)')
    process.exit(0)
  })
})
