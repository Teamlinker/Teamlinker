import { organizationUserModel } from '../../../common/model/organization_user';
import { REDIS_GATEWAY } from '../cache/keys/gateway';
import { getMysqlInstance } from '../db/mysql';
import { generateQuerySql } from '../util/sql';
import { ECommon_Organization_User_Role } from './../../../common/model/organization_user';
export async function getOrganizationPermission(organizationId:string,userId:string):Promise<ECommon_Organization_User_Role> {
    if(!organizationId) {
        return null;
    }
    let objRedis=REDIS_GATEWAY.Permission.organizationRole(organizationId,userId)
    let exist = objRedis.exists()
    if(exist) {
        let value=await objRedis.get()
        return parseInt(value);
    } else {
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(organizationUserModel,["role"],{
            organization_id:organizationId,
            user_id:userId
        }))
        if(obj) {
            return obj.role
        } else {
            return null;
        }
    }
}