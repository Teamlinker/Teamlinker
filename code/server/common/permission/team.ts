import { teamUserModel } from "../../../common/model/team_user";
import { Permission_Types } from "../../../common/permission/permission";
import { getRedisInstance } from "../cache/redis";
import { getMysqlInstance } from "../db/mysql";
import { DComponent } from '../decorate/component';
import { generateQuerySql } from "../util/sql";
import StringUtil from "../util/string";
import { DPermission, PermissionBase } from "./base";

export type IPermission_Team =string[]
@DComponent
export class PermissionTeam extends PermissionBase<IPermission_Team> {
    translateToField(param: { [param: string]: any; userId?: string; isAdmin?: boolean; }): Promise<string> {
        throw new Error("Method not implemented.");
    }
    fieldName: string="teamId"
    check(obj: IPermission_Team): boolean {
        throw new Error("Method not implemented.");
    }
    keys=["permission:team:{0}:user"]
    buildKey({teamId}: { [param: string]: any; userId?: string; isAdmin?: boolean;teamId:string }) {
        if(StringUtil.isEmpty(teamId)) {
            return null;
        }
        return this.keys.map(key=>{
            return StringUtil.format(key,teamId)
        });
    }
    async generatorValue({userId,teamId}: { [param: string]: any; userId?: string; isAdmin?: boolean;teamId:string },keys:string[]): Promise<IPermission_Team> {
        try {
            await this.tryLock(keys.map(item=>item.replace(/\:/g,"")));
            let redis=getRedisInstance()
            let mysql=getMysqlInstance()
            let permissionsSet=new Set<string>();
            let exist=await redis.exists(keys[0])
            if(!exist) {
                let ret=await mysql.execute(generateQuerySql(teamUserModel,["user_id","role_id"],{
                    team_id:teamId
                }))
                let map={}
                for(let obj of ret) {
                    map[obj.user_id]=obj.role_id
                }
                await redis.hSet(keys[0],map)
            }
            let roleId=await redis.hGet(keys[0],userId)
            if(roleId) {
                let role=await this.getRolePermissionList(roleId)
                for(let o of role) {
                    permissionsSet.add(o)
                }
            }
            await this.unlock()
            return Array.from(permissionsSet)
        } catch(err) {
            console.error("generatorValue error:" + err)
            await this.unlock()
        }
    }
}

@DPermission(Permission_Types.Team.CREATE)
@DComponent
export class PermissionTeamCreate extends PermissionTeam {
    override check(obj:IPermission_Team):boolean {
        return obj.includes(Permission_Types.Team.CREATE.value);
    }
} 

@DPermission(Permission_Types.Team.READ)
@DComponent
export class PermissionTeamRead extends PermissionTeam {
    override check(obj:IPermission_Team):boolean {
        return obj.includes(Permission_Types.Team.READ.value);
    }
} 

@DPermission(Permission_Types.Team.EDIT)
@DComponent
export class PermissionTeamEdit extends PermissionTeam {
    override check(obj:IPermission_Team):boolean {
        return obj.includes(Permission_Types.Team.EDIT.value);
    }
} 

@DPermission(Permission_Types.Team.DELETE)
@DComponent
export class PermissionTeamDelete extends PermissionTeam {
    override check(obj:IPermission_Team):boolean {
        return obj.includes(Permission_Types.Team.DELETE.value);
    }
} 

@DPermission(Permission_Types.Team.MEMBER)
@DComponent
export class PermissionTeamMemeber extends PermissionTeam {
    override check(obj:IPermission_Team):boolean {
        return obj.includes(Permission_Types.Team.MEMBER.value);
    }
} 
