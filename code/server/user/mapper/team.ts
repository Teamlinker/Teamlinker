import {ICommon_Model_Team, teamModel} from '../../../common/model/team';
import {Table_Team_User, teamUserModel} from '../../../common/model/team_user';
import {ICommon_Model_User, Table_User, userModel} from '../../../common/model/user';
import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {Mapper} from '../../common/entity/mapper';
import CommonUtil from '../../common/util/common';
import {
    convertCountSql,
    generateCreateSql,
    generateDeleteSql,
    generateLeftJoin3Sql,
    generateLeftJoinSql,
    generateQuerySql,
    generateSnowId
} from "../../common/util/sql";
import {Table_Team} from './../../../common/model/team';
import {
    ICommon_Model_Organization_User,
    organizationUserModel,
    Table_Organization_User
} from "../../../common/model/organization_user";
import {keys} from "../../../common/transform";

class TeamMapper extends Mapper<typeof teamModel> {
    constructor(){
        super(teamModel)
    }
    async checkTeam(name:string):Promise<boolean> {
        if(!name) {
            throw Err.Common.paramError
        }
        var mysql=getMysqlInstance() 
        let ret=await mysql.executeOne(generateQuerySql(teamModel,null,{name}))
        return !!ret;
    }

    override async createConfig(info:ICommon_Model_Team) {
        let isExists=await this.checkTeam(info.name);
        if(isExists) {
            throw Err.Team.teamExists
        }
    }


    async members(teamId:string,page:number,size:number,keyword?:string) {
        if(!teamId || page===undefined || size==undefined) {
            throw  Err.Team.teamNotFound
        }
        let mysql=getMysqlInstance();
        let count:number
        if(keyword) {
            count=Number(Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_Team_User} tu left join ${Table_Team} t on t.id=tu.team_id left join ${Table_Organization_User} ou on ou.id=tu.organization_user_id left join ${Table_User} u on u.id=ou.user_id where tu.team_id=${teamId}${keyword?` and (u.username like '%${keyword}%' or ou.nickname like '%${keyword}%')`:""}`))[0])
        } else {
            count=Number(Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_Team_User} where team_id='${teamId}'`))[0])
        }
        let totalPage=CommonUtil.pageTotal(count,size)
        let sql=generateLeftJoin3Sql({
            model:teamUserModel,
        },{
            model:organizationUserModel,
            columns:keys<ICommon_Model_Organization_User>().map(item=>item.name),
            expression:{
                id:{
                    model:teamUserModel,
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
            model:teamModel,
            expression:{
                id:{
                    model:teamUserModel,
                    field: "team_id"
                }
            }
        },{
            team_id:{
                model:teamUserModel,
                value:teamId
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

    async addMember(teamId:string,organizationUserId:string) {
        if(!teamId) {
            throw  Err.Team.teamNotFound
        } else if(!organizationUserId) {
            throw Err.Organization.userNotFound
        }
        let mysql=getMysqlInstance()
        let existsMember=await mysql.executeOne(generateQuerySql(teamUserModel,[],{
            organization_user_id:organizationUserId,
            team_id:teamId
        }))
        if(existsMember) {
            throw Err.Team.teamMemberExists
        }
        await mysql.execute(generateCreateSql(teamUserModel,{
            organization_user_id:organizationUserId,
            team_id:teamId,
            id:await generateSnowId()
        }))
    }

    async removeMember(teamId:string,organizationUserId:string) {
        if(!teamId) {
            throw  Err.Team.teamNotFound
        } else if(!organizationUserId) {
            throw Err.Organization.userNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(teamUserModel,{
            team_id:teamId,
            organization_user_id:organizationUserId
        }))
    }

    async list(organizationId:string,page:number,size:number,keyword?:string):Promise<{
        count:number,
        totalPage:number,
        data:ICommon_Model_Team[]
    }> {
        if(page===undefined || page<0 || size===undefined || size<=0 || !organizationId) {
            throw Err.Common.paramError
        }
        var mysql=getMysqlInstance();
        let count=Number(Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_Team}${keyword?` where organization_id='${organizationId}' and name like '%${keyword}%'`:""}`))[0])
        let totalPage=CommonUtil.pageTotal(count,size)
        let ret=await mysql.execute(generateQuerySql(teamModel,[],{
            organization_id:organizationId,
            ...(keyword && {
                name:{
                    exp:"%like%",
                    value:keyword
                }
            })
        },"and",{
            field:"name",
            type:"asc"
        },page*size,size))
        return {
            count:count,
            totalPage:totalPage,
            data:ret
        };
    }

    async filter(organizationId:string,name:string,size:number)
    {
        if(!name) {
            throw Err.User.userNameNotExists
        } else if(!size) {
            throw Err.Common.paramError
        } else if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(teamModel,["id","name","photo"],{
            name:{
                exp:"%like%",
                value:name
            },
            organization_id:organizationId
        },"and",{
            field:"name",
            type:"asc"
        },0,size))
        return ret;
    }

    async clearMemberByItemId(teamId:string) {
        if(!teamId) {
            throw  Err.Team.teamNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(teamUserModel,{
            team_id:teamId
        }))
    }

    async clearMemberByMemberId(memberId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(teamUserModel,{
            organization_user_id:memberId
        }))
    }

    async checkMember(teamId:string,memberId:string) {
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(teamUserModel,["id"],{
            team_id:teamId,
            organization_user_id:memberId
        }))
        if(ret) {
            return true;
        } else {
            return false;
        }
    }

    async infos(teamIds:string[]) {
        let mysql=getMysqlInstance()
        if(teamIds.length>0) {
            let ret=await mysql.execute(generateQuerySql(teamModel,["id","name","photo"],{
                id:{
                    exp:"in",
                    value:teamIds
                }
            },"and",{
                type:"field",
                field:"id",
                value:teamIds
            }))
            return ret;
        } else {
            return []
        }
    }

    async filterAvailable(organizationUserId:string,keyword:string,size:number):Promise<{
        name:string,
        id:string,
        photo:string
    }[]> {
        if(!organizationUserId) {
            throw Err.Organization.userNotFound
        }
        let mysql=getMysqlInstance();
        let sql=generateLeftJoinSql({
            model:teamUserModel,
        },{
            model:teamModel,
            columns:["id","name","photo"],
            expression:{
                id:{
                    model:teamUserModel,
                    field:"team_id"
                }
            }
        }, {
            organization_user_id:{
                model:teamUserModel,
                value:organizationUserId
            },
            ...(keyword && {
                name:{
                    model:teamModel,
                    value:{
                        exp:"%like%",
                        value:keyword
                    }
                }
            })
        },"and",{
            field:"name",
            model:teamModel,
            type:"asc"
        },0,size)
        let ret=await mysql.execute(sql)
        return ret
    }

    async getMemberCount(teamId:string) {
        if(!teamId) {
            throw Err.Team.teamNotFound
        }
        let mysql=getMysqlInstance();
        let sql=generateQuerySql(teamUserModel,null,{
            team_id:teamId
        })
        let countSql=convertCountSql(sql);
        let count=Number(Object.values(await mysql.executeOne(countSql))[0])
        return count
    }

    async pickupMember(teamId:string) {
        if(!teamId) {
            throw Err.Team.teamNotFound
        }
        let mysql=getMysqlInstance();
        let sql=generateLeftJoinSql({
            model:teamUserModel,
            columns:["organization_user_id"]
        },{
            model:organizationUserModel,
            expression:{
                id:{
                    model:teamUserModel,
                    field:"organization_user_id"
                }
            }
        },{
            team_id:{
                model:teamUserModel,
                value:teamId
            }
        },"and",{
            type:"asc",
            field:"nickname",
            model:organizationUserModel
        },0,1)
        let obj=await mysql.executeOne(sql)
        return obj?.organization_user_id
    }
}

export let teamMapper=new TeamMapper()