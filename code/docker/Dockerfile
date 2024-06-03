FROM teamlinkeroffical/teamlinker-docker:1.0
LABEL author="teamlinker"
USER root
COPY ./teamlinker.zip /home/teamlinker
COPY ./run.sh /home/teamlinker/run.sh
RUN cd /home/teamlinker  \
    && unzip teamlinker.zip
COPY ./mediasoup-worker /home/teamlinker/dist/server/mediasoup-worker
RUN cd /home/teamlinker/dist/server  \
    && MEDIASOUP_WORKER_BIN="/home/teamlinker/dist/server/mediasoup-worker" npm i
RUN cd /home/teamlinker/dist/server  \
    && pkg ./gateway/index.js -o ./package/teamlinker -c ./package.json -t node18-linux,node18-macos  \
    && cp ./package/teamlinker-linux /home/teamlinker/teamlinker  \
    && rm -rf /home/teamlinker/dist  \
    && rm -rf /home/teamlinker/teamlinker.zip
ENTRYPOINT [ "/home/teamlinker/run.sh" ]
EXPOSE 14000