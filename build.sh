#!/bin/bash

TARGET_DIR=./mysql-plugin/src
MYSQL_INCLUDE_DIR=/usr/include/mysql
MYSQL_PLUGIN_DIR=/usr/lib/mysql/plugin
SERVER_PORT=2048
SERVER_ADDRESS=\"127.0.0.1\"
MYSQL_INCLUDE_DIR=/usr/local/Cellar/mysql-client/5.7.23/include/mysql
MYSQL_PLUGIN_DIR=/usr/local/opt/mysql/lib/plugin/

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

echo "Override the default server port and address (127.0.0,1:2048)? [y/N]: "
read confirm
if [ "$confirm" == "y" ] || [ "$confirm" == "Y" ];
then
  echo "Enter server address: "
  read SERVER_ADDRESS
  echo "Enter server port: "
  read SERVER_PORT
fi

gcc -c -D SERVER_PORT=${SERVER_PORT} -D SERVER_ADDRESS=${SERVER_ADDRESS} -Wall -fpic ${TARGET_DIR}/mysql-notification.c -o ${TARGET_DIR}/mysql_notification.o -I${MYSQL_INCLUDE_DIR}
gcc -shared -o ${TARGET_DIR}/mysql_notification.so ${TARGET_DIR}/mysql_notification.o
cp ${TARGET_DIR}/mysql_notification.so ${MYSQL_PLUGIN_DIR}/.
chmod 0444 ${MYSQL_PLUGIN_DIR}/mysql_notification.so