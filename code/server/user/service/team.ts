import { ICommon_Model_Team } from '../../../common/model/team';
import { ICommon_Model_Team_Role } from '../../../common/model/team_role';
import { Err } from '../../../common/status/error';
import { Entity } from "../../common/entity/entity";
import { EServer_Common_Event_Types } from '../../common/event/types';
import { emitServiceEvent } from '../../common/rpc/rpc';
import { teamMapper } from '../mapper/team';
export default class Team extends Entity<ICommon_Model_Team> {
    
    async create():Promise<ICommon_Model_Team>{
        if(!this.item) {
            throw  Err.Team.teamNotFound;
        } else if(this.item.id) {
            throw  Err.Team.teamExists;
        }
        await teamMapper.createTeam(this.item)
        await this.loadItem();
        return this.item;
    }
    async update():Promise<ICommon_Model_Team>{
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        await teamMapper.updateTeam(this.item)
        return this.item;
    }
    async delete(){
        await teamMapper.deleteTeam(this.item.id);
        emitServiceEvent(EServer_Common_Event_Types.Team.DELETE,this.item.id);
    }
    async loadItem():Promise<ICommon_Model_Team> {
        if(!this.item || !this.item.id) {
            throw  Err.Team.teamNotFound;
        }
        let obj = await teamMapper.getTeamById(this.item.id);
        this.item=obj;
        return this.item;
    }
    static async getItemById(id:string,reload:boolean=false):Promise<InstanceType<typeof Team>>{
        let obj = await teamMapper.getTeamById(id);
        if (!obj) {
            return null
        }
        let team = new Team;
        team.setItem(obj);
        return team;
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

}