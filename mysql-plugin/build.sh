#!/bin/bash

TARGET_DIR=./src
MYSQL_INCLUDE_DIR=/usr/include/mysql

# Uncomment this line to set mysql header path dynamically.
# MYSQL_INCLUDE_DIR=`find / -name mysql.h 2>/dev/null`

if [ "$1" == 'clean' ]; then
  rm ${TARGET_DIR}/*.o ${TARGET_DIR}/*.so
  exit
fi

gcc -c -Wall -fpic ${TARGET_DIR}/mysql-notification.c -o ${TARGET_DIR}/mysql_notification.o -I${MYSQL_INCLUDE_DIR}
gcc -shared -o ${TARGET_DIR}/mysql_notification.so ${TARGET_DIR}/mysql_notification.o

# Uncomment this line to copy shared object file into mysql plugin path.
cp ${TARGET_DIR}/mysql_notification.so /usr/lib/mysql/plugin/.