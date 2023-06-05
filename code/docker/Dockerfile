FROM centos/python-38-centos7:latest
LABEL author="teamlinker"
USER root
RUN curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -  \
    && yum remove gcc -y  \
    && yum install -y epel-release yum-utils socat unzip git centos-release-scl devtoolset-8 nodejs  \
    && mkdir -p /home/teamlinker /usr/rabbitmq  \
    &&  yum install -y http://rpms.remirepo.net/enterprise/remi-release-7.rpm  \
    && yum-config-manager --enable remi  \
    && yum install -y redis  \
    &&  sed -i "s/daemonize no/daemonize yes/g" /etc/redis.conf
COPY ./teamlinker.zip /home/teamlinker
COPY ./erlang.x86_64.rpm /usr/rabbitmq/erlang.x86_64.rpm
COPY ./rabbitmq.el7.noarch.rpm /usr/rabbitmq/rabbitmq.el7.noarch.rpm
COPY ./run.sh /home/teamlinker/run.sh
RUN cd /home/teamlinker  \
    && unzip teamlinker.zip  \
    && echo "source /opt/rh/devtoolset-8/enable" >> /etc/bashrc  \
    && source /etc/bashrc  \
    && cd /home/teamlinker/dist/server  \
    && npm i  \
    && cd /home/teamlinker/dist/server  \
    && npm i -g pkg  \
    && pkg ./gateway/index.js -o ./package/teamlinker -c ./package.json -t node18-linux,node18-macos  \
    && cp ./package/teamlinker-linux /home/teamlinker/teamlinker  \
    && rm -rf /home/teamlinker/dist  \
    && rm -rf /home/teamlinker/teamlinker.zip  \
    && cd /usr/rabbitmq/  \
    && rpm -ivh erlang.x86_64.rpm  \
    && rpm -ivh rabbitmq.el7.noarch.rpm  \
    && chmod +x /home/teamlinker/run.sh
COPY ./rabbitmq_delayed_message_exchange-3.8.0.ez /usr/lib/rabbitmq/lib/rabbitmq_server-3.8.8/plugins/rabbitmq_delayed_message_exchange-3.8.0.ez
RUN rabbitmq-plugins enable rabbitmq_delayed_message_exchange
ENTRYPOINT [ "/home/teamlinker/run.sh" ]
EXPOSE 14000