import { connection, argv } from './db';
import { logger } from './logger';

const title = argv.title || '';
const content = argv.content || '';
const image = argv.image || '';

const sql = 'INSERT INTO post VALUES(NULL, ?, ?, ?)';
const data = [title, content, image];
connection.query(sql, data, (err, result) => {
  if (err) {
    throw err;
  }
  logger.info(`Inserted ${result.affectedRows} record(s)`);
});
connection.end();
