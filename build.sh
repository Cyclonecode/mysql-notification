#!/bin/bash

COMPILER=cc
TARGET_DIR=./mysql-plugin/src
TARGET_FILE=mysql_notification
MYSQL_INCLUDE_DIR=/usr/include/mysql
MYSQL_PLUGIN_DIR=/usr/lib/mysql/plugin
SERVER_PORT=2048
SERVER_ADDRESS=127.0.0.1
WEBSOCKET_PORT=8080
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=mysql_note

command -v ${COMPILER} >/dev/null 2>&1 || { echo >&2 "$COMPILER is required, please install it."; exit 1; }

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

echo "Change default websocket port 8080? [y/N]: "
read confirm
if [ "$confirm" == "y" ] || [ "$confirm" == "Y" ];
then
  echo "Enter websocket port: "
  read WEBSOCKET_PORT
fi

${COMPILER} -c -D SERVER_PORT=${SERVER_PORT} -D SERVER_ADDRESS=\"${SERVER_ADDRESS}\" -Wall -fpic ${TARGET_DIR}/mysql-notification.c -o ${TARGET_DIR}/${TARGET_FILE}.o -I${MYSQL_INCLUDE_DIR}
${COMPILER} -shared -o ${TARGET_DIR}/${TARGET_FILE}.so ${TARGET_DIR}/${TARGET_FILE}.o
cp ${TARGET_DIR}/${TARGET_FILE}.so ${MYSQL_PLUGIN_DIR}/.
chmod 0444 ${MYSQL_PLUGIN_DIR}/${TARGET_FILE}.so

if [ $? -eq 0 ] && [ "$1" == 'start' ];
then
  mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} < bin/test.sql
  node ./server.js -p${SERVER_PORT} -w${WEBSOCKET_PORT} -h\"${SERVER_ADDRESS}\"
fi
