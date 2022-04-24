FROM centos:7
LABEL author="teamlinker"
USER root
RUN yum install -y epel-release  && yum install -y nginx && mkdir -p /home/teamlinker/server && mkdir -p /home/teamlinker/client && yum -y install redis && yum install -y nodejs && yum install -y npm && sed -i "s/daemonize no/daemonize yes/g" /etc/redis.conf && mkdir -p /tmp/teamlinker
RUN npm install pm2 -g
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./server/* /home/teamlinker/server
COPY ./client/assets /home/teamlinker/client/assets
COPY ./client/img /home/teamlinker/client/img
COPY ./client/js /home/teamlinker/client/js
COPY ./client/static /home/teamlinker/client/static
COPY ./client/admin.html /home/teamlinker/client
COPY ./client/favicon.ico /home/teamlinker/client
COPY ./client/index.html /home/teamlinker/client
COPY ./run.config.json /home
COPY ./run.sh /home/run.sh
RUN chmod +x /home/run.sh
ENTRYPOINT [ "/home/run.sh" ]
EXPOSE 80