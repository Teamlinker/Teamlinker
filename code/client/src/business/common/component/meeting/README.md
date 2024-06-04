<h1 align="center">
TLMeetingClient
</h1>
<p align="center">
A simple video meeting library based on <b>node.js</b> and <b>typescript</b>
</p>
<p align="center">
This is <b>client</b> package,you can retrieve server package from <a href="https://github.com/Teamlinker/TLMeetingServer">here</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/tlmeetingclient">
    <img src="https://flat.badgen.net/npm/v/tlmeetingclient?icon=npm" alt="npm"/>
  </a>
  <a href="https://www.npmjs.com/package/tlmeetingclient">
    <img src="https://flat.badgen.net/bundlephobia/minzip/tlmeetingclient?color=green" alt="Minzipped size"/>
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
npm i tlmeetingclient
```
## Usage

TLMeetingClient is based on socket.io,you should build a socket.io connection from backend and pass the socket instance to the TLMeetingClient construct function.

.vue
```typescript
const props=defineProps<{
    meetingId:string,
    password?:string,
    inviteBusinessIds?:{
        id:string,
        type:ECommon_Model_Organization_Member_Type
    }[]
}>()
const loading=ref(true)
const unReadCount=ref(0)
const organizationUserList=ref<OrganizationUserItem[]>([])
const tabValue=ref("participant")
const speaker=ref<OrganizationUserItem>()
const myOrganizationUserId=SessionStorage.get("organizationUserId")
const me=ref<OrganizationUserItem>({
    organizationUserId:myOrganizationUserId,
    name:"",
    permission:ECommon_Meeting_Room_Permission.NORMAL,
    audioStream:null,
    videoStream:null,
    video:true,
    audio:true
})
const {t}=useI18n()
const meetingChat=ref<InstanceType<typeof MeetingChat>>(null)
const socket=SocketIOClient.get(ECommon_Socket_Type.MEETING)
const navigator=getCurrentNavigator()
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const currentMeeting=ref<DCSType<ICommon_Model_Meeting_Room>>()
const screenShareInfo=ref<{
    video:MediaStream,
    audio:MediaStream,
    organizationUserId:string
}>()
let meetingClient=new MeetingClient(socket.getSocket())
watch(tabValue,()=>{
    if(tabValue.value==="chat") {
        unReadCount.value=0
    }
})
meetingClient.onProducerStateChange=async (state, kind, businessId,type, stream, producerId) => {
    let objOrganizationUser=organizationUserList.value.find(value => value.organizationUserId===businessId)
    if(state=="new") {
        if(type==="camera" || type==="data") {
            if(!objOrganizationUser) {
                let obj=userTeamInfoPick.getInfos([{
                    id:businessId,
                    type:ECommon_IM_Message_EntityType.USER
                }])
                organizationUserList.value.push({
                    organizationUserId:businessId,
                    name:obj[businessId]?obj[businessId].name:"",
                    permission:ECommon_Meeting_Room_Permission.NORMAL,
                    audioStream:kind==="audio"?stream:null,
                    videoStream:kind==="video"?stream:null,
                    audio:kind==="audio"?true:false,
                    video:kind==="video"?true:false,
                })
                objOrganizationUser=organizationUserList.value.at(-1);
            } else {
                if(kind=="video") {
                    objOrganizationUser.videoStream=stream
                    objOrganizationUser.video=true
                } else if(kind=="audio") {
                    objOrganizationUser.audioStream=stream
                    objOrganizationUser.audio=true
                }
            }
            if(!speaker.value) {
                speaker.value=objOrganizationUser
            }
        } else if(type==="screen") {
            if(!screenShareInfo.value) {
                screenShareInfo.value={
                    organizationUserId:businessId,
                    audio:kind==="audio"?stream:null,
                    video:kind==="video"?stream:null,
                }
            } else {
                if(kind==="video") {
                    screenShareInfo.value.video=stream
                } else if(kind==="audio") {
                    screenShareInfo.value.audio=stream
                }
            }
        }
    } else if(state=="close") {
        if(type==="camera" || type==="data") {
            if(objOrganizationUser) {
                let index=organizationUserList.value.findIndex(value => value.organizationUserId===businessId)
                organizationUserList.value.splice(index,1)
                if(objOrganizationUser===speaker.value) {
                    speaker.value=null
                }
            }
        } else if(type==="screen") {
            screenShareInfo.value=null;
        }
    } else if(state=="pause") {
        if(objOrganizationUser) {
            if(kind=="video") {
                objOrganizationUser.video=false
            } else if(kind=="audio") {
                objOrganizationUser.audio=false
            }
        }
    } else if(state=="resume") {
        if(objOrganizationUser) {
            if(kind=="video") {
                objOrganizationUser.video=true
            } else if(kind=="audio") {
                objOrganizationUser.audio=true
            }
        }
    }
    handleState()
}
meetingClient.onKick=() => {
    navigator.pop()
}
meetingClient.onJoinedRoom=async roomInfo => {
    getCurrentMeeting()
    meetingChat.value.getMessage()
    if(props.inviteBusinessIds) {
        socket.getSocket().emit("meeting_invite",props.inviteBusinessIds)
    }
}
meetingClient.onLeavedRoom=roomInfo => {

}
meetingClient.onSpeaker=async businessId => {
    let obj=organizationUserList.value.find(item=>item.organizationUserId===businessId)
    if(obj && obj.organizationUserId!==myOrganizationUserId) {
        speaker.value=obj
    }
}
meetingClient.onLocalProducerInit=async stream => {
    let obj=userTeamInfoPick.getInfos([{
        id:myOrganizationUserId,
        type:ECommon_IM_Message_EntityType.USER
    }])
    me.value={
        organizationUserId:myOrganizationUserId,
        name:obj[myOrganizationUserId]?obj[myOrganizationUserId].name:"",
        permission:ECommon_Meeting_Room_Permission.NORMAL,
        audioStream:stream,
        videoStream:stream,
        video:true,
        audio:true
    }
    organizationUserList.value.unshift(me.value)
}
meetingClient.onLocalProducerStart=kind => {
    if(kind=="video" || kind=="audio") {
        handleState()
        loading.value=false
    }
}
const initMeeting=async ()=>{
    let password=props.password
    if(password==null) {
        password=await Dialog.input(root.value,appContext,t("placeholder.typeMeetingPassword"))
        if(!password) {
            Message.error(t("tip.joinMeetingFailed"))
            return
        }
    }
    let preview:any=await Dialog.open(root.value,appContext,t("controller.app.meeting.meetingProfile.meetingPreview"),markRaw(MeetingPreview))
    if(preview) {
        let ret=await meetingClient.join(props.meetingId,password,preview.enableVideo,preview.enableAudio,preview.cameraId)
        if(!ret?.success) {
            Message.error(ret.msg)
            navigator.pop()
        }
    } else {
        navigator.pop()
    }
}

const handleState=async ()=>{
    let [retState,retPermission]=await Promise.all([
        meetingClient.states(),
        socket.getSocket().emitWithAck("meeting_get_presenters")
    ])
    for(let obj of organizationUserList.value) {
        if(retPermission[obj.organizationUserId]) {
            obj.permission=retPermission[obj.organizationUserId]
        }
    }
    for(let objState of retState) {
        for(let objOrganizationUser of organizationUserList.value) {
            if (objState.businessId===objOrganizationUser.organizationUserId) {
                objOrganizationUser.video=objState.kinds["video"]
                objOrganizationUser.audio=objState.kinds["audio"]
            }
        }
    }
}

const handleUserInfo = (id: string, info: {
    id: string,
    name: string,
    photo: string
}) => {
    for(let obj of organizationUserList.value) {
        if(obj.organizationUserId==id) {
            obj.name=info.name;
        }
    }
}

const onPresenterChange=async (organizationUserId, permission) => {
    let obj=organizationUserList.value.find(item=>item.organizationUserId===organizationUserId)
    if(obj) {
        obj.permission=permission
    }
}

const onNewMessage=()=>{
    if(tabValue.value!=="chat") {
        unReadCount.value=1
    }
}

const getCurrentMeeting=async ()=>{
    let res=await apiMeeting.getCurrentRoom()
    if(res?.code==0) {
        currentMeeting.value=res.data
    }
}

const handleLeaveMeeting=async ()=>{
    await meetingClient.leave()
    navigator.pop()
}

onBeforeMount(()=>{
    eventBus.on(EClient_EVENTBUS_TYPE.UPDATE_USER_INFO, handleUserInfo)
    eventBus.on(EClient_EVENTBUS_TYPE.LEAVE_MEETING,  handleLeaveMeeting)
    socket.getSocket().on("meeting_presenter_change", onPresenterChange)
    initMeeting()
})

onBeforeUnmount(()=>{
    eventBus.off(EClient_EVENTBUS_TYPE.UPDATE_USER_INFO, handleUserInfo)
    eventBus.off(EClient_EVENTBUS_TYPE.LEAVE_MEETING,  handleLeaveMeeting)
    socket.getSocket().off("meeting_presenter_change", onPresenterChange)
    if(meetingClient.getRoomInfo()) {
        meetingClient.leave()
    }
})
```

## About Teamlinker
Teamlinker is a cooperation platform that integrates different kind of modules.You can contact your teammates,assign your tasks,start a meeting,schedule your events,manage your files and so on with Teamlinker.
