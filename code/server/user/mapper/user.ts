import { ICommon_Model_Team, Table_Team, teamModel } from "../../../common/model/team";
import { Err } from "../../../common/status/error";
import { keys } from "../../../common/transform";
import { getMysqlInstance } from "../../common/db/mysql";
import { Mapper } from "../../common/entity/mapper";
import CommonUtil from "../../common/util/common";
import { exculdeColumns, generateLeftJoinSql, generateQuerySql, generateUpdateSql } from "../../common/util/sql";
import { ICommon_Model_Project, projectModel, Table_Project } from './../../../common/model/project';
import { projectMemberModel, Table_Project_Member } from './../../../common/model/project_member';
import { Table_Team_User, teamUserModel } from './../../../common/model/team_user';
import { ICommon_Model_User, Table_User, userModel } from './../../../common/model/user';
class UserMapper extends Mapper<typeof userModel> {
    constructor(){
        super(userModel)
    }
    async checkUserValid(username:string):Promise<boolean> {
        if(!username){
            return false
        }
        var mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(userModel,["username"],{
            username:username
        }))
        return !!ret
    }
    
    async getUserByName(name:string):Promise<ICommon_Model_User> {
        if(!name) {
            throw  Err.User.userNameNotExists
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(userModel,[],{username:name,admin:0}))
        return ret
    }


    async active(id:string,active:number) {
        if(!id) {
            throw  Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        await mysql.execute(generateUpdateSql(userModel,{active},{id}))
    }

    async list(page:number,size:number,keyword?:string):Promise<{
        count:number,
        totalPage:number,
        data:ICommon_Model_User[]
    }> {
        if(page===undefined || page<0 || size===undefined || size<=0) {
            throw Err.Common.paramError
        }
        var mysql=getMysqlInstance();
        let count=Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_User} where admin=0${keyword?` and username like '%${keyword}%'`:""}`))[0]
        let totalPage=CommonUtil.pageTotal(count,size)
        let colums=keys<ICommon_Model_User>().map(item=>item.name);
        let ret=await mysql.execute(generateQuerySql(userModel,exculdeColumns(colums,[]),{
            admin:0,
            ...(keyword && {username:{
                exp:"%like%",
                value:keyword
            }}),
            
        },"and",{
            field:"username",
            type:"asc"
        },page*size,size))
        return {
            count:count,
            totalPage:totalPage,
            data:ret
        };
    }

    async teamList(page:number,size:number,userId:string,keyword?:string):Promise<{
        count:number,
        totalPage:number,
        data:ICommon_Model_Team[]
    }>{
        if(page===undefined || page<0 || size===undefined || size<=0 || !userId) {
            throw Err.Common.paramError
        }
        var mysql=getMysqlInstance();
        let count=Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_Team_User} tu left join ${Table_Team} t on t.id=tu.team_id where tu.user_id='${userId}'${keyword?` and t.name like '%${keyword}%'`:""}`))[0]
        let totalPage=CommonUtil.pageTotal(count,size)
        let sql=generateLeftJoinSql({
            model:teamUserModel,
        },{
            model:teamModel,
            columns:keys<ICommon_Model_Team>().map(item=>item.name),
            expression:{
                id:{
                    model:teamUserModel,
                    field:"team_id"
                }
            },
            aggregation:"team"
        },{
            user_id:{
                model:teamUserModel,
                value:userId
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
        },page*size,size)
        let ret=await mysql.execute(sql)
        return {
            count:count,
            totalPage:totalPage,
            data:ret.map(item=>item.team)
        };
    }

    async projectList(page:number,size:number,userId:string,keyword?:string):Promise<{
        count:number,
        totalPage:number,
        data:ICommon_Model_Project[]
    }>{
        if(page===undefined || page<0 || size===undefined || size<=0 || !userId) {
            throw Err.Common.paramError
        }
        var mysql=getMysqlInstance();
        let count=Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_Project_Member} pm left join ${Table_Project} p on p.id=pm.project_id where pm.member_id='${userId}'${keyword?` and p.name like '%${keyword}%'`:""}`))[0]
        let totalPage=CommonUtil.pageTotal(count,size)
        let sql=generateLeftJoinSql({
            model:projectMemberModel,
        },{
            model:projectModel,
            columns:keys<ICommon_Model_Project>().map(item=>item.name),
            expression:{
                id:{
                    model:projectMemberModel,
                    field:"member_id"
                }
            },
            aggregation:"project"
        },{
            member_id:{
                model:projectMemberModel,
                value:userId
            },
            ...(keyword && {
                name:{
                    model:projectModel,
                    value:{
                        exp:"%like%",
                        value:keyword
                    }
                }
            })
        },"and",{
            field:"name",
            model:projectModel,
            type:"asc"
        },page*size,size)
        let ret=await mysql.execute(sql)
        return {
            count:count,
            totalPage:totalPage,
            data:ret.map(item=>item.project)
        };
    }
    async users(userIds:string[]){
        if(!userIds){
            throw Err.User.userIdNotExists
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(userModel,[],{
            id:{
                exp:"in",
                value:userIds
            }
        }))
        return ret;
    }

    async filter(name:string,size:number)
    {
        if(!name) {
            throw Err.User.userNameNotExists
        }
        if(!size) {
            throw Err.Common.paramError
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(userModel,["id","username","photo"],{
            admin:0,
            active:1,
            username:{
                exp:"%like%",
                value:name
            }
        },"and",{
            field:"username",
            type:"asc"
        },0,size))
        return ret;
    }
}
export let userMapper=new UserMapper()
