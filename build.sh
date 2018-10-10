#!/bin/bash

TARGET_DIR=./mysql-plugin/src
MYSQL_INCLUDE_DIR=/usr/include/mysql
MYSQL_PLUGIN_DIR=/usr/lib/mysql/plugin

if [ "$1" == 'clean' ];
then
  rm ${TARGET_DIR}/*.o ${TARGET_DIR}/*.so
  exit
fi

if [ ! -d "$MYSQL_INCLUDE_DIR" ];
then
  echo "Enter path to mysql headers: "
  read MYSQL_INCLUDE_DIR
fi

if [ ! -d "$MYSQL_INCLUDE_DIR" ];
then
  echo "$MYSQL_INCLUDE_DIR does not exists."
  exit 1
fi

if [ ! -d "$MYSQL_PLUGIN_DIR" ];
then
  echo "Enter path to mysql plugin dir: "
  read MYSQL_PLUGIN_DIR
fi

if [ ! -d "$MYSQL_INCLUDE_DIR" ];
then
  echo "$MYSQL_PLUGIN_DIR does not exists."
  exit 1
fi

gcc -c -Wall -fpic ${TARGET_DIR}/mysql-notification.c -o ${TARGET_DIR}/mysql_notification.o -I${MYSQL_INCLUDE_DIR}
gcc -shared -o ${TARGET_DIR}/mysql_notification.so ${TARGET_DIR}/mysql_notification.o
cp ${TARGET_DIR}/mysql_notification.so ${MYSQL_PLUGIN_DIR}/.
chmod 0444 ${MYSQL_PLUGIN_DIR}/mysql_notification.so