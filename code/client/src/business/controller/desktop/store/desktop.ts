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
                await Promise.all([
                    (async ()=>{
                        let retOrganization=await apiOrganization.info({
                            organizationId
                        })
                        if(retOrganization?.code==0) {
                            this.organizationInfo=retOrganization.data
                            sessionStorage.setItem("organizationId",retOrganization.data.id);
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
            }
        },
        async isAuth():Promise<boolean> {
            if(!sessionStorage.getItem("userToken")) {
                return false
            }
            let ret=await apiUser.refresh();
            if(!ret || ret.code!=0) {
                return false
            } else {
                sessionStorage.setItem("userId",ret.data.id);
                this.userInfo=ret.data;
                return true
            }
        },
        async logout() {
            let res=await apiUser.logout()
            if(res?.code==0) {
                sessionStorage.clear();
                this.$reset();
                return true
            } else {
                return false
            }
        },
        async $update() {
            await this.getOrganizationList();
            let retOrganization=await apiOrganization.info({
                organizationId:sessionStorage.getItem("organizationId")
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