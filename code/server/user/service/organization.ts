import {ICommon_Model_Organization_User, organizationUserModel} from "../../../common/model/organization_user";
import {Entity} from "../../common/entity/entity";
import {EServer_Common_Event_Types} from "../../common/event/types";
import rpcCooperationApi from "../../cooperation/rpc/cooperation";
import {
    ECommon_Model_Organization_Member_Type,
    ICommon_Model_Organization,
    organizationModel
} from './../../../common/model/organization';
import {memberTagMapper, organizationMapper, organizationUserMapper} from './../mapper/organization';
import {REDIS_USER} from "../../common/cache/keys/user";
import rpcAuthApi from "../../auth/rpc/auth"
import {ECommon_Model_Role_Reserved, ECommon_Model_Role_Type} from "../../../common/model/role";
import organizationApi from "../../../common/routes/organization";
import {ICommon_Model_User} from "../../../common/model/user";
import {Err} from "../../../common/status/error";
import {memberTagModel} from "../../../common/model/member_tag";
import rpcFileApi from "../../file/rpc/file";
import {TeamService} from "./team";
import {UserService} from "./user";

export class OrganizationService extends Entity<typeof organizationModel,typeof organizationMapper> {
    constructor(){
        super(organizationMapper)
    }

    static async list(userId:string) {
        let ret=await organizationMapper.list(userId)
        return ret;
    }

    override async create(): Promise<ICommon_Model_Organization> {
        let ret=await super.create()
        let service=new OrganizationUserService;
        service.assignItem({
            organization_id:ret.id,
            user_id:ret.created_by_pure,
            nickname:"Admin"
        })
        await service.create()
        await Promise.all([
            (async ()=>{
                let adminRole=await rpcAuthApi.getAdminRoleByType(ECommon_Model_Role_Type.ORGANIZATION);
                await rpcAuthApi.addRoleMember(ret.id,adminRole,ECommon_Model_Organization_Member_Type.USER,service.getId())
            })(),
            rpcCooperationApi.initIssueTypeSolution(ret.id),
            (async ()=>{
                let defaultOrganizationRole=await rpcAuthApi.getSystemDefaultRole(ECommon_Model_Role_Type.ORGANIZATION);
                defaultOrganizationRole.organization_id=ret.id
                delete defaultOrganizationRole.id;
                await rpcAuthApi.createRole(defaultOrganizationRole)
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
        ])
        return ret;
    }

    override async delete(eventPublish?: EServer_Common_Event_Types.Types): Promise<void> {
        await super.delete()
        await organizationMapper.clearUser(this.getId());
        await rpcCooperationApi.clearProject(this.getId())
        await rpcCooperationApi.clearIssueType(this.getId())
    }

    static async init(adminIds:string[],userIds:string[]) {
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
            arr.push(organization.addUser(role.admin.id,obj,"www",1))
        }
        arr.push(organization.addUser(role.admin.id,userIds[0],"sx",1))
        for(let i=1;i<userIds.length;i++) {
            arr.push(organization.addUser(role.users[0].id,userIds[i],"user",1))
        }
        await Promise.all(arr)
        return organization.getId();
    }

    async enter(userId:string) {
        let objOrganizationUser=await OrganizationUserService.getItemByExp({
            user_id:userId,
            organization_id:this.getId()
        })
        if(!objOrganizationUser) {
            throw Err.Organization.userNotFound
        }
        let obj=REDIS_USER.organizationInfo(userId);
        await obj.set({
            organizationId:this.getId(),
            organizationUserId:objOrganizationUser.getId()
        },-1);
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
        let ret=await rpcAuthApi.removeRole(roleId);
        return ret;
    }

    async memberInfo(organizationUserId:string):Promise<{
        organizationUser:ICommon_Model_Organization_User,
        user:ICommon_Model_User
    }> {
        let ret=await organizationMapper.memberInfo(organizationUserId);
        return ret;
    }

    async listUser(page:number,size:number,keyword?:string):Promise<typeof organizationApi.routes.listUser.res> {
        let arr=await organizationMapper.listUser(this.getId(),page,size,keyword)
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
        await rpcAuthApi.addRoleMember(this.getId(),roleId,ECommon_Model_Organization_Member_Type.USER,objUser.id )
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
            if(this.getItem().created_by_pure==obj.getItem().user_id) {
                throw Err.Role.roleChangeForbidden
            }
            await rpcAuthApi.changeRoleMember(this.getId(),roleId,ECommon_Model_Organization_Member_Type.USER,objUser.id )
        }
        return objUser
    }

    async removeUser(organizationUserId:string) {
        let objUser=await OrganizationUserService.getItemById(organizationUserId)
        if(!objUser) {
            throw Err.Organization.userNotFound
        }
        await Promise.all([
            objUser.delete(),
            rpcAuthApi.clearMember(organizationUserId),
            TeamService.clearMember(organizationUserId),
            MemberTagService.clearMember(organizationUserId)
        ])
    }

    async listTag() {
        let ret=await memberTagMapper.listTag(this.getId());
        return ret;
    }


}

export class OrganizationUserService extends Entity<typeof organizationUserModel,typeof organizationUserMapper> {
    constructor(){
        super(organizationUserMapper)
    }
    static async organizationUserInfos(organizationUserIds:string,isGetPhoto:boolean=true):Promise<(Omit<ICommon_Model_User,"password"> & {nickname:string,organizationUserId:string})[]>{
        if(!organizationUserIds) {
            throw Err.Organization.userNotFound
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

}


export class MemberTagService extends Entity<typeof memberTagModel,typeof memberTagMapper> {
    constructor(){
        super(memberTagMapper)
    }

    override async delete(eventPublish?: EServer_Common_Event_Types.Types): Promise<void> {
        await super.delete(eventPublish);
        await memberTagMapper.clearMemberByTagId(this.getId());
        await rpcAuthApi.clearRoleByItemId(this.getId());
    }

    async listTagMember() {
        let ret=await memberTagMapper.listTagMember(this.getId());
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

