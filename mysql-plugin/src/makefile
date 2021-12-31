MYSQL_INCLUDE_DIR?=/usr/include/mysql
MYSQL_PLUGIN_DIR?=/usr/lib/mysql/plugin
PLUGIN?=mysql-notification
SERVER_PORT?=2048
SERVER_ADDRESS?=127.0.0.1

${PLUGIN}.o : mysql-notification.c
	${CC} -c -D SERVER_PORT=${SERVER_PORT} -D SERVER_ADDRESS='"${SERVER_ADDRESS}"' -Wall -fpic ${CCFLAGS} -o $@ -I${MYSQL_INCLUDE_DIR} $?

${PLUGIN}.so : ${PLUGIN}.o
	${CC} -shared -o $@ $?
	chmod 0644 $@

install : ${PLUGIN}.so
	cp $? ${MYSQL_PLUGIN_DIR}/$?

clean:
	rm -rf *.o *.so
