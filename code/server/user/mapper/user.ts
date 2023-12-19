import {ICommon_Model_Team, teamModel} from "../../../common/model/team";
import {Err} from "../../../common/status/error";
import {keys} from "../../../common/transform";
import {getMysqlInstance} from "../../common/db/mysql";
import {Mapper} from "../../common/entity/mapper";
import CommonUtil from "../../common/util/common";
import {
    exculdeColumns,
    generateLeftJoin2Sql,
    generateLeftJoinSql,
    generateQuerySql,
    generateUpdateSql
} from "../../common/util/sql";
import {organizationUserModel} from './../../../common/model/organization_user';
import {teamUserModel} from './../../../common/model/team_user';
import {ECommon_User_Type, ICommon_Model_User, Table_User, userModel} from './../../../common/model/user';
import {userSettingModel} from "../../../common/model/user_setting";

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
        let ret=await mysql.executeOne(generateQuerySql(userModel,[],{
            username:name
        }))
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
        let count=Number(Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_User} where role=0${keyword?` and username like '%${keyword}%'`:""}`))[0])
        let totalPage=CommonUtil.pageTotal(count,size)
        let colums=keys<ICommon_Model_User>().map(item=>item.name);
        let ret=await mysql.execute(generateQuerySql(userModel,exculdeColumns(colums,[]),{
            ...(keyword && {username:{
                exp:"%like%",
                value:keyword
            }}),
            role:{
                exp:"<>",
                value:ECommon_User_Type.DELETED
            }
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

    async teamList(userId:string,organizationId:string,keyword?:string):Promise<ICommon_Model_Team[]>{
        if(!userId) {
            throw Err.Common.paramError
        }
        let mysql=getMysqlInstance();
        let sql=generateLeftJoin2Sql({
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
            model:organizationUserModel,
            columns:["user_id"],
            expression:{
                id:{
                    model:teamUserModel,
                    field:"organization_user_id"
                }
            }
        }, {
            user_id:{
                model:organizationUserModel,
                value:userId
            },
            organization_id:{
                model:teamModel,
                value:organizationId
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
        })
        let ret=await mysql.execute(sql)
        return ret.map(item=>item.team)
    }

    async users(userIds:string[],organizationId?:string):Promise<({nickname?:string} & ICommon_Model_User)[]> {
        if(userIds.length==0) {
            return []
        }
        let mysql=getMysqlInstance()
        if(organizationId) {
            let sql=generateLeftJoinSql({
                model:organizationUserModel,
                columns:["nickname"]
            },{
                model:userModel,
                columns:keys<ICommon_Model_User>().map(item=>item.name),
                expression:{
                    id:{
                        model:organizationUserModel,
                        field:"user_id"
                    }
                }
            },{
                organization_id:{
                    model:organizationUserModel,
                    value:organizationId
                },
                user_id:{
                    model:organizationUserModel,
                    value:{
                        exp:"in",
                        value:userIds
                    }
                }
            },"and",{
                field:"user_id",
                model:organizationUserModel,
                type:"field",
                value:userIds
            })
            let ret=await mysql.execute(sql);
            return ret;
        } else {
            let arr=await mysql.execute(generateQuerySql(userModel,null,{
                id:{
                    exp:"in",
                    value:userIds
                }
            },"and",{
                field:"id",
                type:"field",
                value:userIds
            }))
            return arr;
        }

    }

    async filter(name:string,size:number)
    {
        if(!name) {
            throw Err.User.userNameNotExists
        } else if(!size) {
            throw Err.Common.paramError
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(userModel,["id","username","photo"],{
            active:1,
            username:{
                exp:"%like%",
                value:name
            },
            role:{
                exp:"<>",
                value:ECommon_User_Type.DELETED
            }
        },"and",{
            field:"username",
            type:"asc"
        },0,size))
        return ret;
    }

    async getDeletedUser() {
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(userModel,null,{
            role:ECommon_User_Type.DELETED
        }))
        return obj;
    }
}
export let userMapper=new UserMapper()


class UserSettingMapper extends Mapper<typeof userSettingModel> {
    constructor() {
        super(userSettingModel)
    }
}
export let userSettingMapper=new UserSettingMapper()