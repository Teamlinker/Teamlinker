<h1 align="center">
TLMeetingServer
</h1>
<p align="center">
A simple video meeting library based on <b>node.js</b> and <b>typescript</b>
</p>
<p align="center">
This is <b>server</b> package,you can retrieve client package from <a href="https://github.com/Teamlinker/TLMeetingClient">here</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/tlmeetingserver">
    <img src="https://flat.badgen.net/npm/v/tlmeetingserver?icon=npm" alt="npm"/>
  </a>
  <a href="https://www.npmjs.com/package/tlmeetingserver">
    <img src="https://flat.badgen.net/bundlephobia/minzip/tlmeetingserver?color=green" alt="Minzipped size"/>
  </a>
</p>

## About
It is an open-source video meeting package of [Teamlinker](https://team-linker.com). It provides a variety of features to help users to build their own meeting rooms like these below:

![](https://team-linker.com/assets/exampleMeeting1-0dc2e795.png)

## Features
1. Very easy to complete video meeting functionality
2. Support screen share,presenter management
3. mute & unmute
4. meeting chat
5. Free and open-source based on mediasoup


## Demo
[Teamlinker](https://team-linker.com)

Teamlinker provides a full experience of this package.Have a try!

## Installation
```shell
npm i tlmeetingserver
```
## Usage

TLMeetingServer is based on socket.io,you should build a socket.io connection from client and pass the io instance and meeting config to the TLMeetingServer construct function.

```typescript
let objMeeting=new MeetingServer(io,meetingConfig as any)
objMeeting.onJoinRoom=async (roomId,extraData, socketData, socketId) => {
    try {
        let objRoom=await MeetingRoomService.getItemById(roomId)
        if(!objRoom) {
            return {
                businessId:null,
                roomName:null,
                error:"room not found"
            }
        } else if(objRoom.getItem().password!==extraData){
            return {
                businessId:null,
                roomName:null,
                error:"password wrong"
            }
        } else if(objRoom.getItem().organization_id!==socketData.organizationId) {
            return {
                businessId:null,
                roomName:null,
                error:"access forbidden"
            }
        } else {
            return {
                businessId:socketData.organizationUserId,
                roomName:objRoom.getItem().name
            }
        }
    } catch (err) {
        console.error(err)
    }
}
objMeeting.onJoinedRoom=async (roomId, businessId, socketId) => {
    try {
        let objRoom=await MeetingRoomService.getItemById(roomId)
        if(objRoom) {
            await objRoom.addMember(businessId)
            emit.in(businessId).socketsJoin(roomId)
        }
    } catch(err) {
        console.error(err)
    }
}
objMeeting.onLeavedRoom=async (type, roomId, businessId) => {
    try {
        let objRoom=await MeetingRoomService.getItemById(roomId)
        if(objRoom) {
            await objRoom.removeMember(businessId)
            emit.in(businessId).socketsLeave(roomId)
        }
    } catch(err) {
        console.error(err)
    }
}
objMeeting.onHandleOperation=async (type, roomId, fromBusinessId, toBusinessId, kind) => {
    try {
        let objRoom=await MeetingRoomService.getItemById(roomId)
        if(objRoom) {
            let ret=await objRoom.getPermission(fromBusinessId)
            if(ret===ECommon_Meeting_Room_Permission.PRESENTER) {
                return true;
            }
        } else {
            return false
        }
    } catch(err) {
        console.error(err)
        return false
    }
}
objMeeting.onDeleteRoom=async roomId => {
    try {
        await rpcContentApi.clearByRefId(roomId)
    } catch (err) {
        console.error(err)
    }

}
objMeeting.onMessageSend=async (roomId, fromBusinessId, message) => {
    try {
        await rpcContentApi.add(roomId,ECommon_Model_Content_Type.MEETING_CHAT, fromBusinessId,message as string)
    } catch (err) {
        console.error(err)
    }

}
await objMeeting.start()
```

### Meeting Config
```typescript
export default {
  "worker": {
    "logLevel": "warn",
    "logTags": [
      "info",
      "ice",
      "dtls",
      "rtp",
      "srtp",
      "rtcp"
    ],
    "rtcMinPort": 40000,
    "rtcMaxPort": 49999
  },
  "codecs": [
    {
      "kind": "audio",
      "mimeType": "audio/opus",
      "clockRate": 48000,
      "channels": 2
    },
    {
      "kind": "video",
      "mimeType": "video/VP8",
      "clockRate": 90000,
      "parameters": {
        "x-google-start-bitrate": 1000
      }
    },
    {
      "kind": "video",
      "mimeType": "video/VP9",
      "clockRate": 90000,
      "parameters": {
        "profile-id": 2,
        "x-google-start-bitrate": 1000
      }
    },
    {
      "kind": "video",
      "mimeType": "video/h264",
      "clockRate": 90000,
      "parameters": {
        "packetization-mode": 1,
        "profile-level-id": "4d0032",
        "level-asymmetry-allowed": 1,
        "x-google-start-bitrate": 1000
      }
    },
    {
      "kind": "video",
      "mimeType": "video/h264",
      "clockRate": 90000,
      "parameters": {
        "packetization-mode": 1,
        "profile-level-id": "42e01f",
        "level-asymmetry-allowed": 1,
        "x-google-start-bitrate": 1000
      }
    }
  ],
  "webRtcTransport": {
    "listenIps": [
      {
        "ip": "0.0.0.0",
        "announcedIp": "192.168.110.6"  //this ip should be the public ip
      }
    ],
    "enableUdp": true,
    "enableTcp": true,
    "preferUdp": true,
    "enableSctp": false,
    "initialAvailableOutgoingBitrate": 1000000,
    "maxSctpMessageSize": 262144
  }
}
```

## About Teamlinker
Teamlinker is a cooperation platform that integrates different kind of modules.You can contact your teammates,assign your tasks,start a meeting,schedule your events,manage your files and so on with Teamlinker.
