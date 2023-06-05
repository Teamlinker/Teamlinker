#!/bin/sh
rabbitmq-server -detached
redis-server /etc/redis.conf
#tail -f /dev/null
sleep 5
cd /home/teamlinker && ./teamlinker
