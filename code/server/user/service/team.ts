import {ECommon_Model_Organization_Member_Type} from '../../../common/model/organization';
import {ICommon_Route_Res_Organization_User_List, ICommon_Route_Res_Team_List} from '../../../common/routes/response';
import {Err} from '../../../common/status/error';
import {Entity} from "../../common/entity/entity";
import {teamMapper} from '../mapper/team';
import rpcAuthApi from "../../auth/rpc/auth";
import rpcFileApi from "../../file/rpc/file";
import {ECommon_Model_Role_Reserved, ECommon_Model_Role_Type} from './../../../common/model/role';
import {teamModel} from './../../../common/model/team';
import {OrganizationService} from "./organization";
import {emitServiceEvent} from "../../common/event/event";
import {IServer_Common_Event_Types} from "../../common/event/types";
import rpcNotificationApi from "../../notification/rpc/notification";
import {ECommon_Model_Notification_Type} from "../../../common/model/notification";

export class TeamService extends Entity<typeof teamModel,typeof teamMapper> {
    constructor(){
        super(teamMapper)
    }

    override async create(): Promise<typeof teamModel["model"]> {
        let ret=await super.create();
        let roleId=await rpcAuthApi.getAdminRoleByType(ECommon_Model_Role_Type.TEAM)
        await this.addMember(this.getItem().created_by,roleId);
        return ret;
    }

    async getRoles(){
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        let ret=await rpcAuthApi.listRole(this.getId(),ECommon_Model_Role_Type.TEAM);
        return ret;
    }

    static async getGlobalRoles(organizationId:string) {
        let ret=await rpcAuthApi.listRole(organizationId,ECommon_Model_Role_Type.TEAM);
        return ret;
    }

    async members(page:number,size:number,keyword?:string):Promise<ICommon_Route_Res_Organization_User_List>{
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        let objMember=await teamMapper.members(this.item.id,page,size,keyword);
        let arrRole=await rpcAuthApi.getRolesByMemberIds(objMember.data.map(obj=>{
            return {
                itemId:this.item.id,
                memberId:obj.organizationUser.id
            }
        }))
        return {
            count:objMember.count,
            totalPage:objMember.totalPage,
            data:objMember.data.map((obj,index)=>{
                return {
                    ...obj,
                    role:arrRole[index].role
                }
            })
        }
    }

    async listUser(page:number,size:number,keyword?:string,roleId?:string):Promise<ICommon_Route_Res_Organization_User_List>{
        let ret=await rpcAuthApi.listRoleMember(this.getId(),ECommon_Model_Role_Type.TEAM,ECommon_Model_Organization_Member_Type.USER,page,size,keyword,roleId);
        return {
            count:ret.count,
            totalPage:ret.totalPage,
            data:ret.data.map(item=>{
                return {
                    user:item.user,
                    role:item.role,
                    organizationUser:item.member
                }
            })
        }
    }

    async addMember(memberId:string, roleId:string){
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        await teamMapper.addMember(this.item.id,memberId)
        let objOrganization=await OrganizationService.getItemById(this.item.organization_id);
        if(!objOrganization) {
            throw Err.Organization.organizationNotFound
        }
        let member=await objOrganization.memberInfo(memberId);
        let role = await rpcAuthApi.addRoleMember(this.item.id,roleId,ECommon_Model_Organization_Member_Type.USER,memberId);
        emitServiceEvent("teamUserAdd",this.item.id, memberId)
        return {
            ...member,
            role
        }
    }

    async removeMember(organizationUserId:string) {
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        await teamMapper.removeMember(this.item.id,organizationUserId)
        await rpcAuthApi.removeRoleMember(this.item.id,ECommon_Model_Organization_Member_Type.USER,organizationUserId);
        emitServiceEvent("teamUserDelete",this.item.id,organizationUserId)
    }

    async quit(organizationUserId:string) {
        let [adminRoleId,roles]=await Promise.all([
            rpcAuthApi.getAdminRoleByType(ECommon_Model_Role_Type.TEAM),
            await rpcAuthApi.getRolesByMemberIds([{
                itemId:this.getId(),
                memberId:organizationUserId
            }])
        ])
        await this.removeMember(organizationUserId)
        let count=await teamMapper.getMemberCount(this.getId())
        if(count==0) {
            await this.delete("teamDelete")
            return false
        } else {
            if(roles[0].role.id===adminRoleId) {
                let list=await rpcAuthApi.listRoleMember(this.getId(),ECommon_Model_Role_Type.TEAM, ECommon_Model_Organization_Member_Type.USER,0,10000,null,adminRoleId)
                if(list.data.length==0) {
                    let id=await teamMapper.pickupMember(this.getId())
                    if(id) {
                        await this.changeRole(id,adminRoleId)
                        rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.TEAM_USER_ROLE_CHANGE,this.getId(),id,organizationUserId)
                    }
                }
            }
        }
        return true
    }

    async changeRole(organizationUserId:string,roleId:string){
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        } else if(this.getItem().created_by==organizationUserId) {
            throw Err.Role.roleChangeForbidden
        }
        let objOrganization=await OrganizationService.getItemById(this.item.organization_id);
        if(!objOrganization) {
            throw Err.Organization.organizationNotFound
        }
        let member=await objOrganization.memberInfo(organizationUserId);
        let role=await rpcAuthApi.changeRoleMember(this.item.id,roleId,ECommon_Model_Organization_Member_Type.USER,organizationUserId)
        emitServiceEvent("teamUserEdit",this.item.id,organizationUserId)
        return {
            ...member,
            role
        }
    }

    static async list(organizationId:string,page:number,size:number,keyword?:string):Promise<ICommon_Route_Res_Team_List>{
        let ret=await teamMapper.list(organizationId,page,size,keyword)
        return {
            count:ret.count,
            totalPage:ret.totalPage,
            page:page,
            data:ret.data
        }
    }

    static async filter(organizationId:string,name:string,size:number):Promise<{
        name:string,
        id:string,
        photo:string
    }[]>{
        if(!name) {
            throw Err.User.userNameNotExists
        }
        if(!size) {
            throw Err.Common.paramError
        }
        let ret=await teamMapper.filter(organizationId,name,size);
        let arr=<{
            name:string,
            id:string,
            photo:string
        }[]>[]
        for(let obj of ret) {
            arr.push({
                name:obj.name,
                id:obj.id,
                photo:obj.photo?(await rpcFileApi.getPath(obj.photo)):obj.photo
            })
        }
        return ret;
    }

    static async filterAvailable(organizationUserId:string,name:string,size:number):Promise<{
        name:string,
        id:string,
        photo:string
    }[]>{
        if(!name) {
            throw Err.Team.teamNotFound
        }
        if(!size) {
            throw Err.Common.paramError
        }
        let ret=await teamMapper.filterAvailable(organizationUserId,name,size)
        return ret;
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types): Promise<void> {
        await super.delete(eventPublish);
        await teamMapper.clearMemberByItemId(this.getId());
        await rpcAuthApi.clearRoleByItemId(this.getId())
    }

    async createRole(name :string,
                     description:string,
                     value:number){
        let ret=await rpcAuthApi.createRole({
            name,
            description,
            item_id:this.getId(),
            organization_id:this.getId(),
            type:ECommon_Model_Role_Type.TEAM,
            reserved:ECommon_Model_Role_Reserved.NORMAL,
            value:value
        });
        return ret;
    }

    static async createGlobalRole(organizationId:string,name :string, description:string, value:number) {
        let ret=await rpcAuthApi.createRole({
            name,
            description,
            organization_id:organizationId,
            type:ECommon_Model_Role_Type.TEAM,
            reserved:ECommon_Model_Role_Reserved.NORMAL,
            value
        })
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

    static async clearMember(organizationUserId:string) {
        await teamMapper.clearMemberByMemberId(organizationUserId);
        await rpcAuthApi.clearMember(organizationUserId)
    }

    static async infos(teamIds:string[]) {
        let ret=await teamMapper.infos(teamIds)
        return ret;
    }
}