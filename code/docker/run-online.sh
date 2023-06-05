#!/bin/sh
rabbitmq-server -detached
redis-server /etc/redis.conf
sleep 5
cd /home/teamlinker/dist/server/gateway && node index.js
