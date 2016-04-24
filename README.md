# mysql-notification

# Compiling

- You first need to build your shared library using:

> cc -c mysql-notification.c -o mysql-notification.so -I/usr/local/Cellar/mysql/5.7.12/include/mysql

# Installation

- Install modules from package.json

> $ npm install

- Setup your user defined function (UDF) by adding the shared library into mysqls plugin folder

> cp <mysql-notification.so> /usr/local/mysql/lib/plugin/.

- Tell mysql about the UDF

> $ CREATE FUNCTION MySQLNotification RETURNS INTEGER SONAME 'mysql-notification.so';

- Create triggers for INSERT/UPDATE/DELETE

```
$ DELIMITER @@
$ CREATE TRIGGER <triggerName> AFTER INSERT ON <table> 
  FOR EACH ROW 
  BEGIN 
    SELECT MySQLNotification(NEW.id, 2) INTO @x; 
  END@@
$ CREATE TRIGGER <triggerName> AFTER UPDATE ON <table>
  FOR EACH ROW 
  BEGIN 
    SELECT MySQLNotification(NEW.id, 3) INTO @x; 
  END@@
$ CREATE TRIGGER <triggerName> AFTER DELETE ON <table>
  FOR EACH ROW 
  BEGIN 
    SELECT MySQLNotification(OLD.id, 4) INTO @x; 
  END@@
$ DELIMITER ;
```

# Running

> $ node server.json

- Go to address http://127.0.0.1:999 in your browser and start receiving notifications from your database.

