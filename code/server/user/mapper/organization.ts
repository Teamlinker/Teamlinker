import {Err} from '../../../common/status/error';
import {keys} from '../../../common/transform';
import {getMysqlInstance} from '../../common/db/mysql';
import {Mapper} from '../../common/entity/mapper';
import CommonUtil from '../../common/util/common';
import {
    generateCreateSql,
    generateDeleteSql,
    generateLeftJoin3Sql,
    generateLeftJoinSql,
    generateQuerySql,
    generateSnowId
} from '../../common/util/sql';
import {ICommon_Model_Organization, organizationModel} from './../../../common/model/organization';
import {
    ICommon_Model_Organization_User,
    organizationUserModel,
    Table_Organization_User
} from './../../../common/model/organization_user';
import {ICommon_Model_User, Table_User, userModel} from './../../../common/model/user';
import {ICommon_Model_Member_Tag, memberTagModel} from "../../../common/model/member_tag";
import {memberTagMemberModel} from "../../../common/model/member_tag_member";

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
            created_by_pure:userId
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
            created_by_pure:adminIds[0]
        }))
        let i=0;
        for(let adminId of adminIds) {
            await mysql.execute(generateCreateSql(organizationUserModel,{
                id:await generateSnowId(),
                nickname:"test"+(i++),
                organization_id:id,
                user_id:adminId
            }))
        }
        for(let userId of userIds) {
            await mysql.execute(generateCreateSql(organizationUserModel,{
                id:await generateSnowId(),
                nickname:"test"+(i++),
                organization_id:id,
                user_id:userId
            }))
        }
        return id;
    }

    async memberInfo(organizationUserId:string) {
        if(!organizationUserId) {
            throw Err.Organization.userNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:organizationUserModel,
            columns:keys<ICommon_Model_Organization_User>().map(item=>item.name),
            aggregation:"organizationUser"
        },{
            model:userModel,
            columns:keys<ICommon_Model_User>().map(item=>item.name),
            expression:{
                id:{
                    model:organizationUserModel,
                    field:"user_id"
                }
            },
            aggregation:"user"
        },{
            id:{
                model:organizationUserModel,
                value:organizationUserId
            },
        })
        let ret=await mysql.executeOne(sql);
        return ret;
    }

    async listUser(organizationId:string,page:number,size:number,keyword?:string) {
        if(page===undefined || page<0 || size===undefined || size<=0 || !organizationId) {
            throw Err.Common.paramError
        }
        var mysql=getMysqlInstance();
        let count=Number(Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_Organization_User} ou  left join ${Table_User} u on u.id=ou.user_id where ou.organization_id=${organizationId}${keyword?` and (u.username like '%${keyword}%' or ou.nickname like '%${keyword}%')`:""}`))[0])
        let totalPage=CommonUtil.pageTotal(count,size)
        let sql=generateLeftJoinSql({
            model:organizationUserModel,
            columns:keys<ICommon_Model_Organization_User>().map(item=>item.name),
            aggregation:"organizationUser"
        },{
            model:userModel,
            columns:keys<ICommon_Model_User>().map(item=>item.name),
            expression:{
                id:{
                    model:organizationUserModel,
                    field:"user_id"
                }
            },
            aggregation:"user"
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

export let organizationMapper=new OrganizationMapper()

class OrganizationUserMapper extends Mapper<typeof organizationUserModel> {
    constructor(){
        super(organizationUserModel)
    }

    async users(organizationUserIds:string[]){
        let mysql=getMysqlInstance()
        let ret:(ICommon_Model_User & {
            nickname:string
            organizationUserId:string
        })[]
        let sql=generateLeftJoinSql({
            model:organizationUserModel,
            columns:["nickname","id"],
            rename:{
                fields:["id"],
                newFields:["organizationUserId"]
            }
        },{
            model:userModel,
            columns:keys<ICommon_Model_User>().map(item=>item.name),
            expression:{
                id:{
                    model:organizationUserModel,
                    field:"user_id"
                },

            }
        },{
            id:{
                model:organizationUserModel,
                value:{
                    exp:"in",
                    value:organizationUserIds
                }
            }
        },"and",{
            field:"id",
            model:organizationUserModel,
            type:"field",
            value:organizationUserIds
        })
        ret=await mysql.execute(sql)
        return ret
    }
}

export let organizationUserMapper=new OrganizationUserMapper()

class MemberTagMapper extends Mapper<typeof memberTagModel> {
    constructor(){
        super(memberTagModel)
    }

    async listTag(organizationId:string):Promise<ICommon_Model_Member_Tag[]> {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(memberTagModel,null,{
            organization_id:organizationId
        },"and",{
            type:"asc",
            field:"name"
        }))
        return ret;
    }

    async clearMemberByTagId(memberTagId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(memberTagMemberModel,{
            member_tag_id:memberTagId
        }))
    }

    async listTagMember(memberTagId:string) {
        let mysql=getMysqlInstance()
        let sql=generateLeftJoin3Sql({
            model:memberTagMemberModel
        },{
            model:organizationUserModel,
            columns:keys<ICommon_Model_Organization_User>().map(item=>item.name),
            expression:{
                id:{
                    model:memberTagMemberModel,
                    field:"organization_user_id"
                }
            },
            aggregation:"organizationUser"
        },{
            model:userModel,
            columns:keys<ICommon_Model_User>().map(item=>item.name),
            expression:{
                id:{
                    model:organizationUserModel,
                    field:"user_id"
                }
            },
            aggregation:"user"
        },{
            model:memberTagModel,
            columns:keys<ICommon_Model_Member_Tag>().map(item=>item.name),
            expression:{
                id:{
                    model:memberTagMemberModel,
                    field:"member_tag_id"
                }
            },
            aggregation:"tag"
        },{
            member_tag_id:{
                model:memberTagMemberModel,
                value:memberTagId
            }
        },"and",{
            model:memberTagModel,
            field:"name",
            type:"asc"
        })
        let ret=await mysql.execute(sql);
        return ret;
    }

    async addTagMember(memberTagId:string,organizationUserId:string) {
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(memberTagMemberModel,["id"],{
            member_tag_id:memberTagId,
            organization_user_id:organizationUserId
        }))
        if(obj) {
            throw Err.Organization.memberTagAlreadyExists
        }
        await mysql.executeOne(generateCreateSql(memberTagMemberModel,{
            id:await generateSnowId(),
            organization_user_id:organizationUserId,
            member_tag_id:memberTagId
        }))
        let sql=generateLeftJoin3Sql({
            model:memberTagMemberModel
        },{
            model:organizationUserModel,
            columns:keys<ICommon_Model_Organization_User>().map(item=>item.name),
            expression:{
                id:{
                    model:memberTagMemberModel,
                    field:"organization_user_id"
                }
            },
            aggregation:"organizationUser"
        },{
            model:userModel,
            columns:keys<ICommon_Model_User>().map(item=>item.name),
            expression:{
                id:{
                    model:organizationUserModel,
                    field:"user_id"
                }
            },
            aggregation:"user"
        },{
            model:memberTagModel,
            columns:keys<ICommon_Model_Member_Tag>().map(item=>item.name),
            expression:{
                id:{
                    model:memberTagMemberModel,
                    field:"member_tag_id"
                }
            },
            aggregation:"tag"
        },{
            member_tag_id:{
                model:memberTagMemberModel,
                value:memberTagId
            },
            organization_user_id:{
                model:memberTagMemberModel,
                value:organizationUserId
            }
        },"and",{
            model:memberTagModel,
            field:"name",
            type:"asc"
        })
        let ret=await mysql.executeOne(sql);
        return ret;
    }

    async removeTagMember(memberTagId:string,organizationUserId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(memberTagMemberModel,{
            member_tag_id:memberTagId,
            organization_user_id:organizationUserId
        }))
    }

    async getTagsByOrganizationUserId(organizationUserId:string) {
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:memberTagMemberModel
        },{
            model:memberTagModel,
            columns:keys<ICommon_Model_Member_Tag>().map(item=>item.name),
            expression:{
                id:{
                    model:memberTagMemberModel,
                    field:"member_tag_id"
                }
            }
        },{
            organization_user_id:{
                model:memberTagMemberModel,
                value:organizationUserId
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }

    async getTagsByOrganizationUserIds(organizationUserIds:string[]) {
        if(organizationUserIds.length==0) {
            return []
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:memberTagMemberModel,
            columns:["organization_user_id"],
            aggregation:"organizationUser"
        },{
            model:memberTagModel,
            columns:keys<ICommon_Model_Member_Tag>().map(item=>item.name),
            expression:{
                id:{
                    model:memberTagMemberModel,
                    field:"member_tag_id"
                }
            },
            aggregation:"tag"
        },{
            organization_user_id:{
                model:memberTagMemberModel,
                value:{
                    exp:"in",
                    value:organizationUserIds
                }
            }
        })
        let arr=await mysql.execute(sql)
        let ret:ICommon_Model_Member_Tag[][]=[]
        for(let organizationUserId of organizationUserIds) {
            let arrTemp:ICommon_Model_Member_Tag[]=[]
            for(let obj of arr) {
                if(obj.organizationUser.organization_user_id==organizationUserId) {
                    arrTemp.push(obj.tag)
                }
            }
            ret.push(arrTemp)
        }
        return ret;
    }

    async clearMemberByMemberId(memberId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(memberTagMemberModel,{
            organization_user_id:memberId
        }))
    }

}

export let memberTagMapper=new MemberTagMapper()