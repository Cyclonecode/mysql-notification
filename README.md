# mysql-notification

# Installation

- Install modules from package.json

   $ npm install

- Setup your user defined function (UDF)

    $ cp <libmysql-notification-lib.dylib> /usr/local/mysql/lib/plugin/.

- Tell mysql about the UDF

    $ CREATE FUNCTION MySQLNotification RETURNS INTEGER SONAME 'libmysql-notification-lib.dylib';

- Create triggers for INSERT/UPDATE/DELETE

    $ DELIMITER @@
    $ CREATE TRIGGER <triggerName> AFTER INSERT ON <table> FOR EACH ROW BEGIN SELECT MySQLNotification(NEW.id, 2) INTO @x; END@@
    $ CREATE TRIGGER <triggerName> AFTER UPDATE ON <table> FOR EACH ROW BEGIN SELECT MySQLNotification(NEW.id, 3) INTO @x; END@@
    $ CREATE TRIGGER <triggerName> AFTER DELETE ON <table> FOR EACH ROW BEGIN SELECT MySQLNotification(OLD.id, 4) INTO @x; END@@
    $ DELIMITER ;

# Running

    $ node server.json

- Go to address http://127.0.0.1:999 in your browser and start receiving notifications from your database.

