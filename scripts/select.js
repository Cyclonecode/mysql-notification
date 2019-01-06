#!/usr/bin/env node
const mysql = require('mysql')

// parse any arguments
const argv = require('minimist')(process.argv.slice(2))

const MYSQL_USERNAME = argv.user ? argv.user : 'root'
const MYSQL_PASSWORD = argv.pass ? argv.pass : ''
const MYSQL_DATABASE = argv.database ? argv.database : 'mysql_note'
const MYSQL_HOSTNAME = argv.host ? argv.host : 'localhost'

const id = argv.id || parseInt(argv.id)

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
  let sql = 'SELECT * FROM post'
  if (id) {
    sql += ' WHERE id = ' + id
  }
  con.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    for (let i = 0; i < result.length; i++) {
      console.log(result[i])
    }
    process.exit(0)
  })
})
