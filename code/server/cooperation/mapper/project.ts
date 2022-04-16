import { ICommon_Model_Project, projectModel, Table_Project } from '../../../common/model/project';
import { workflowNodeModel } from '../../../common/model/workflow_node';
import { Err } from '../../../common/status/error';
import { getMysqlInstance } from '../../common/db/mysql';
import { Mapper } from "../../common/entity/mapper";
import CommonUtil from "../../common/util/common";
import { generateCreateSql, generateDeleteSql, generateGroupLeftJoin2Sql, generateLeftJoin3Sql, generateLeftJoinSql, generateQuerySql, generateSnowId, generateUpdateSql } from '../../common/util/sql';
import { projectIssueModel } from './../../../common/model/project_issue';
import { ECommon_Model_Project_Member_Type, projectMemberModel, Table_Project_Member } from './../../../common/model/project_member';
import { ICommon_Model_Project_Role, projectRoleModel } from './../../../common/model/project_role';
import { teamModel } from './../../../common/model/team';
import { teamUserModel } from './../../../common/model/team_user';
import { userModel } from './../../../common/model/user';
import { ECommon_Model_Workflow_Node_Status } from './../../../common/model/workflow_node';
import { ICommon_Route_Res_Project_ListMemeber } from './../../../common/routes/response';
class ProjectMapper extends Mapper<typeof projectModel>{
    constructor(){
        super(projectModel)
    }
    async listMember(projectId:string,page:number,size:number):Promise<ICommon_Route_Res_Project_ListMemeber> {
        if(!projectId || page===undefined || page<0 || size===undefined || size<=0) {
            throw Err.Common.paramError
        }
        let mysql=getMysqlInstance()
        let data:ICommon_Route_Res_Project_ListMemeber["data"]=[];
        let count=Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_Project_Member} where project_id='${projectId}'`))[0]
        let totalPage=CommonUtil.pageTotal(count,size)
        if(count>0) {
            let sql=generateLeftJoin3Sql({
                model:projectMemberModel,
                columns:["member_id","type"],
                rename:{
                    fields:["member_id"],
                    newFields:["id"]
                }
            },{
                model:projectRoleModel,
                columns:["id","name"],
                expression:{
                    id:{
                        model:projectMemberModel,
                        field:"role_id"
                    }
                },
                aggregation:"role"
            },{
                model:userModel,
                columns:["id","username","photo"],
                expression:{
                    id:{
                        model:projectMemberModel,
                        field:"member_id"
                    }
                },
                aggregation:"user",
                rename:{
                    fields:["username"],
                    newFields:["name"]
                }
            },{
                model:teamModel,
                columns:["id","name","photo"],
                expression:{
                    id:{
                        model:projectMemberModel,
                        field:"member_id"
                    }
                },
                aggregation:"team"
            },{
                project_id:{
                    model:projectMemberModel,
                    value:projectId
                }
            },"and",{
                field:"created_time",
                model:projectMemberModel,
                type:"desc"
            },page*size,size)
            let ret=await mysql.execute(sql)
            for(let obj of ret){
                let o=<typeof data[0]>{};
                o.id=obj.id;
                o.type=obj.type;
                o.role=obj.role;
                if(obj.user.id){
                    o.name=obj.user.name;
                    o.photo=obj.user.photo;
                } else {
                    o.name=obj.team.name;
                    o.photo=obj.team.photo;
                }
                data.push(o)
            }
        }
        return {
            count:count,
            totalPage:totalPage,
            page:page,
            data:data
        }
    }

    async addMember(projectId:string,memberId:string,type:ECommon_Model_Project_Member_Type,roleId:string) {
        if(!projectId) {
            throw  Err.Project.projectNotFound
        } else if(!memberId) {
            throw Err.User.userIdNotExists
        } else if(!roleId) {
            throw Err.Role.roleNotFound
        }
        let mysql=getMysqlInstance()
        let existsMemeber=await mysql.executeOne(generateQuerySql(projectMemberModel,[],{
            member_id:memberId,
            project_id:projectId
        }))
        if(existsMemeber) {
            throw Err.Project.Member.memberExists
        }
        let existsRole=await mysql.executeOne(generateQuerySql(projectRoleModel,[],{
            id:roleId
        }))
        if(!existsRole) {
            throw Err.Role.roleNotExists
        }
        let isUser=false,isTeam=false;
        let objUser=await mysql.executeOne(generateQuerySql(userModel,null,{
            id:memberId
        }))
        if(objUser) {
            isUser=true
        } else {
            let objTeam=await mysql.executeOne(generateQuerySql(teamModel,[],{
                id:memberId
            }))
            if(objTeam){
                isTeam=true
            }
        }
        if((isUser && type==ECommon_Model_Project_Member_Type.USER) || (isTeam && type==ECommon_Model_Project_Member_Type.TEAM)) {
            await mysql.execute(generateCreateSql(projectMemberModel,{
                member_id:memberId,
                role_id:roleId,
                project_id:projectId,
                type:type,
                id:await generateSnowId()
            }))
        } else {
            throw Err.Project.Member.memberNotMatch
        }
        
    }

    async removeMember(projectId:string,memberId:string) {
        if(!projectId) {
            throw  Err.Project.projectNotFound
        } else if(!memberId) {
            throw Err.Project.Member.memberNotExists
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectMemberModel,{
            project_id:projectId,
            member_id:memberId
        }))
    }

    async changeRole(projectId:string,memberId:string,roleId:string) {
        if(!projectId) {
            throw  Err.Project.projectNotFound
        } else if(!memberId) {
            throw Err.Project.Member.memberNotExists
        } else if(!roleId) {
            throw Err.Role.roleNotFound
        }
        let mysql=getMysqlInstance()
        let existsMemeber=await mysql.executeOne(generateQuerySql(projectMemberModel,[],{
            member_id:memberId,
            project_id:projectId
        }))
        if(!existsMemeber) {
            throw Err.Project.Member.memberNotExists
        }
        let existsRole=await mysql.executeOne(generateQuerySql(projectRoleModel,[],{
            id:roleId
        }))
        if(!existsRole) {
            throw Err.Role.roleNotExists
        }
        await mysql.execute(generateUpdateSql(projectMemberModel,{
            role_id:roleId
        },{
            member_id:memberId,
            project_id:projectId
        }))
    }

    async clearMember(projectId:string) {
        if(!projectId) {
            throw  Err.Project.projectNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectMemberModel,{
            project_id:projectId
        }))
    }

    async list(page:number,size:number,keyword?:string,userId?:string):Promise<{
        count:number,
        totalPage:number,
        data:ICommon_Model_Project[]
    }> {
        if(page===undefined || page<0 || size===undefined || size<=0) {
            throw Err.Common.paramError
        }
        var mysql=getMysqlInstance();
        let str=`select count(1) from ${Table_Project}`,keywrodStr="",userIdStr=""
        if(keyword) {
            keywrodStr=`name like '%${keyword}%'`
        }
        if(userId) {
            userIdStr=`id in (select project_id from ${Table_Project_Member} where member_id='${userId}')`
        }
        if(keywrodStr && userIdStr) {
            str+=" where "+keywrodStr+" and "+userIdStr
        } else if(keywrodStr) {
            str+=" where "+keywrodStr
        } else if(userIdStr) {
            str+=" where "+userIdStr
        }
        let count=Object.values(await mysql.executeOne<number>(str))[0]
        let totalPage=CommonUtil.pageTotal(count,size)
        let ret=await mysql.execute(generateQuerySql(projectModel,[],{
            ...(keyword && {
                name:{
                    exp:"%like%",
                    value:keyword
                }
            }),
            ...(userId && {
                id:{
                    exp:"in",
                    value:`select project_id from ${Table_Project_Member} where member_id='${userId}'`
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

    async getRoles(projectId:string):Promise<ICommon_Model_Project_Role[]> {
        if(!projectId) {
            throw  Err.Project.projectNotFound
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.execute(generateQuerySql(projectRoleModel,null,{
            project_id:{
                type:"or",
                values:[
                    {
                        exp:"is null"
                    },
                    {
                        value:projectId,
                        exp:"="
                    }
                ]
            }
        }))
        return ret
    }

    async getRoleByName(name:string,projectId:string):Promise<ICommon_Model_Project_Role> {
        if(!name) {
            throw  Err.Common.paramError
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(projectRoleModel,null,{
            project_id:projectId?projectId:{
                exp:"is null"
            },
            name:name
        }))
        return ret
    }

    async getItemByKeyword(keyword:string) {
        if(!keyword) {
            throw  Err.Project.projectKeywordNotFound
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(projectModel,null,{
            keyword:keyword
        }))
        return ret
    }

    async recentProjectList(userId:string) {
        if(!userId) {
            throw Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        let sql=generateGroupLeftJoin2Sql({
            model:projectIssueModel
        },{
            model:workflowNodeModel,
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"workflow_node_id"
                }
            },
            columns:{
                columns:[],
                calcColumns:[{
                    exp:"sum",
                    value:{
                        field:"status",
                        exp:"=",
                        value:ECommon_Model_Workflow_Node_Status.NOTSTART
                    },
                    rename:"notstart"
                },{
                    exp:"sum",
                    value:{
                        field:"status",
                        exp:"=",
                        value:ECommon_Model_Workflow_Node_Status.INPROGRESS
                    },
                    rename:"inprogress",
                },{
                    exp:"sum",
                    value:{
                        field:"status",
                        exp:"=",
                        value:ECommon_Model_Workflow_Node_Status.DONE
                    },
                    rename:"done"
                }]
            }
        },{
            model:projectModel,
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"project_id"
                }
            },
            columns:{
                columns:["id","name","photo"],
                calcColumns:[]
            }
        },["project_id"],{
            assigner_id:{
                model:projectIssueModel,
                value:userId
            },
            reporter_id:{
                model:projectIssueModel,
                value:userId
            },
        },"or",null,"and",{
            isVitualField:true,
            field:"notstart",
            model:workflowNodeModel,
            type:"desc"
        },0,20)
        let ret=await mysql.execute(sql)
        return ret;
    }

    async listUser(projectId:string,keyword?:string) {
        if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let userMap=new Map<string,{
            id:string,
            username:string,
            photo:string
        }>()
        var mysql=getMysqlInstance();
        let sql1=generateLeftJoinSql({
            model:projectMemberModel
        },{
            model:userModel,
            columns:["id","photo","username"],
            expression:{
                id:{
                    model:projectMemberModel,
                    field:"member_id"
                }
            }
        },{
            type:{
                model:projectMemberModel,
                value:ECommon_Model_Project_Member_Type.USER
            },
            project_id:{
                model:projectMemberModel,
                value:projectId
            },
            ...(keyword && {
                username:{
                    model:userModel,
                    value:{
                        exp:"%like%",
                        value:keyword
                    }
                }
            })
        })
        let users=await mysql.execute(sql1)
        for(let user of users) {
            if(!userMap.has(user.id)) {
                userMap.set(user.id,user);
            }
        }
        let teams = await mysql.execute(generateQuerySql(projectMemberModel,["member_id"],{
            type:ECommon_Model_Project_Member_Type.TEAM,
            project_id:projectId
        }))
        if(teams.length>0) {
            let sql = generateLeftJoinSql({
                model:teamUserModel
            },{
                model:userModel,
                columns:["id","photo","username"],
                expression:{
                    id:{
                        model:teamUserModel,
                        field:"user_id"
                    }
                }
            },{
                team_id:{
                    model:teamUserModel,
                    value:{
                        exp:"in",
                        value:teams.map(item=>item.member_id)
                    }
                },
                ...(keyword && {
                    username:{
                        model:userModel,
                        value:{
                            exp:"%like%",
                            value:keyword
                        }
                    }
                })
            })
            let arr=await mysql.execute(sql)
            for(let user of arr) {
                if(!userMap.has(user.id)) {
                    userMap.set(user.id,user);
                }
            }
        }
        let arr=Array.from(userMap.values());
        arr.sort(function(obj1,obj2) {
            if(obj1.username>obj2.username){
                return 1
            } else if(obj1.username<obj2.username) {
                return -1
            } else {
                return 0
            }
        })
        return arr;
    }
}
export let projectMapper=new ProjectMapper
