import {defineStore} from "pinia";
import {ICommon_Model_Organization} from "../../../../../../common/model/organization";
import {apiOrganization, apiUser, DCSType} from "../../../common/request/request";
import {ICommon_Route_Res_Organization_List} from "../../../../../../common/routes/response";
import {Icon} from "../../../../teamOS/icon/icon";
import {iconSetting} from "../icon/setting";
import {iconCalendar} from "../icon/calendar";
import {iconMeeting} from "../icon/meeting";
import {iconProject} from "../icon/project";
import {iconPeople} from "../icon/people";
import {iconWiki} from "../icon/wiki";
import {iconIM} from "../icon/im";
import {ICommon_Model_User} from "../../../../../../common/model/user";
import {iconTeam} from "../icon/team";
import {SocketIOClient} from "../../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../../../../common/socket/types";
import {NotificationType, NotificationWrapper} from "../../../common/component/notification/notification";
import {SessionStorage} from "../../../common/storage/session";
import {handleIMEvent} from "../../app/im/event";
import {ECommon_User_Online_Status} from "../../../../../../common/types";
import {handleMeetingEvent} from "../../app/meeting/event";
import {checkPermission} from "../../../common/util/helper";
import {Permission_Types} from "../../../../../../common/permission/permission";

export const useDesktopStore=defineStore("desktop",{
    state:()=>({
        organizationInfo:null as DCSType<ICommon_Model_Organization>,
        organizationList:null as DCSType<ICommon_Route_Res_Organization_List>,
        organizationPermission:0,
        appList:[
            iconCalendar,
            iconMeeting,
            iconProject,
            iconPeople,
            iconWiki,
            iconIM,
            iconTeam
        ] as Icon[],
        userInfo:{} as DCSType<Omit<ICommon_Model_User,"password">>,
        status:ECommon_User_Online_Status.OFFLINE,
        heartbeatInterval:null
    }),
    actions:{
        async getOrganizationList() {
            let ret=await apiOrganization.list()
            if(ret && ret.code==0) {
                this.organizationList=ret.data;
            }
        },
        async requestStatus() {
            let ret=await apiOrganization.getUserStatus({})
            if(ret?.code==0) {
                this.status=ret.data.status
            }
        },
        async enterOrganization  (organizationId:string){
            let retEnter=await apiOrganization.enter({
                organizationId
            });
            if(retEnter?.code==0) {
                SessionStorage.set("organizationUserId",retEnter.data.organizationUserId)
                await this.initOrganization(organizationId)
            }
        },
        async initOrganization(organizationId:string) {
            SocketIOClient.getSocket(ECommon_Socket_Type.CALENDAR)?.close()
            await Promise.all([
                this.requestStatus(),
                (async ()=>{
                    let retOrganization=await apiOrganization.info({
                        organizationId
                    })
                    if(retOrganization?.code==0) {
                        this.organizationInfo=retOrganization.data
                        SessionStorage.set("organizationId",retOrganization.data.id);
                    }
                })(),
                (async ()=>{
                    let ret=await apiOrganization.getPermission({
                        organizationId
                    })
                    if(ret?.code==0) {
                        this.organizationPermission=ret.data.value
                        if(checkPermission(this.organizationPermission,Permission_Types.Organization.ADMIN)) {
                            if(!this.appList.includes(iconSetting)) {
                                this.appList.push(iconSetting)
                            }
                        }
                    }
                })()
            ])
            SocketIOClient.getSocket(ECommon_Socket_Type.CALENDAR)?.close()
            let objSocketCalendar=SocketIOClient.create(ECommon_Socket_Type.CALENDAR)
            objSocketCalendar.getSocket().on("calendar_event_reminder",(id, name, start_time) => {
                if(this.status===ECommon_User_Online_Status.ONLINE) {
                    NotificationWrapper.show("Calendar Event Reminder",`${name} will start in ${Math.floor((start_time-Date.now())/1000/60)} minutes`,NotificationType.CALENDAR,null,null,60000)
                }
            })
            SocketIOClient.getSocket(ECommon_Socket_Type.IM)?.close()
            let objSocketIM=SocketIOClient.create(ECommon_Socket_Type.IM)
            handleIMEvent(objSocketIM.getSocket(),this.status)
            if(this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval)
            }
            this.heartbeatInterval=setInterval(()=>{
                objSocketIM.getSocket().emit("im_heartbeat")
            },1000*60*20)
            SocketIOClient.getSocket(ECommon_Socket_Type.MEETING)?.close()
            let objSocketMeeting=SocketIOClient.create(ECommon_Socket_Type.MEETING)
            handleMeetingEvent(objSocketMeeting.getSocket())
        },
        async isAuth():Promise<boolean> {
            if(!SessionStorage.get("userToken")) {
                return false
            }
            let ret=await apiUser.refresh();
            if(!ret || ret.code!=0) {
                return false
            } else {
                SessionStorage.set("userId",ret.data.id);
                this.userInfo=ret.data;
                return true
            }
        },
        async logout() {
            let res=await apiUser.logout()
            if(res?.code==0) {
                SessionStorage.clear();
                SocketIOClient.clear()
                clearInterval(this.heartbeatInterval)
                this.heartbeatInterval=null;
                this.$reset();
                return true
            } else {
                return false
            }
        },
        async $update() {
            await this.getOrganizationList();
            let retOrganization=await apiOrganization.info({
                organizationId:SessionStorage.get("organizationId")
            })
            if(retOrganization?.code==0) {
                this.organizationInfo=retOrganization.data
            }
        },
        async $refreshUser() {
            await this.isAuth();
        }
    }
})