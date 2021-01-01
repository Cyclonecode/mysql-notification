#!/bin/bash

cd /tmp/src
sudo -E make
sudo cp mysql-notification.so `mysql_config --plugindir`
mysql -uroot -p$MYSQL_ROOT_PASSWORD < /data/application/test.sql
