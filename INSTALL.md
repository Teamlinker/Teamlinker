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
