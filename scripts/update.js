#!/usr/bin/env node
const db = require('./db')

const id = db.argv.id || parseInt(db.argv.id)
const title = db.argv.title || db.argv.title
const content = db.argv.content || db.argv.content
const image = db.argv.image || db.argv.image

if (!id) {
  throw new Error('You need to specify an id')
}
if (!title && !content && !image) {
  throw new Error('You need to specify some value to change.')
}

db.con.connect(function(err) {
  if (err) {
    console.log('Failed to connect')
    throw err
  }
  let sql = 'UPDATE post SET '
  if (title) {
    sql += db.sprintf("title = '%s',", title)
  }
  if (content) {
    sql += db.sprintf("content = '%s',", content)
  }
  if (image) {
    sql += db.sprintf("image = '%s',", image)
  }
  sql = sql.slice(0, -1)
  sql += db.sprintf(" WHERE id = %d", id)
  db.con.query(sql, (err, result) => {
    if (err) {
      throw err
    }
    console.log('Updated ' + result.affectedRows + ' record(s)')
    process.exit(0)
  })
})
