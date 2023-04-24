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
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {ECommon_IM_Message_EntityType} from "../../../../../../common/model/im_unread_message";
import {ECommon_IM_Message_ContentType} from "../../../../../../common/model/im_user_message";

export const useDesktopStore=defineStore("desktop",{
    state:()=>({
        organizationInfo:null as DCSType<ICommon_Model_Organization>,
        organizationList:null as DCSType<ICommon_Route_Res_Organization_List>,
        organizationPermission:0,
        appList:[
            iconSetting,
            iconCalendar,
            iconMeeting,
            iconProject,
            iconPeople,
            iconWiki,
            iconIM,
            iconTeam
        ] as Icon[],
        userInfo:{} as DCSType<Omit<ICommon_Model_User,"password">>
    }),
    actions:{
        async getOrganizationList() {
            let ret=await apiOrganization.list()
            if(ret && ret.code==0) {
                this.organizationList=ret.data;
            }
        },
        async enterOrganization  (organizationId:string){
            let retEnter=await apiOrganization.enter({
                organizationId
            });
            if(retEnter?.code==0) {
                let myOrganizationUserId=retEnter.data.organizationUserId
                SessionStorage.set("organizationUserId",retEnter.data.organizationUserId)
                SocketIOClient.getSocket(ECommon_Socket_Type.CALENDAR)?.close()
                await Promise.all([
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
                        }
                    })()
                ])
                let objSocketCalendar=SocketIOClient.create(ECommon_Socket_Type.CALENDAR)
                objSocketCalendar.getSocket().on("calendar_event_reminder",(id, name, start_time) => {
                    NotificationWrapper.show("Calendar Event Reminder",`${name} will start in ${Math.floor((start_time-Date.now())/1000/60)} minutes`,NotificationType.CALENDAR,null,null,60000)
                })
                SocketIOClient.getSocket(ECommon_Socket_Type.IM)?.close()
                let objSocketIM=SocketIOClient.create(ECommon_Socket_Type.IM)
                objSocketIM.getSocket().on("im_user_relay_text_message",(fromOrganizationUserId, toOrganizationUserId, content,date) => {
                    if(myOrganizationUserId!==fromOrganizationUserId) {
                        NotificationWrapper.show("IM User Message",content.substring(0,20),NotificationType.IM,null,null,3000)
                    }
                    eventBus.emit(EClient_EVENTBUS_TYPE.RECEIVE_IM_MESSAGE,ECommon_IM_Message_EntityType.USER,fromOrganizationUserId,content,ECommon_IM_Message_ContentType.TEXT,date,toOrganizationUserId)
                })
                objSocketIM.getSocket().on("im_team_relay_text_message",(organizationUserId, teamId, content,date) => {
                    if(myOrganizationUserId!==organizationUserId) {
                        NotificationWrapper.show("IM Team Message",content.substring(0,20),NotificationType.IM,null,null,3000)
                    }
                    eventBus.emit(EClient_EVENTBUS_TYPE.RECEIVE_IM_MESSAGE,ECommon_IM_Message_EntityType.TEAM,organizationUserId,content,ECommon_IM_Message_ContentType.TEXT,date,null,teamId)
                })
            }
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