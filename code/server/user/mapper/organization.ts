import { Err } from '../../../common/status/error';
import { keys } from '../../../common/transform';
import { getMysqlInstance } from '../../common/db/mysql';
import { Mapper } from '../../common/entity/mapper';
import CommonUtil from '../../common/util/common';
import { generateCreateSql, generateDeleteSql, generateLeftJoinSql, generateQuerySql, generateSnowId } from '../../common/util/sql';
import { ICommon_Model_Organization, organizationModel } from './../../../common/model/organization';
import { ECommon_Organization_User_Role, ICommon_Model_Organization_User, organizationUserModel, Table_Organization_User } from './../../../common/model/organization_user';
import { Table_User, userModel } from './../../../common/model/user';
class OrganizationMapper extends Mapper<typeof organizationModel> {
    constructor(){
        super(organizationModel)
    }
    async list(userId:string) {
        if(!userId) {
            throw Err.Organization.ownerNotFound
        }
        let mysql=getMysqlInstance()
        let arrOrganizationOwner=await mysql.execute(generateQuerySql(organizationModel,[],{
            user_id:userId
        },"and",{
            field:"name",
            type:"asc"
        }))
        let sql=generateLeftJoinSql({
            model:organizationUserModel
        },{
            model:organizationModel,
            columns:keys<ICommon_Model_Organization>().map(item=>item.name),
            expression:{
                id:{
                    model:organizationUserModel,
                    field:"organization_id"
                }
            }
        },{
            user_id:{
                model:organizationUserModel,
                value:userId
            }
        })
        let arrOrganizationOwnerId=arrOrganizationOwner.map(item=>item.id);
        let arrOrganization=await mysql.execute(sql);
        return {
            create:arrOrganizationOwner,
            join:arrOrganization.filter(item=>{
                return !arrOrganizationOwnerId.includes(item.id)
            })
        };
    }

    async clearUser(organizationId:string){
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(organizationUserModel,{
            organization_id:organizationId
        }))
    }

    async init(adminIds: string[], userIds: string[]) {
        let mysql=getMysqlInstance()
        let id=await generateSnowId()
        await mysql.executeOne(generateCreateSql(organizationModel,{
            id,
            name:"default",
            user_id:adminIds[0]
        }))
        let i=0;
        for(let adminId of adminIds) {
            await mysql.execute(generateCreateSql(organizationUserModel,{
                id:await generateSnowId(),
                nickname:"test"+(i++),
                organization_id:id,
                role:ECommon_Organization_User_Role.ADMIN,
                user_id:adminId
            }))
        }
        for(let userId of userIds) {
            await mysql.execute(generateCreateSql(organizationUserModel,{
                id:await generateSnowId(),
                nickname:"test"+(i++),
                organization_id:id,
                role:ECommon_Organization_User_Role.USER,
                user_id:userId
            }))
        }
        return id;
    }

}

export let organizationMapper=new OrganizationMapper()

class OrganizationUserMapper extends Mapper<typeof organizationUserModel> {
    constructor(){
        super(organizationUserModel)
    }

    async clearUser(organizationId:string) {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(organizationUserModel,{
            organization_id:organizationId
        }))
    }

    async listUser(organizationId:string,page:number,size:number,keyword?:string) {
        if(page===undefined || page<0 || size===undefined || size<=0 || !organizationId) {
            throw Err.Common.paramError
        }
        var mysql=getMysqlInstance();
        let count=Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_Organization_User} ou  left join ${Table_User} u on u.id=ou.user_id where ou.organization_id=${organizationId}${keyword?` and (u.username like '%${keyword}%' or ou.nickname like '%${keyword}%')`:""}`))[0]
        let totalPage=CommonUtil.pageTotal(count,size)
        let sql=generateLeftJoinSql({
            model:organizationUserModel,
            columns:keys<Omit<ICommon_Model_Organization_User,"user_id">>().map(item=>item.name)
        },{
            model:userModel,
            columns:["id","username","photo"],
            expression:{
                id:{
                    model:organizationUserModel,
                    field:"user_id"
                }
            },
            aggregation:"user_id"
        },{
            organization_id:{
                model:organizationUserModel,
                value:organizationId
            },
            ...(keyword && {
                "$or0":{
                    "username":{
                        model:userModel,
                        value:{
                            exp:"%like%",
                            value:keyword
                        }
                    },
                    "nickname":{
                        model:organizationUserModel,
                        value:{
                            exp:"%like%",
                            value:keyword
                        }
                    }
                }
            })
        },"and",{
            field:"nickname",
            model:organizationUserModel,
            type:"asc"
        },size*page,size)
        let ret=await mysql.execute(sql)
        return {
            count:count,
            totalPage:totalPage,
            data:ret
        };
    }

}

export let organizationUserMapper=new OrganizationUserMapper()