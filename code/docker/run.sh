#!bin/sh
nginx
redis-server /etc/redis.conf
pm2 start /home/teamlinker/server/user --name user -- --name user
pm2 start /home/teamlinker/server/cooperation --name cooperation -- --name cooperation
pm2 start /home/teamlinker/server/file --name file -- --name file
/home/teamlinker/server/gateway --name gateway
