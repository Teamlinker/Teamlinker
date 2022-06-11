import { ECommon_Model_Role_Type, roleModel } from '../../../common/model/role';
import { rolelPermissionModel } from '../../../common/model/role_permission';
import { Err } from '../../../common/status/error';
import { getMysqlInstance } from '../../common/db/mysql';
import { Mapper } from "../../common/entity/mapper";
import { generateDeleteSql, generateQuerySql } from '../../common/util/sql';
import { projectModel } from './../../../common/model/project';
import { roleMemberModel } from './../../../common/model/role_member';
import { teamModel } from './../../../common/model/team';

class RoleMapper extends Mapper<typeof roleModel> {
    constructor(){
        super(roleModel)
    }

    async getRolesByItemId(itemId: string,type:ECommon_Model_Role_Type): Promise<{ id: string; name: string; description: string; }[]> {
        let ret:{
            id: string; name: string; description: string; 
        }[]=[];
        let mysql=getMysqlInstance()
        let arr=await mysql.execute(generateQuerySql(roleModel,[],{
            item_id:itemId
        }))
        for(let obj of arr) {
            ret.push({
                id:obj.id,
                name:obj.name,
                description:obj.description
            })
        }
        let organizationId;
        if(type==ECommon_Model_Role_Type.PROJECT) {
            let objProject=await mysql.executeOne(generateQuerySql(projectModel,["organization_id"],{
                id:itemId
            }))
            if(!objProject) {
                throw Err.Project.projectNotFound
            }
            organizationId=objProject.organization_id
        } else if(type==ECommon_Model_Role_Type.TEAM) {
            let objTeam=await mysql.executeOne(generateQuerySql(teamModel,["organization_id"],{
                id:itemId
            }))
            if(!objTeam) {
                throw Err.Team.teamNotFound
            }
            organizationId=objTeam.organization_id
        }
        if(organizationId) {
            let arr=await mysql.execute(generateQuerySql(roleModel,[],{
                item_id:null,
                organization_id:organizationId,
                type:type
            }))
            for(let obj of arr) {
                ret.push({
                    id:obj.id,
                    name:obj.name,
                    description:obj.description
                })
            }
        }
        arr=await mysql.execute(generateQuerySql(roleModel,[],{
            item_id:null,
            organization_id:null,
            type:type
        }))
        for(let obj of arr) {
            ret.push({
                id:obj.id,
                name:obj.name,
                description:obj.description
            })
        }
        return ret;
    }

    async clearRoleByItemId(itemId:string) {
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(roleModel,["id"],{
            item_id:itemId
        }))
        if(ret.length>0) {
            await mysql.execute(generateDeleteSql(roleMemberModel,{
                item_id:itemId
            }))
            await mysql.execute(generateDeleteSql(roleModel,{
                item_id:itemId
            }))
            await mysql.execute(generateDeleteSql(rolelPermissionModel,{
                role_id:{
                    exp:"in",
                    value:ret.map(item=>item.id)
                }
            }))
        }
    }

    async clearRoleByItemIds(itemIds:string[]) {
        if(itemIds.length==0) {
            return;
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(roleModel,["id"],{
            item_id:{
                exp:"in",
                value:itemIds
            }
        }))
        if(ret.length>0) {
            await mysql.execute(generateDeleteSql(roleMemberModel,{
                item_id:{
                    exp:"in",
                    value:itemIds
                }
            }))
            await mysql.execute(generateDeleteSql(roleModel,{
                item_id:{
                    exp:"in",
                    value:itemIds
                }
            }))
            await mysql.execute(generateDeleteSql(rolelPermissionModel,{
                role_id:{
                    exp:"in",
                    value:ret.map(item=>item.id)
                }
            }))
        }
    }
}

export let roleMapper=new RoleMapper()