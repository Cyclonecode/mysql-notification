import { connection, argv } from './db';
import { logger } from './logger';

const sql = `SELECT * FROM post ${argv.id ? ' WHERE id = ?' : ''}`;
const data = argv?.id;

connection.query(sql, data, (err, result) => {
  if (err) {
    throw err;
  }
  result.forEach((it: any) => {
    logger.info('', it);
  });
});
connection.end();
