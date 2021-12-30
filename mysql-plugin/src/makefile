MYSQL_INCLUDE_DIR?=/usr/include/mysql
MYSQL_PLUGIN_DIR?=/usr/lib/mysql/plugin
PLUGIN?=mysql-notification
SERVER_PORT?=2048
SERVER_ADDRESS?=127.0.0.1

mysql-notification : mysql-notification.c
	${CC} -c -D SERVER_PORT=${SERVER_PORT} -D SERVER_ADDRESS='"${SERVER_ADDRESS}"' -Wall -fpic ${CCFLAGS} -o $@.o -I${MYSQL_INCLUDE_DIR} $?
	${CC} -D SERVER_PORT=${SERVER_PORT} -D SERVER_ADDRESS='"${SERVER_ADDRESS}"' -shared -o $@.so $@.o
	chmod 0644 $@.so

install : mysql-notification.so
	cp $? ${MYSQL_PLUGIN_DIR}/${PLUGIN}.so

clean:
	unlink *.o
	unlink *.so
