#!/bin/bash

COMPILER=cc
TARGET_DIR=./mysql-plugin/src
TARGET_FILE=mysql_notification
MYSQL_INCLUDE_DIR=/usr/include/mysql
MYSQL_PLUGIN_DIR=/usr/lib/mysql/plugin

if [ -z "$SERVER_PORT" ];
then
  SERVER_PORT=2048
fi
if [ -z "$SERVER_ADDRESS" ];
then
  SERVER_ADDRESS=127.0.0.1
fi
if [ -z "$WEBSOCKET_PORT" ];
then
  WEBSOCKET_PORT=8080
fi
if [ -z "$MYSQL_USER" ];
then
  MYSQL_USER=root
fi
if [ -z "$MYSQL_PASSWORD" ];
then
  MYSQL_PASSWORD=
fi
if [ -z "$MYSQL_DATABASE" ];
then
  MYSQL_DATABASE=mysql_note
fi

command -v ${COMPILER} >/dev/null 2>&1 || { echo >&2 "$COMPILER is required, please install it."; exit 1; }

if [ "$1" == 'clean' ];
then
  rm ${TARGET_DIR}/*.o ${TARGET_DIR}/*.so
  exit
fi

if [ ! -d "$MYSQL_INCLUDE_DIR" ];
then
  read -p "Enter path to mysql headers: " MYSQL_INCLUDE_DIR
fi

if [ ! -d "$MYSQL_INCLUDE_DIR" ];
then
  echo "$MYSQL_INCLUDE_DIR does not exists."
  exit 1
fi

if [ ! -d "$MYSQL_PLUGIN_DIR" ];
then
  read -p "Enter path to mysql plugin dir: " MYSQL_PLUGIN_DIR
fi

if [ ! -d "$MYSQL_INCLUDE_DIR" ];
then
  echo "$MYSQL_PLUGIN_DIR does not exists."
  exit 1
fi

read -p "Override the default server port and address (127.0.0,1:2048)? [y/N]: " confirm
if [ "$confirm" == "y" ] || [ "$confirm" == "Y" ];
then
  read -p "Enter server address: " SERVER_ADDRESS
  read -p "Enter server port: " SERVER_PORT
fi

read -p "Change default websocket port 8080? [y/N]: " confirm
if [ "$confirm" == "y" ] || [ "$confirm" == "Y" ];
then
  read -p "Enter websocket port: " WEBSOCKET_PORT
fi

${COMPILER} -c -D SERVER_PORT=${SERVER_PORT} -D SERVER_ADDRESS=\"${SERVER_ADDRESS}\" -Wall -fpic ${TARGET_DIR}/mysql-notification.c -o ${TARGET_DIR}/${TARGET_FILE}.o -I${MYSQL_INCLUDE_DIR}
${COMPILER} -shared -o ${TARGET_DIR}/${TARGET_FILE}.so ${TARGET_DIR}/${TARGET_FILE}.o
cp ${TARGET_DIR}/${TARGET_FILE}.so ${MYSQL_PLUGIN_DIR}/.
chmod 0444 ${MYSQL_PLUGIN_DIR}/${TARGET_FILE}.so

if [ $? -eq 0 ] && [ "$1" == 'start' ];
then
  mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} < bin/test.sql
  node ./scripts/server.js -p${SERVER_PORT} -w${WEBSOCKET_PORT} -h\"${SERVER_ADDRESS}\"
fi
