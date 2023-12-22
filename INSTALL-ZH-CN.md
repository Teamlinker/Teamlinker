## 🔐 安装
### 准备工作

```bash
1、一台服务器(最好是Linux系统)
2、Mysql服务器(最好是8.0+版本)
3、docker环境
```

### 步骤
##### 1、Config基本设置

```bash
mkdir teamlinker-files
cd teamlinker-files
mkdir certs
touch extra.config.json
```
将下面的json内容粘贴到extra.config.json中，并用正确的值填充字段
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
字段含义解析
```
{
  "mysql": "你应该准备一个mysql服务器，最好是8.0+版本，并为Teamlinker创建一个模式",
  "listenIps": [
    {
      "ip": "通常不用更改",
      "announcedIp": "部署的服务器的公共IP地址"
    }
  ],
  "rtcMinPort": "会议传输端口，不应被其他应用程序占用，优先选择高端口",
  "rtcMaxPort": "会议传输端口，不应被其他应用程序占用，优先选择高端口"
}
```

##### 2、TLS证书文件

由于Teamlinker使用webrtc技术，所以tls证书文件是必需的。如果您没有任何证书文件，可以下载[cert.pem](https://team-linker.com/doc/cert/cert.pem) 和[key.pem](https://team-linker.com/doc/cert/key.pem)作为临时备用，并将它们放入certs目录，但web浏览器会显示没有被信任的信息，用户应该手动信任它。

你最好准备一个域名和tls证书文件，以便所有用户都能安全访问你的网站。

##### 3、启动 Docker

您可以从docker hub获取docker: [Docker Edition](https://hub.docker.com/repository/docker/teamlinkeroffical/teamlinker/general)

你可以使用以下命令获取最新版本:
```
docker push teamlinkeroffical/teamlinker:[tagname]
```
您可以
```
docker push teamlinkeroffical/teamlinker
```

然后您可以把它启动起来:
```
docker run -d -p [rtcMinPort]-[rtcMaxPort]:[rtcMinPort]-[rtcMaxPort] -p 14000:14000 -v [your teamlinker-files folder path on your server]:/opt/teamlinker-files -e TZ=[your mysql server timezone,such as Asia/Shanghai] teamlinkeroffical/teamlinker:[tagname]
```
您可以
```
docker run -d -p 14000:14000 -v D:\code\teamlinker-files:/opt/teamlinker-files -e TZ=Asia/Shanghai teamlinkeroffical/teamlinker
```


##### 4、访问您的网站

在web浏览器中打开 **https://[server ip address]:14000** 检查是否一切正常，如果没问题，您将看到登录页面。

您可以使用默认用户名/密码: **teamlinker/teamlinker** 登录

如果你想方便地访问，你可以使用一个负载均衡解决方案，例如nginx、haproxy，并将域名定向到ip地址和端口。

##### 5、升级

1. 备份数据库数据
2. 拉取最新版本的docker并像第一次一样执行docker run命令