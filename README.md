# mysql-notification

A simple example of using a user defined function (UDF) in mysql to make real-time notifications on a table change. This project consists of a mysql plugin that setups a server socket that receives messages from a trigger connected to INSERT, UPDATE, DELETE operations on a specific table in the database. The server will then send a message to a nodejs server that in turn will bounce this notification to any connected http client over a websocket.

## Install

## Compiling

Notice that you may build the extension and install it using the supplied shell script:

    sudo npm run build

To clean up any files from a previous build you can execute:

     npm run clean

You can also build the extension, import the database and start the node server:

     npm run start

## Compiling manually

- You first need to build your shared library using:

```
$ gcc -c -Wall -fpic mysql-notification.c -o mysql-notification.o -I/path/mysql/headers
$ gcc -shared -o mysql_notification.so mysql-notification.o
```

Notice that you'll need to have the mysql headers installed on your system.
Using linux this can be done by running:

### Linux

```
sudo apt-get update
sudo apt-get install libmysqld-dev
```

### OSX

```
brew install mysql mysql-client
brew services start mysql
```

You can find the location of the mysql headers by executing:

    find / -name mysql.h 2>/dev/null

### OSX

    brew info mysql-client

# Installation

- Install modules from **package.json**:

      npm install

- Setup your user defined function (UDF) by adding the shared library into mysqls plugin folder, this folder
can be located by executing `SHOW VARIABLES LIKE 'plugin_dir';` from the mysql client:

      mysql -u<user> -p<pass> -e"SHOW VARIABLES LIKE 'plugin_dir'"
      cp mysql_notification.so /usr/local/mysql/lib/plugin/.

- Tell mysql about the UDF:

      CREATE FUNCTION MySQLNotification RETURNS INTEGER SONAME 'mysql_notification.so';

- Create triggers for INSERT/UPDATE/DELETE:

```
DELIMITER @@
CREATE TRIGGER <triggerName> AFTER INSERT ON <table>
FOR EACH ROW
BEGIN
  SELECT MySQLNotification(NEW.id, 2) INTO @x;
END@@
CREATE TRIGGER <triggerName> AFTER UPDATE ON <table>
FOR EACH ROW
BEGIN
  SELECT MySQLNotification(NEW.id, 3) INTO @x;
END@@
CREATE TRIGGER <triggerName> AFTER DELETE ON <table>
FOR EACH ROW
BEGIN
  SELECT MySQLNotification(OLD.id, 4) INTO @x;
END@@
DELIMITER ;
```

You may also import import the supplied dump file located under **bin/test.sql**, this
will create a database called **mysql_note**, register the mysql plugin and create triggers for
**INSERT**, **UPDATE**, **DELETE** queries on the **post** table:

    mysql -u<user> -p<pass> < bin/test.sql

# Running

Start the server with the default settings:

    npm run dev

To build and run the application in production using pm2:

    npm run start

Start the server at a specific address and port:

    npm run start -- --port 2048 --host localhost --websocket 8080

- Notice, that the `index.html` will be created if it does not yet exists.
- Go to address **http://localhost/<install_dir>/index.html** in your browser and start receiving notifications from your database.
- The `--port` argument can be used to specify which server port listen on.
- The `--websocket` argument can be used to specify which websocket port to open.
- The `--host` argument can be used to specify which address to bind to.

By default the server is running on port **2048** and the websocket on port **8080**.

# Testing

You can then test the behavior by running queries against your database:

    mysql -u<user> -p<pass> <database> -e"INSERT INTO post VALUES(1, 'title', 'content', 'url');"

Insert trigger.

    mysql -u<user> -p<pass> <database> -e"UPDATE post SET title = 'updated title' WHERE id = 1;"

Update trigger.

    mysql -u<user> -p<pass> <database> -e"DELETE FROM post WHERE id = 1"

Delete trigger.

You may also use the supplied node scripts to insert/update and delete records:

    npm run insert

Insert a single record into the post table using default values.

    npm run insert -- --title mytitle --content mycontent --image myurl

Insert a single record into the post table using custom values.

    npm run update -- --id 3 --title newtitle --content newcontent --image newurl

Update a record and changing some values.

    npm run delete -- --id 3

Delete a single post with id equal to 3 from the post table.

    npm run delete

Delete all records from the post table.

    npm run select -- --id 3

Display a single row from the post table.

    npm run select

Display all rows in the post table.

You can also specify connection credentials for mysql in all the above commands:

    npm run select -- --host localhost --port 3306 --user user --pass pass --database database
