import { organizationUserModel } from '../../../common/model/organization_user';
import { REDIS_GATEWAY } from '../../common/cache/keys/gateway';
import { getMysqlInstance } from '../../common/db/mysql';
import { generateQuerySql } from '../../common/util/sql';
import { ECommon_Organization_User_Role } from '../../../common/model/organization_user';
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
            await objRedis.set(String(obj.role),3600);
            return obj.role
        } else {
            return null;
        }
    }
}