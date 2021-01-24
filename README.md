# mysql-notification

A simple example of using a user defined function (UDF) in mysql to make real-time notifications on a table change. This project consists of a mysql plugin that setups a server socket that receives messages from a trigger connected to INSERT, UPDATE, DELETE operations on a specific table in the database. The server will then send a message to a nodejs server that in turn will bounce this notification to any connected http client over a websocket.

## Docker

The project has two Dockerfiles that can be used to build and start two services.
One running the node application, which includes the http server, websocket server and also the socket server
acting as a bridge for data sent from the second container.
The second container runs the mysql server and uses a small bootstrap script to compile the mysql plugin and then
install the database and setup the needed triggers.

### docker-compose

    docker-compose build
    # or
    npm run build

Build the containers:

    docker-compose up -d
    # or
    npm run up

Runs both services.

    docker-compose down
    # or 
    npm run down

Terminate both containers.

    docker-compose logs node
    # or
    npm run logs:node

Show logs for the node service.

    docker-compose logs mysql
    # or
    npm run logs:mysql

Show logs for the mysql service.

    docker-compose exec node /bin/bash
    # or
    npm run exec:node

Executes a shell in the node container.

    docker-compose exec mysql /bin/bash
    # or
    npm run exec:mysql

Executes a shell in the mysql container.

    docker-compose exec node node scripts/insert.js [--] [--title=text] [--content=text] [--image=text]
    # or
    npm run insert:node [--] [--title=text] [--content=text] [--image=text]

Inserts a record into the database.

    docker-compose exec node node scripts/update.js -- --id=ID [--title=text] [--content=text] [--image=text]
    # or
    npm run update:node  -- --id=ID [--title=text] [--content=text] [--image=text]

Updates a record in the database.

    docker-compose exec node node scripts/delete.js [-- --id=ID]
    # or
    npm run delete:node [-- --id=ID]

Deletes all or a single record from the database.

    docker-compose exec node node scripts/select.js [-- --id=ID]
    # or
    npm run select:node [-- --id=ID]

Selects all or a single record from the database.

## Compiling

### Manually

- You first need to build your shared library using:

```
$ gcc -c -Wall -fpic mysql-notification.c -o mysql-notification.o -I/path/mysql/headers
$ gcc -shared -o mysql-notification.so mysql-notification.o
```

Notice that you'll need to have the mysql headers installed on your system.
Using linux this can be done by running:

#### Linux

```
sudo apt-get update
sudo apt-get install libmysqld-dev
```

#### OSX

```
brew install mysql mysql-client
```

Notice that it seems like mysql 8 does not contain the `my_global.h` file, so you might need to install a lower version:

```
brew install mysql@5.7 mysql-client@5.7
```

To find the location of the mysql headers you can execute:

    mysql_config --include

### Using make

You can find a makefile under the `mysql-plugin/src`
 folder, which can be used to compile and build the plugin.
 
    make MYSQL_INCLUDE_DIR/usr/local/mysql/include
    
Compiles and builds the shared library. You will need to set `MYSQL_INCLUDE_DIR` before compiling.

    make install MYSQL_PLUGIN_DIR/usr/local/mysql/plugin

Copies the shared library to the mysql plugin dir specified by `MYSQL_PLUGIN_DIR` in the environment.

    make clean

Removes temporary files.

If you set the correct environment variables you can also compile and install the extension using npm:

    npm run compile
    npm run install
    npm run clean

# Installation

- The project requires that you have node 10+ installed on your system. You can use `nvm` to use the desired version by running `nvm use` in the root of the project.

- Install modules from **package.json**:

      npm install

- Setup your user defined function (UDF) by adding the shared library into the mysql plugin folder:

      PLUGIN_DIR=`mysql_config --plugindir`
      cp mysql-notification.so $PLUGIN_DIR/.

- Tell mysql about the UDF:

      CREATE FUNCTION MySQLNotification RETURNS INTEGER SONAME 'mysql-notification.so';

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

- Notice, that the `index.html` will be created if it does not yet exists.
- Go to address **http://localhost/<install_dir>/index.html** in your browser and start receiving notifications from your database.

By default the server is running on port **2048** and the websocket on port **8080**.

## Configuration

The project is using dotenv for configuration, so you can simply place a `.env` file in the root of the project and set up the following values:

    MYSQL_USERNAME=username

The database username, default is 'root'.    
    
    MYSQL_PASSWORD=password

The database password, default is ''.

    MYSQL_DATABASE=database

The database name, default is 'mysql_note'.

    MYSQL_HOSTNAME=hostname

The database hostname, default is 'localhost'.

    MYSQL_PORT=port

The database port, default is 3306.

    SSL_ENABLED=1

Specifies if we would like to use https or not, default ''.

    SSL_KEY=key

The ssl certificate key file to use when https is enabled.
Notice that this file needs to be readable by the application.

    SSL_CERTIFICATE=certificate

The ssl certificate file to use when https is enabled.
Notice that this file needs to be readable by the application.

    SERVER_ADDR=address

The address to bind the server to, default is 'localhost'. 

    SERVER_PORT=port

The port on which the server should be listening, default is 2048.

    WEBSOCKET_PORT=port

The websocket port that will be used, default is 8080.

    AUTO_ACCEPT_CONNECTION=1

Auto accept any connetions, default 0.

    ALLOWED_ORIGINS=localhost

White list of origins allowed to connect, default is '*'.
Multiple origins can be separated by a ',' e.g localhost,example.com,192.168.33.10.

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
