import {Entity} from "../../common/entity/entity";
import {ECommon_Model_Notification_Type, notificationModel} from "../../../common/model/notification";
import {notificationMapper} from "../mapper/notification";
import rpcCalendarApi from "../../calendar/rpc/calendar"
import rpcCooperationApi from "../../cooperation/rpc/cooperation"
import rpcUserApi from "../../user/rpc/user"
import wikiRpcApi from "../../wiki/rpc/wiki"
import {ICommon_Route_Res_Notification_Item} from "../../../common/routes/response";
import {ICommon_Model_Project_Issue} from "../../../common/model/project_issue";

export class NotificationService extends Entity<typeof notificationModel,typeof notificationMapper> {
    constructor() {
        super(notificationMapper)
    }
    static async list(userId:string,types:ECommon_Model_Notification_Type[],page:number,size:number) {
        let list=await notificationMapper.list(userId,types,page,size)
        let arrPromise=await Promise.allSettled(list.data.map(item=>{
            switch (item.type) {
                case ECommon_Model_Notification_Type.CALENDAR_EVENT_INVITATION:{
                    return rpcCalendarApi.calendarEvent(item.ref_id).then(res=>{
                        return res
                    })
                    break
                }
                case ECommon_Model_Notification_Type.ISSUE_ASSIGNER_ASSIGN:
                case ECommon_Model_Notification_Type.ISSUE_COMMENT_ADD:
                case ECommon_Model_Notification_Type.ISSUE_FIELD_CHANGE:
                case ECommon_Model_Notification_Type.ISSUE_COMMENT_AT:
                case ECommon_Model_Notification_Type.ISSUE_REPORTER_ASSIGN:
                case ECommon_Model_Notification_Type.ISSUE_APPROVAL_RESOLVE:
                case ECommon_Model_Notification_Type.ISSUE_APPROVAL_REJECT:
                case ECommon_Model_Notification_Type.ISSUE_ASSIGN_RELEASE:
                case ECommon_Model_Notification_Type.ISSUE_ASSIGN_SPRINT:
                case ECommon_Model_Notification_Type.ISSUE_WORKFLOW_CHANGE:{
                    let objIssue:ICommon_Model_Project_Issue
                    return rpcCooperationApi.projectIssue(item.ref_id).then(issue=>{
                        objIssue=issue
                        return rpcCooperationApi.project(issue.project_id)
                    }).then(project=>{
                        return {
                            issue:objIssue,
                            project
                        }
                    })
                    break
                }
                case ECommon_Model_Notification_Type.ORGANIZATION_INVITATION:
                case ECommon_Model_Notification_Type.ORGANIZATION_USER_REMOVE:
                case ECommon_Model_Notification_Type.ORGANIZATION_USER_QUIT:
                case ECommon_Model_Notification_Type.ORGANIZATION_USER_ROLE_CHANGE:{
                    return rpcUserApi.organization(item.ref_id).then(res=>{
                        return res
                    })
                    break
                }
                case ECommon_Model_Notification_Type.TEAM_USER_ADD:
                case ECommon_Model_Notification_Type.TEAM_USER_REMOVE:
                case ECommon_Model_Notification_Type.TEAM_USER_ROLE_CHANGE:{
                    return rpcUserApi.team(item.ref_id).then(res=>{
                        return res
                    })
                    break
                }
                case ECommon_Model_Notification_Type.TEAM_USER_QUIT:{
                    break
                }
                case ECommon_Model_Notification_Type.WIKI_ITEM_AT:{
                    return wikiRpcApi.wikiItem(item.ref_id).then(res=>{
                        return res
                    })
                    break
                }
                default:{
                    return null
                }
            }
        }))
        let ret:ICommon_Route_Res_Notification_Item[]=[]
        for(let i=0;i<list.data.length;i++) {
            let objPromise=arrPromise[i]
            ret[i]={
                ...list.data[i],
                data:(objPromise.status==="fulfilled" && objPromise.value)?objPromise.value:undefined
            }
        }
        return ret;
    }

    static async unReadCount(userId:string) {
        let ret=await notificationMapper.unReadCount(userId)
        return ret;
    }

    async info() {
        let obj=await notificationMapper.info(this.getId())
        let data
        switch (obj.type) {
            case ECommon_Model_Notification_Type.CALENDAR_EVENT_INVITATION:{
                data=await rpcCalendarApi.calendarEvent(obj.ref_id).then(res=>{
                    return res
                })
                break
            }
            case ECommon_Model_Notification_Type.ISSUE_ASSIGNER_ASSIGN:
            case ECommon_Model_Notification_Type.ISSUE_COMMENT_ADD:
            case ECommon_Model_Notification_Type.ISSUE_FIELD_CHANGE:
            case ECommon_Model_Notification_Type.ISSUE_COMMENT_AT:
            case ECommon_Model_Notification_Type.ISSUE_REPORTER_ASSIGN:
            case ECommon_Model_Notification_Type.ISSUE_WORKFLOW_CHANGE:{
                let objIssue:ICommon_Model_Project_Issue
                data=await rpcCooperationApi.projectIssue(obj.ref_id).then(issue=>{
                    objIssue=issue
                    return rpcCooperationApi.project(issue.project_id)
                }).then(project=>{
                    return {
                        issue:objIssue,
                        project
                    }
                })
                break
            }
            case ECommon_Model_Notification_Type.ORGANIZATION_INVITATION:
            case ECommon_Model_Notification_Type.ORGANIZATION_USER_REMOVE:
            case ECommon_Model_Notification_Type.ORGANIZATION_USER_QUIT:
            case ECommon_Model_Notification_Type.ORGANIZATION_USER_ROLE_CHANGE:{
                data=await rpcUserApi.organization(obj.ref_id).then(res=>{
                    return res
                })
                break
            }
            case ECommon_Model_Notification_Type.TEAM_USER_ADD:
            case ECommon_Model_Notification_Type.TEAM_USER_REMOVE:
            case ECommon_Model_Notification_Type.TEAM_USER_ROLE_CHANGE:{
                data=await rpcUserApi.team(obj.ref_id).then(res=>{
                    return res
                })
                break
            }
            case ECommon_Model_Notification_Type.TEAM_USER_QUIT:{
                break
            }
            case ECommon_Model_Notification_Type.WIKI_ITEM_AT:{
                data=await wikiRpcApi.wikiItem(obj.ref_id).then(res=>{
                    return res
                })
                break
            }
            default:{
                return null
            }
        }
        let ret={
            ...obj,
            data
        }
        return ret;
    }

    static async clearByOrganizationId(organizationId:string) {
        await notificationMapper.clearByOrganizationId(organizationId)
    }

    static async clearByUserId(userId:string) {
        await notificationMapper.clearByUserId(userId)
    }

    static async clearMember(organizationUserId:string) {
        let objOrganization=await rpcUserApi.organizationUser(organizationUserId)
        let objDeletedUser=await rpcUserApi.getDeletedOrganizationUser(objOrganization.organization_id)
        await notificationMapper.updateMember(organizationUserId,objDeletedUser.id)
    }
}