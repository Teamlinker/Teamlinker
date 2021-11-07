import { teamModel } from './../../../common/model/team';
import { ICommon_Model_Team } from '../../../common/model/team';
import { ICommon_Model_Team_Role } from '../../../common/model/team_role';
import { Err } from '../../../common/status/error';
import { Entity } from "../../common/entity/entity";
import { EServer_Common_Event_Types } from '../../common/event/types';
import { emitServiceEvent } from '../../common/rpc/rpc';
import { teamMapper } from '../mapper/team';
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

}