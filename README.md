<p align="center">
   <a href="https://team-linker.com">
     <img width="200" src="img/logo.png">
   </a>
</p>
<h3 align="center">
Team Collaboration Solution For Enterprise Users
</h3>
<h4 align="center">
Team collaboration has never been easier
</h4>

## 📝 Introduction
Teamlinker is a team collaboration platform that integrates multi-functional modules,such as contact, task management, meeting, IM,Wiki and file management.

The platform solves the problem of efficient collaboration within the team and avoids the problem of companies using multiple tools to handle project progress, communication with colleagues and client meetings separately. Compared with traditional tools, Teamlinker not only provides basic and comprehensive collaborative office needs, but also has extremely low cost.

Teamlinker is developed based on the TeamOS system. It is a web operating system that allows users to process different tasks in parallel, similar to operating systems such as Win and Mac. It mainly contains six functional modules: project, wiki, calendar, meeting, chat and network disk. These functions are seamlessly integrated to make team collaboration smoother.

## 📋 Official website

https://team-linker.com


## 📋 Documentation
https://team-linker.com/doc/en/

## 🕐︎ Features
* Completely developed using TypeScript, using Node.js on the backend and Vue3 on the frontend.
* Created a Web OS system from scratch, realizing functions such as desktop management, multi-window, multi-tasking, file drag-and-drop, upload and download.
* Use WebRtc to realize multi-person video and voice transmission, including member invitation, screen sharing, virtual background, video blur and other functions. At the same time, conference administrator control and in-meeting chat functions are implemented.
* A block editor is developed based on HTMLElement's contentEditable, which supports free typesetting, color and font adjustment, link and picture insertion, as well as attachment addition and shortcuts.
* The project management module supports common project management functions such as custom work item types, workflows, fields, Kanban and Gantt chart management. It is completely developed using pure JavaScript and can be extracted as a separate module for use.
* The calendar part implements multi-calendar management, multi-time zone switching, free switching of day, week and month view status, supports all-day and repeated calendar events, and uses RabbitMQ to implement calendar event reminder functions.
* The IM function uses Socket.IO to realize @ everyone or specific members in the message group, message collection and search, and also includes functions such as fast video conferencing.
* The upcoming AI function uses NLP technology and the Transformers framework to create a personal work assistant to provide you with personalized services.


## 📲 Core Architecture
<p>
   <img src="img/core.png">
</p>

##

## 🔐 Installation
### Preparation

```bash
1. A server (preferably a Linux system)
2. Mysql server (preferably version 8.0+)
3. docker environment
```

### Steps
##### 1. Config basic settings

```bash
mkdir teamlinker-files
cd teamlinker-files
mkdir certs
touch extra.config.json
```
Paste the json content below into extra.config.json and fill the fields with the correct values
```
{
   "mysql": {
     "url":"your mysql ip address",
     "port":3306,
     "database":"teamlinker",
     "username":"your mysql username",
     "password":"your mysql password"
   },
   "listenIps": [
     {
       "ip": "0.0.0.0",
       "announcedIp": "192.168.110.6"
     }
   ],
   "rtcMinPort": 40000,
   "rtcMaxPort": 41000
}
```
Field meaning analysis
```
{
   "mysql": "You should prepare a mysql server, preferably version 8.0+, and create a schema for Teamlinker",
   "listenIps": [
     {
       "ip": "Normally no need to change",
       "announcedIp": "Public IP address of the deployed server"
     }
   ],
   "rtcMinPort": "The conference transmission port should not be occupied by other applications. High ports are preferred",
   "rtcMaxPort": "The conference transmission port should not be occupied by other applications. High ports are preferred"
}
```

##### 2. TLS certificate file

Since Teamlinker uses webrtc technology, the tls certificate file is required. If you don't have any certificate files, you can download [cert.pem](https://team-linker.com/doc/cert/cert.pem) and [key.pem](https://team-linker.com/doc/cert/key.pem) as a temporary backup and put them into the certs directory, but the web browser will show that it is not trusted and the user should trust it manually.

You'd better prepare a domain name and TLS certificate file so that all users can safely access your website.

##### 3. Start Docker

You can get docker from docker hub: [Docker Edition](https://hub.docker.com/repository/docker/teamlinkeroffical/teamlinker/general)

You can get the latest version using the following command:
```
docker push teamlinkeroffical/teamlinker:[tagname]
```
you can
```
docker push teamlinkeroffical/teamlinker
```

Then you can start it:
```
docker run -d -p [rtcMinPort]-[rtcMaxPort]:[rtcMinPort]-[rtcMaxPort] -p 14000:14000 -v [your teamlinker-files folder path on your server]:/opt/teamlinker-files -e TZ= [your mysql server timezone,such as Asia/Shanghai] teamlinkeroffical/teamlinker:[tagname]
```
you can
```
docker run -d -p 14000:14000 -v D:\code\teamlinker-files:/opt/teamlinker-files -e TZ=Asia/Shanghai teamlinkeroffical/teamlinker
```


##### 4. Visit your website

Open **https://[server ip address]:14000** in a web browser to check if everything is fine, if so you will see the login page.

You can log in using the default username/password: **teamlinker/teamlinker**

If you want easy access, you can use a load balancing solution such as nginx, haproxy, and direct the domain name to the ip address and port.

##### 5. Upgrade

1. Back up database data
2. Pull the latest version of docker and execute the docker run command like the first time




## 📱 Online demo
project

![example](img/example.png)
![example1](img/example1.png)
![example2](img/example2.png)
![example3](img/example3.png)
![example4](img/example4.png)

document

![example2-1](img/example2-1.png)


calendar

![example3-1](img/example3-1.png)
![example3-2](img/example3-2.png)

Meeting

![example4-1](img/example4-1.png)

chat

![example5-1](img/example5-1.png)

File management

![example6-1](img/example6-1.png)

system

![example7-1](img/example7-1.png)


## 🎬 Author

Ansun [[ website ](https://team-linker.com) | [ github ](https://github.com/sx1989827)]

## 📺 Tips
1. Only allowed to be used for personal study, graduation projects, teaching cases, public welfare undertakings, and commercial use;

2. If copyright information must be retained for commercial use, please abide by it consciously;

3. It is prohibited to sell the code and resources of this open source in any form or under any name, otherwise the infringer will be responsible for any consequences;

4. The source code of this version is all open source; including front-end and back-end, without any encryption;

5. For commercial use, please carefully review the code and vulnerabilities. It must not be used for commercial applications outside the scope of permission in any country. You will be responsible for any consequences;


## 🔓 License

[ISC](./LICENSE)

## ⚡Technology Exchange
Discord https://discord.gg/X8t4d7JqgX