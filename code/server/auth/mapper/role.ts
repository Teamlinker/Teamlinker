import {
    ECommon_Model_Role_Reserved,
    ECommon_Model_Role_Type,
    ICommon_Model_Role,
    roleModel
} from '../../../common/model/role';
import {Err} from '../../../common/status/error';
import {getMysqlInstance} from '../../common/db/mysql';
import {Mapper} from "../../common/entity/mapper";
import {generateDeleteLeftJoinSql, generateDeleteSql, generateQuerySql} from '../../common/util/sql';
import {projectModel} from './../../../common/model/project';
import {roleMemberModel} from './../../../common/model/role_member';
import {teamModel} from './../../../common/model/team';
import {organizationModel} from "../../../common/model/organization";
import {wikiModel} from "../../../common/model/wiki";

let g_roleAdmin:{
    [name:string]:ICommon_Model_Role
}={}
class RoleMapper extends Mapper<typeof roleModel> {
    constructor(){
        super(roleModel)
    }

    async clearRoleByItemId(itemId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(roleMemberModel,{
            item_id:itemId
        }))
        await mysql.execute(generateDeleteSql(roleModel,{
            item_id:itemId
        }))
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
        }
    }

    async getAdminRole(type:ECommon_Model_Role_Type) {
        let mysql=getMysqlInstance()
        if(type===ECommon_Model_Role_Type.ORGANIZATION) {
            if(!g_roleAdmin["organization"]) {
                let obj=await mysql.executeOne(generateQuerySql(roleModel,null,{
                    reserved:ECommon_Model_Role_Reserved.ADMIN,
                    type:ECommon_Model_Role_Type.ORGANIZATION
                }))
                g_roleAdmin["organization"]=obj
            }
            return g_roleAdmin["organization"]
        } else if(type===ECommon_Model_Role_Type.TEAM) {
            if(!g_roleAdmin["team"]) {
                let obj=await mysql.executeOne(generateQuerySql(roleModel,null,{
                    reserved:ECommon_Model_Role_Reserved.ADMIN,
                    type:ECommon_Model_Role_Type.TEAM
                }))
                g_roleAdmin["team"]=obj
            }
            return g_roleAdmin["team"]
        } else if(type===ECommon_Model_Role_Type.PROJECT) {
            if(!g_roleAdmin["project"]) {
                let obj=await mysql.executeOne(generateQuerySql(roleModel,null,{
                    reserved:ECommon_Model_Role_Reserved.ADMIN,
                    type:ECommon_Model_Role_Type.PROJECT
                }))
                g_roleAdmin["project"]=obj
            }
            return g_roleAdmin["project"]
        } else if(type===ECommon_Model_Role_Type.WIKI) {
            if(!g_roleAdmin["project"]) {
                let obj=await mysql.executeOne(generateQuerySql(roleModel,null,{
                    reserved:ECommon_Model_Role_Reserved.ADMIN,
                    type:ECommon_Model_Role_Type.WIKI
                }))
                g_roleAdmin["project"]=obj
            }
            return g_roleAdmin["project"]
        }
    }
    

    async getUserRoles(itemId:string,type:ECommon_Model_Role_Type) {
        let mysql=getMysqlInstance()
        let organizationId:string
        let objOrganization=await mysql.executeOne(generateQuerySql(organizationModel,["id"],{
            id:itemId
        }))
        if(objOrganization) {
            organizationId=objOrganization.id
            let arr=await mysql.execute(generateQuerySql(roleModel,null,{
                item_id:null,
                organization_id:organizationId,
                type:type,
                reserved:ECommon_Model_Role_Reserved.NORMAL
            }))
            return arr.map(item=>{
                return {
                    ...item,
                    global:true
                }
            })
        } else {
            if(type===ECommon_Model_Role_Type.PROJECT) {
                let obj=await mysql.executeOne(generateQuerySql(projectModel,["organization_id"],{
                    id:itemId
                }))
                if(obj) {
                    organizationId=obj.organization_id
                }
            } else if (type === ECommon_Model_Role_Type.TEAM) {
                let obj=await mysql.executeOne(generateQuerySql(teamModel,["organization_id"],{
                    id:itemId
                }))
                if(obj) {
                    organizationId=obj.organization_id
                }
            } else if (type === ECommon_Model_Role_Type.WIKI) {
                let obj=await mysql.executeOne(generateQuerySql(wikiModel,["organization_id"],{
                    id:itemId
                }))
                if(obj) {
                    organizationId=obj.organization_id
                }
            }
            if(!organizationId) {
                throw Err.Organization.organizationNotFound
            }
            let [objSelf,objExtend]=await Promise.all([
                mysql.execute(generateQuerySql(roleModel,null,{
                    item_id:itemId,
                    reserved:ECommon_Model_Role_Reserved.NORMAL
                })),
                mysql.execute(generateQuerySql(roleModel,null,{
                    item_id:null,
                    organization_id:organizationId,
                    type:type,
                    reserved:ECommon_Model_Role_Reserved.NORMAL
                })),
            ]);
            return objSelf.map(item=>{
                return {
                    ...item,
                    global:false
                }
            }).concat(objExtend.map(item=>{
                return {
                    ...item,
                    global:true
                }
            }))
        }

    }

    async getRoleByValue(value:number):Promise<ICommon_Model_Role> {
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(roleModel,null,{
            value:value
        }))
        return obj;
    }

    async clearByOrganizationId(organizationId:string) {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateDeleteLeftJoinSql(roleModel,{
            model:roleMemberModel,
            expression:{
                role_id:{
                    model:roleModel,
                    field:"id"
                }
            },
            isDelete:true
        },{
            organization_id:{
                model:roleModel,
                value:organizationId
            }
        })
        await mysql.execute(sql)
    }
}

export let roleMapper=new RoleMapper()