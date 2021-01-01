MYSQL_INCLUDE_DIR?=/usr/include/mysql
MYSQL_PLUGIN_DIR?=/usr/lib/mysql/plugin
TARGET?=mysql-notification
SERVER_PORT?=2048
SERVER_ADDRESS?=127.0.0.1

${TARGET} : ${TARGET}.c
	${CC} -c -D SERVER_PORT=${SERVER_PORT} -D SERVER_ADDRESS=\"${SERVER_ADDRESS}\" -Wall -fpic ${CFLAGS} -o $@.o -I${MYSQL_INCLUDE_DIR} $?
	#touch ${TARGET}.o

${TARGET}.so : ${TARGET}.o
	${CC} -shared -o $@ $?

install : ${TARGET}.so
	cp $? ${MYSQL_PLUGIN_DIR}/${TARGET}.so

clean:
	rm -f *.o *.so
