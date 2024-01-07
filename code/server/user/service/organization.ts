import {ICommon_Model_Organization_User, organizationUserModel} from "../../../common/model/organization_user";
import {Entity} from "../../common/entity/entity";
import rpcCooperationApi from "../../cooperation/rpc/cooperation";
import {
    ECommon_Model_Organization_Member_Type,
    ICommon_Model_Organization,
    organizationModel
} from './../../../common/model/organization';
import {memberTagMapper, organizationMapper, organizationUserMapper} from './../mapper/organization';
import {REDIS_USER} from "../../common/cache/keys/user";
import rpcAuthApi from "../../auth/rpc/auth"
import rpcIMApi from "../../im/rpc/im"
import rpcFinderApi from "../../finder/rpc/finder"
import {ECommon_Model_Role_Reserved, ECommon_Model_Role_Type} from "../../../common/model/role";
import organizationApi from "../../../common/routes/organization";
import {ICommon_Model_User} from "../../../common/model/user";
import {Err} from "../../../common/status/error";
import {memberTagModel} from "../../../common/model/member_tag";
import rpcFileApi from "../../file/rpc/file";
import rpcCalendarApi from "../../calendar/rpc/calendar";
import rpcMeetingApi from "../../meeting/rpc/meeting";
import {TeamService} from "./team";
import {UserService} from "./user";
import {ECommon_Calendar_Color} from "../../../common/model/calendar";
import {IServer_Common_Event_Types} from "../../common/event/types";
import {ECommon_Application_Mode, ECommon_Platform_Type, ECommon_User_Online_Status} from "../../../common/types";
import {REDIS_ORGANIZATION} from "../../common/cache/keys/organization";
import {emitServiceEvent} from "../../common/event/event";
import {ECommon_Model_Meeting_Room_Type} from "../../../common/model/meeting_room";
import CommonUtil from "../../common/util/common";
import rpcWikiApi from "../../wiki/rpc/wiki"
import {ICommon_Route_Res_Organization_Statics} from "../../../common/routes/response";
import rpcNotificationApi from "../../notification/rpc/notification"
import {getSocketEmitterInstance} from "../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../common/socket/types";
import rpcContentApi from "../../content/rpc/content"
import Application from "../../common/app/app";
import * as i18next from "i18next";
import {ECommon_Model_Project_Issue_Priority} from "../../../common/model/project_issue";
import {ECommon_Model_Content_Type} from "../../../common/model/content";
import {ICommon_Model_Issue_Type_Solution} from "../../../common/model/issue_type_solution";
import {ICommon_Model_Issue_Type} from "../../../common/model/issue_type";

export class OrganizationService extends Entity<typeof organizationModel,typeof organizationMapper> {
    constructor(){
        super(organizationMapper)
    }

    async statics():Promise<ICommon_Route_Res_Organization_Statics> {
        let objRedis=REDIS_ORGANIZATION.statics(this.getId())
        let value=await objRedis.get()
        if(!value) {
            value=await organizationMapper.statics(this.getId())
            await objRedis.set(value)
        }
        return value
    }

    static async list(userId:string) {
        let ret=await organizationMapper.list(userId)
        return ret;
    }

    async createExampleData(lang:string,organizationUserId:string,organizationId:string,issueTypeInfo:{
        solution:ICommon_Model_Issue_Type_Solution,
        issueTypeMap:{
            [type in "task"|"bug"|"ticket"]:ICommon_Model_Issue_Type
        }
    }) {
        let t=i18next.getFixedT(lang)
        let objProject=await rpcCooperationApi.createProject(t("backend.newProject"),t("backend.newProject"),organizationUserId,organizationId,issueTypeInfo.solution.id)
        let projectAdminRole=await rpcAuthApi.getAdminRoleByType(ECommon_Model_Role_Type.PROJECT)
        await Promise.all([
            rpcAuthApi.addRoleMember(objProject.id,projectAdminRole,ECommon_Model_Organization_Member_Type.DEFAULT),
            rpcCooperationApi.createIssue(objProject.id,issueTypeInfo.issueTypeMap.task.id,t("backend.newTask"),ECommon_Model_Project_Issue_Priority.MEDIUM,organizationUserId),
            rpcCooperationApi.createIssue(objProject.id,issueTypeInfo.issueTypeMap.bug.id,t("backend.newBug"),ECommon_Model_Project_Issue_Priority.MEDIUM, organizationUserId),
            rpcCooperationApi.createIssue(objProject.id,issueTypeInfo.issueTypeMap.ticket.id,t("backend.newTicket"),ECommon_Model_Project_Issue_Priority.MEDIUM, organizationUserId)
        ])
        let objWikiSpace=await rpcWikiApi.createWikiSpace(t("backend.newWikiSpace"),organizationUserId,organizationId)
        let wikiSpaceAdminRole=await rpcAuthApi.getAdminRoleByType(ECommon_Model_Role_Type.WIKI)
        await Promise.all([
            rpcAuthApi.addRoleMember(objWikiSpace.id,wikiSpaceAdminRole,ECommon_Model_Organization_Member_Type.DEFAULT),
            (async ()=>{
                let obj=await rpcWikiApi.createWiki(objWikiSpace.id,null,t("backend.newWiki"),organizationUserId)
                await rpcContentApi.save(obj.id,ECommon_Model_Content_Type.WIKI_ITEM, organizationUserId,JSON.stringify([{"arr":[{"value":t("backend.newWikiContent"),"type":0}]}]))
            })()
        ])
    }

    override async create(): Promise<ICommon_Model_Organization> {
        let ret=await super.create()
        await Promise.all([
            (async ()=>{
                let adminRole=await rpcAuthApi.getAdminRoleByType(ECommon_Model_Role_Type.ORGANIZATION);
                let objUser=await this.addUser(adminRole,ret.created_by_pure,"Admin",1)
                let objRedis=REDIS_USER.info(this.item.created_by_pure)
                let obj=await objRedis.get()
                let info=await rpcCooperationApi.initIssueTypeSolution(ret.id,obj?.lang??"en")
                await this.createExampleData(obj?.lang??"en",objUser.id,ret.id,info)
            })(),
            (async ()=>{
                let defaultOrganizationRole=await rpcAuthApi.getSystemDefaultRole(ECommon_Model_Role_Type.ORGANIZATION);
                defaultOrganizationRole.organization_id=ret.id
                delete defaultOrganizationRole.id;
                let role=await rpcAuthApi.createRole(defaultOrganizationRole)
                let deletedUser=await UserService.getDeletedUser()
                await this.addUser(role.id,deletedUser.id,"deleted",0)
            })(),
            (async ()=>{
                let defaultProjectRole=await rpcAuthApi.getSystemDefaultRole(ECommon_Model_Role_Type.PROJECT);
                defaultProjectRole.organization_id=ret.id
                delete defaultProjectRole.id
                await rpcAuthApi.createRole(defaultProjectRole)
            })(),
            (async ()=>{
                let defaultTeamRole=await rpcAuthApi.getSystemDefaultRole(ECommon_Model_Role_Type.TEAM);
                defaultTeamRole.organization_id=ret.id
                delete defaultTeamRole.id
                await rpcAuthApi.createRole(defaultTeamRole)
            })(),
            (async ()=>{
                let defaultWikiRole=await rpcAuthApi.getSystemDefaultRole(ECommon_Model_Role_Type.WIKI);
                defaultWikiRole.organization_id=ret.id
                delete defaultWikiRole.id
                await rpcAuthApi.createRole(defaultWikiRole)
            })(),
        ])
        return ret;
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types): Promise<void> {
        await super.delete()
        await this.clearData()
        let emit=getSocketEmitterInstance().of("/"+ECommon_Socket_Type.IM)
        emit.to(this.getId()).emit("im_organization_quit",this.getId())
    }
    async clearData() {
        await Promise.allSettled([
            this.clearUser(),
            this.clearTeam(),
            rpcCooperationApi.clearProject(this.getId()),
            rpcCooperationApi.clearIssueTypeSolution(this.getId()),
            rpcWikiApi.clearWiki(this.getId()),
            rpcCalendarApi.clearCalendarByOrganizationId(this.getId()),
            rpcMeetingApi.clearMeetingRoomByOrganizationId(this.getId()),
            rpcIMApi.clearByOrganizationId(this.getId()),
            rpcFinderApi.clearByOrganizationId(this.getId()),
            rpcNotificationApi.clearByOrganizationId(this.getId()),
            rpcAuthApi.clearByOrganizationId(this.getId())
        ])
    }

    async clearUser() {
        await organizationMapper.clearUser(this.getId())
        await rpcAuthApi.clearRoleByItemId(this.getId())
    }

    async clearTeam() {
        let ids=await organizationMapper.clearTeam(this.getId())
        await rpcAuthApi.clearRoleByItemIds(ids)
    }

    static async init(adminIds:string[],userIds:string[],deletedUserId:string) {
        let organization=new OrganizationService()
        organization.assignItem({
            name:"default",
            created_by_pure:adminIds[0]
        })
        await organization.create();
        let arrAdmin=adminIds.splice(1);
        let role=await rpcAuthApi.listRole(organization.getId(),ECommon_Model_Role_Type.ORGANIZATION);
        let arr=[];
        for(let obj of arrAdmin) {
            arr.push(organization.addUser(role.admin.id,obj,"admin",1))
        }
        for(let i=0;i<userIds.length;i++) {
            arr.push(organization.addUser(role.users[0].id,userIds[i],"user",1))
        }
        arr.push(organization.addUser(role.users[0].id,deletedUserId,"deleted",0))
        await Promise.all(arr)
        return organization.getId();
    }

    async enter(platform:ECommon_Platform_Type,userId:string,preOrganizationUserId?:string) {
        if(preOrganizationUserId) {
            let obj=await OrganizationUserService.getItemById(preOrganizationUserId)
            if(obj) {
                await obj.clearStatus();
            }
        }
        let objOrganizationUser=await OrganizationUserService.getItemByExp({
            user_id:userId,
            organization_id:this.getId()
        })
        if(!objOrganizationUser) {
            throw Err.Organization.userNotFound
        }
        let obj=REDIS_USER.organizationInfo(platform,userId);
        await obj.set({
            organizationId:this.getId(),
            organizationUserId:objOrganizationUser.getId()
        });
        let objRedis=REDIS_USER.userPlatformList(userId)
        let platformList=await objRedis.get()
        let count=await objOrganizationUser.getPlatformUserCount(platformList)
        if(count==0) {
            await objOrganizationUser.changeOnlineStatus(ECommon_User_Online_Status.ONLINE)
        }
        return objOrganizationUser.getId()
    }

    async listRole(){
        let ret=await rpcAuthApi.listRole(this.getId(),ECommon_Model_Role_Type.ORGANIZATION);
        return ret;
    }

    async createRole(name :string,
                     description:string,
                     value:number){
        let ret=await rpcAuthApi.createRole({
            name,
            description,
            organization_id:this.getId(),
            type:ECommon_Model_Role_Type.ORGANIZATION,
            reserved:ECommon_Model_Role_Reserved.NORMAL,
            value:value
        });
        return ret;
    }

    async editRole(roleId:string,name:string,description:string,value:number){
        let ret=await rpcAuthApi.updateRole({
            id:roleId,
            name,
            description,
            value:value
        });
        return ret;
    }

    async removeRole(roleId:string){
        await rpcAuthApi.removeRole(roleId);
    }

    async memberInfo(organizationUserId:string):Promise<{
        organizationUser:ICommon_Model_Organization_User,
        user:ICommon_Model_User
    }> {
        let ret=await organizationMapper.memberInfo(organizationUserId);
        return ret;
    }

    async listUser(page:number,size:number,keyword?:string,organizationUserIds?:string[]):Promise<typeof organizationApi.routes.listUser.res> {
        let arr=await organizationMapper.listUser(this.getId(),page,size,keyword,organizationUserIds)
        let users=arr.data.map(item=>{
            return {
                itemId:item.organizationUser.organization_id,
                memberId:item.organizationUser.id
            }
        })
        let retRoles=await rpcAuthApi.getRolesByMemberIds(users);
        let retTags=await memberTagMapper.getTagsByOrganizationUserIds(users.map(item=>item.memberId))
        let ret=arr.data.map((item,index)=>{
            return {
                ...item,
                role:retRoles[index].role,
                tag:retTags[index]
            }
        })
        return {
            totalPage:arr.totalPage,
            count:arr.count,
            data:ret
        }
    }

    async addUser(roleId:string,userId:string,nickname:string,active:number,title?:string,job?:string,email?:string,phone?:string,location?:string,remark?:string) {
        let newUser=new OrganizationUserService;
        newUser.assignItem({
            organization_id:this.getId(),
            nickname,
            active,
            department: title,
            job,
            email,
            phone,
            location,
            remark,
            user_id:userId
        })
        let objUser=await newUser.create();
        await Promise.all([
            rpcAuthApi.addRoleMember(this.getId(),roleId,ECommon_Model_Organization_Member_Type.USER,objUser.id ),
            rpcCalendarApi.addCalendar(objUser.id,"default",ECommon_Calendar_Color.BLUE, 1,this.getId()),
            rpcMeetingApi.addMeetingRoom(this.getId(),`${nickname}'s room`,ECommon_Model_Meeting_Room_Type.PRIVATE, objUser.id,CommonUtil.generateRandomNumbers(6),objUser.id)
        ])
        emitServiceEvent("organizationUserAdd",this.getId(),objUser.id)
        return objUser
    }

    async updateUser(roleId:string,organizationUserId:string,nickname?:string,active?:number,department?:string,job?:string,email?:string,phone?:string,location?:string,remark?:string) {
        let obj=await OrganizationUserService.getItemById(organizationUserId)
        if(!obj) {
            throw Err.Organization.userNotFound
        }
        obj.assignItem({
            nickname,
            active,
            department,
            job,
            email,
            phone,
            location,
            remark
        })
        let objUser=await obj.update();
        if(roleId) {
            await rpcAuthApi.changeRoleMember(this.getId(),roleId,ECommon_Model_Organization_Member_Type.USER,objUser.id )
        }
        emitServiceEvent("organizationUserEdit",this.getId(),objUser.id)
        return objUser
    }

    async removeUser(organizationUserId:string) {
        let objUser=await OrganizationUserService.getItemById(organizationUserId)
        if(!objUser) {
            throw Err.Organization.userNotFound
        }
        let deletedUser=await UserService.getDeletedUser()
        let objOrganizationDeletedUser=await OrganizationUserService.getItemByExp({
            organization_id:this.getId(),
            user_id:deletedUser.id
        })
        await Promise.all([
            objUser.delete(),
            TeamService.clearMember(organizationUserId),
            MemberTagService.clearMember(organizationUserId),
            rpcCalendarApi.clearCalendar(organizationUserId),
            rpcMeetingApi.clearMeetingRoom(organizationUserId),
            rpcIMApi.clearByOrganizationUserId(organizationUserId,objOrganizationDeletedUser.getId()),
            rpcFinderApi.clearByOrganizationAndUserId(objUser.getItem().organization_id,objUser.getItem().user_id),
            rpcAuthApi.clearMember(organizationUserId),
            rpcContentApi.updateUserInfo(this.getId(),objUser.getId(),objUser.getItem().user_id,objOrganizationDeletedUser.getItem()),
            rpcCooperationApi.clearMember(organizationUserId),
            rpcWikiApi.clearMember(organizationUserId),
            Application.mode===ECommon_Application_Mode.OFFLINE?rpcFileApi.clearMember(objUser.getItem().user_id):null,
            rpcNotificationApi.clearMember(organizationUserId)
        ])
        emitServiceEvent("organizationUserDelete",this.getId(),organizationUserId)
        let emit=getSocketEmitterInstance().of("/"+ECommon_Socket_Type.IM)
        emit.to(objUser.getId()).emit("im_organization_quit",this.getId())
    }

    async listTag(keyword?:string) {
        let ret=await memberTagMapper.listTag(this.getId(),keyword);
        return ret;
    }



}

export class OrganizationUserService extends Entity<typeof organizationUserModel,typeof organizationUserMapper> {
    constructor(){
        super(organizationUserMapper)
    }


    async clearCache() {
        let objStatusKey=REDIS_ORGANIZATION.status(this.getId())
        objStatusKey.del()
        let objPreStatusKey=REDIS_ORGANIZATION.preStatus(this.getId())
        objPreStatusKey.del()
        let objMeeting=REDIS_ORGANIZATION.meetingId(this.getId())
        objMeeting.del()
        let objTeamList=REDIS_ORGANIZATION.teamList(this.getId())
        objTeamList.del()
        let objOrganization=REDIS_USER.organizationInfo(ECommon_Platform_Type.WEB,this.getItem().user_id)
        objOrganization.del()
        objOrganization=REDIS_USER.organizationInfo(ECommon_Platform_Type.MOBILE, this.getItem().user_id)
        objOrganization.del()
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types): Promise<void> {
        await super.delete(eventPublish);
        await rpcAuthApi.clearMember(this.getId())
        await this.clearCache()
    }

    static async organizationUserInfos(organizationUserIds:string,isGetPhoto:boolean=true,isGetStatus:boolean=false):Promise<(Omit<ICommon_Model_User,"password"> & {nickname:string,organizationUserId:string,status?:ECommon_User_Online_Status})[]>{
        if(!organizationUserIds) {
            return []
        }
        let ret=await organizationUserMapper.users(organizationUserIds.split(","))
        let arr=[]
        for(let obj of ret) {
            delete obj.password;
            if(obj.photo && isGetPhoto) {
                arr.push(rpcFileApi.getPath(obj.photo).then(value => {
                    obj.photo=value
                }))
            }
            if(isGetStatus) {
                arr.push((async ()=>{
                    let sessionStatus=REDIS_ORGANIZATION.status(obj.organizationUserId)
                    let status=await sessionStatus.get()
                    if(status===null) {
                        status=ECommon_User_Online_Status.OFFLINE
                    }
                    Object.assign(obj,obj,{status:status})
                })())
            }
        }
        await Promise.all(arr);
        return ret;
    }

    async info() {
        let user=await UserService.getItemById(this.getItem().user_id)
        if(!user) {
            throw Err.User.userNotFound
        }
        let teamList=await user.teamList(this.getId(),this.getItem().organization_id)
        return {
            teamList:teamList.manage.concat(teamList.join).slice(0,10),
            organizationUser:this.getItem(),
            user:user.getItem()
        }
    }

    async filterAvailableUserAndTeam(keyword:string) {
        let [userList,teamList]=await Promise.all([
            organizationMapper.filterUser(this.getItem().organization_id,10,keyword),
            TeamService.filterAvailable(this.getId(),keyword,10)
        ])
        return {
            users:userList.map(item=>{
                return {
                    id:item.organizationUser.id,
                    name:item.organizationUser.nickname,
                    photo:item.user.photo
                }
            }),
            teams:teamList
        }
    }

    async changeOnlineStatus(status:ECommon_User_Online_Status) {
        let sessionStatus=REDIS_ORGANIZATION.status(this.getId())
        let preStatus=await sessionStatus.get()
        if(preStatus===null) {
            preStatus=ECommon_User_Online_Status.OFFLINE
        }
        let preSessionStatus=REDIS_ORGANIZATION.preStatus(this.getId())
        await preSessionStatus.set(preStatus)
        await sessionStatus.set(status)
        emitServiceEvent("organizationUserStatusChange",this.getItem().organization_id,this.getId(),status)
        return preStatus
    }

    async getOnlineStatus() {
        let sessionStatus=REDIS_ORGANIZATION.status(this.getId())
        let status=await sessionStatus.get()
        if(status===null) {
            status=ECommon_User_Online_Status.OFFLINE
        }
        return status
    }

    static async getOnlineStatusList(organizationUserIds:string[]) {
        let arr:Promise<ECommon_User_Online_Status>[]=[]
        for(let id of organizationUserIds) {
            arr.push((async ()=>{
                let sessionStatus=REDIS_ORGANIZATION.status(id)
                let status=await sessionStatus.get()
                if(status===null) {
                    status=ECommon_User_Online_Status.OFFLINE
                }
                return status
            })())
        }
        let ret=await Promise.all(arr)
        return ret;
    }

    async endMeetingStatus() {
        let sessionStatus=REDIS_ORGANIZATION.status(this.getId())
        let status=await sessionStatus.get()
        let preSessionStatus=REDIS_ORGANIZATION.preStatus(this.getId())
        let preStatus=await preSessionStatus.get()
        await sessionStatus.set(preStatus)
        await preSessionStatus.set(status)
        let objMeetingId=REDIS_ORGANIZATION.meetingId(this.getId())
        await objMeetingId.del()
        emitServiceEvent("organizationUserStatusChange",this.getItem().organization_id,this.getId(),preStatus)
    }

    async startMeetingStatus(meetingId:string) {
        await this.changeOnlineStatus(ECommon_User_Online_Status.MEETING)
        let objRedis=REDIS_ORGANIZATION.meetingId(this.getId())
        await objRedis.set(meetingId)
    }

    async getMeetingId() {
        let objRedis=REDIS_ORGANIZATION.meetingId(this.getId())
        let ret=await objRedis.get()
        return ret;
    }

    async clearStatus(platformList?:ECommon_Platform_Type[]) {
        if(platformList===undefined) {
            let objRedis=REDIS_USER.userPlatformList(this.item.user_id)
            platformList=await objRedis.get()
        }
        let count=await this.getPlatformUserCount(platformList)
        if(count<=1) {
            let sessionStatus=REDIS_ORGANIZATION.status(this.getId())
            await sessionStatus.del()
            let preSessionStatus=REDIS_ORGANIZATION.preStatus(this.getId())
            await preSessionStatus.del()
        }
    }

    async getPlatformUserCount(platformList:ECommon_Platform_Type[]) {
        if(!platformList) {
            return 0;
        }
        let count=0
        let organizationInfoList=await Promise.all(platformList.map(item=>{
            let redis=REDIS_USER.organizationInfo(item,this.item.user_id)
            return redis.get()
        }))
        for(let obj of organizationInfoList) {
            if(obj?.organizationId===this.getId()) {
                count++
            }
        }
        return count
    }
}


export class MemberTagService extends Entity<typeof memberTagModel,typeof memberTagMapper> {
    constructor(){
        super(memberTagMapper)
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types): Promise<void> {
        await super.delete(eventPublish);
        await memberTagMapper.clearMemberByTagId(this.getId());
        await rpcAuthApi.clearRoleByItemId(this.getId());
    }

    async listTagMember() {
        let ret=await memberTagMapper.listTagMember(this.getId());
        return ret;
    }

    static async listMemberTag(memberId:string) {
        let ret=await memberTagMapper.listMemberTag(memberId)
        return ret;
    }

    async addTagMember(organizationUserId:string) {
        let ret=await memberTagMapper.addTagMember(this.getId(),organizationUserId)
        return ret;
    }

    async removeTagMember(organizationUserId:string) {
        await memberTagMapper.removeTagMember(this.getId(),organizationUserId);
    }

    static async setTagMember(memberTagIds:string,organizationUserId:string) {
        let arrMemberId=!memberTagIds?[]:memberTagIds.split(",")
        let arr=await memberTagMapper.getTagsByOrganizationUserId(organizationUserId);
        let arrCurrent=arr.map(item=>item.id);
        let arrAdd:string[]=[],arrRemove:string[]=[]
        arrAdd=arrMemberId.filter(item=>!arrCurrent.includes(item))
        arrRemove= arrCurrent.filter(item=>!arrMemberId.includes(item))
        let arrPromise=[]
        for(let id of arrAdd) {
            arrPromise.push(memberTagMapper.addTagMember(id,organizationUserId))
        }
        for(let id of arrRemove) {
            arrPromise.push(memberTagMapper.removeTagMember(id,organizationUserId))
        }
        await Promise.all(arrPromise);
    }

    static async clearMember(organizationUserId:string) {
        await memberTagMapper.clearMemberByMemberId(organizationUserId)
    }

}

