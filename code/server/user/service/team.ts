import { ICommon_Model_Team_Role } from '../../../common/model/team_role';
import { ICommon_Route_Res_Team_List } from '../../../common/routes/response';
import { Err } from '../../../common/status/error';
import { Entity } from "../../common/entity/entity";
import { teamMapper } from '../mapper/team';
import rpcFileApi from "../rpc/file";
import { teamModel } from './../../../common/model/team';
export default class Team extends Entity<typeof teamModel,typeof teamMapper> {
    constructor(){
        super(teamMapper)
    }

    async getRoles():Promise<ICommon_Model_Team_Role[]>{
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        let ret=await teamMapper.getRoles(this.item.id);
        return ret;
    }

    async members():Promise<{
        id:string,
        name:string,
        photo:string,
        role:Omit<ICommon_Model_Team_Role,"team_id">
    }[]>{
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        let ret=await teamMapper.members(this.item.id);
        return ret;
    }

    async addMemeber(userId:string,roleId:string){
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        await teamMapper.addMember(this.item.id,userId,roleId)
    }

    async removeMemeber(userId:string) {
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        await teamMapper.removeMember(this.item.id,userId)
    }

    async changeRole(userId:string,roleId:string){
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        await teamMapper.changeRole(this.item.id,userId,roleId)
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