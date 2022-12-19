import {defineStore} from "pinia";
import {ICommon_Model_Organization} from "../../../../../../common/model/organization";
import {apiOrganization, apiUser, DCSType} from "../../../common/request/request";
import {ICommon_Route_Res_Organization_List} from "../../../../../../common/routes/response";
import {Icon} from "../../../../teamOS/icon/icon";
import {iconSetting} from "../icon/setting";
import {iconCalendar} from "../icon/calendar";
import {iconMeeting} from "../icon/meeting";
import {iconProject} from "../icon/project";
import {iconTeam} from "../icon/team";
import {iconWiki} from "../icon/wiki";
import {iconIM} from "../icon/im";

export const useDesktopStore=defineStore("desktop",{
    state:()=>({
        organizationInfo:null as DCSType<ICommon_Model_Organization>,
        organizationList:null as DCSType<ICommon_Route_Res_Organization_List>,
        appList:[
            iconSetting,
            iconCalendar,
            iconMeeting,
            iconProject,
            iconTeam,
            iconWiki,
            iconIM
        ] as Icon[]
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
                let retOrganization=await apiOrganization.info({
                    organizationId
                })
                if(retOrganization?.code==0) {
                    this.organizationInfo=retOrganization.data
                    sessionStorage.setItem("organizationId",retOrganization.data.id);
                }
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
                return true
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
        }
    }
})