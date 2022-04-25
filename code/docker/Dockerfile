FROM centos:7
LABEL author="teamlinker"
USER root
RUN yum install -y epel-release  && mkdir -p /home/teamlinker && yum -y install redis &&  sed -i "s/daemonize no/daemonize yes/g" /etc/redis.conf
COPY ./teamlinker /home/teamlinker/teamlinker
COPY ./run.sh /home/run.sh
RUN chmod +x /home/run.sh
ENTRYPOINT [ "/home/run.sh" ]
EXPOSE 13000