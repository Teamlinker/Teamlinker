#!/bin/sh
rabbitmq-server -detached
redis-server /etc/redis/redis.conf
while true
do
        process=`netstat -nap|grep :::5672`;
        if [ "$process" = "" ]; then
                echo "waiting rabbitmq";
                 sleep 5;
        else
                break;
        fi
done
cd /home/teamlinker && ./teamlinker
