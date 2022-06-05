import { ECommon_Model_Project_Member_Type } from '../../../common/model/project_member';
import { ECommon_Model_Role_Memeber_Type } from '../../../common/model/role_member';
import { ICommon_Route_Res_Team_List } from '../../../common/routes/response';
import { Err } from '../../../common/status/error';
import { Entity } from "../../common/entity/entity";
import { teamMapper } from '../mapper/team';
import rpcAuthApi from "../rpc/auth";
import rpcFileApi from "../rpc/file";
import { ECommon_Model_Role_Type, ICommon_Model_Role } from './../../../common/model/role';
import { teamModel } from './../../../common/model/team';
export default class Team extends Entity<typeof teamModel,typeof teamMapper> {
    constructor(){
        super(teamMapper)
    }

    async getRoles():Promise<Pick<ICommon_Model_Role,"id"|"name"|"description">[]>{
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        let ret=await rpcAuthApi.getRolesByItemId(this.item.id,ECommon_Model_Role_Type.TEAM);
        return ret;
    }

    async members():Promise<{
        id:string,
        name:string,
        photo:string,
        role:Pick<ICommon_Model_Role,"id"|"name"|"description">
    }[]>{
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        let arrMemeber=await teamMapper.members(this.item.id);
        let arrRole=await rpcAuthApi.getRolesByMemeberIds(arrMemeber.map(obj=>{
            return {
                itemId:this.item.id,
                memberId:obj.id
            }
        }))
        return arrMemeber.map((item,index) => {
            return {
                ...item,
                role:arrRole[index]
            }
        });
    }

    async addMemeber(userId:string,roleId:string){
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        await teamMapper.addMember(this.item.id,userId)
        await rpcAuthApi.addRole(this.item.id,userId,roleId,ECommon_Model_Role_Memeber_Type.Team,ECommon_Model_Project_Member_Type.USER);
    }

    async removeMemeber(userId:string) {
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        await teamMapper.removeMember(this.item.id,userId)
        await rpcAuthApi.removeRole(this.item.id,userId);
    }

    async changeRole(userId:string,roleId:string){
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        await rpcAuthApi.changeRole(this.item.id,userId,roleId)
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

}