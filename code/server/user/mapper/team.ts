import { ICommon_Model_Team, teamModel } from '../../../common/model/team';
import { teamUserModel } from '../../../common/model/team_user';
import { userModel } from '../../../common/model/user';
import { Err } from "../../../common/status/error";
import { getMysqlInstance } from "../../common/db/mysql";
import { Mapper } from '../../common/entity/mapper';
import CommonUtil from '../../common/util/common';
import { generateCreateSql, generateDeleteSql, generateLeftJoin2Sql, generateLeftJoinSql, generateQuerySql, generateSnowId, generateUpdateSql } from "../../common/util/sql";
import { Table_Team } from './../../../common/model/team';
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


    async members(teamId:string):Promise<{
        id:string,
        name:string,
        photo:string
    }[]> {
        if(!teamId) {
            throw  Err.Team.teamNotFound
        }
        var mysql=getMysqlInstance();
        let sql=generateLeftJoinSql({
            model:teamUserModel
        },{
            model:userModel,
            columns:["id","username","photo"],
            expression:{
                id:{
                    model:teamUserModel,
                    field:"user_id"
                }
            },
            rename:{
                fields:["username"],
                newFields:["name"]
            }
        },{
            team_id:{
                value:teamId,
                model:teamUserModel
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }

    async addMember(teamId:string,userId:string) {
        if(!teamId) {
            throw  Err.Team.teamNotFound
        } else if(!userId) {
            throw Err.User.userIdNotExists
        }
        let mysql=getMysqlInstance()
        let existsMemeber=await mysql.executeOne(generateQuerySql(teamUserModel,[],{
            user_id:userId,
            team_id:teamId
        }))
        if(existsMemeber) {
            throw Err.Team.teamMemberExists
        }
        await mysql.execute(generateCreateSql(teamUserModel,{
            user_id:userId,
            team_id:teamId,
            id:await generateSnowId()
        }))
    }

    async removeMember(teamId:string,userId:string) {
        if(!teamId) {
            throw  Err.Team.teamNotFound
        } else if(!userId) {
            throw Err.User.userIdNotExists
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(teamUserModel,{
            team_id:teamId,
            user_id:userId
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
        let count=Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_Team}${keyword?` where organization_id='${organizationId}' name like '%${keyword}%'`:""}`))[0]
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
}

export let teamMapper=new TeamMapper()