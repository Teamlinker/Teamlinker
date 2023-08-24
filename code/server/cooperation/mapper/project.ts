import {ICommon_Model_Project, projectModel, Table_Project} from '../../../common/model/project';
import {workflowNodeModel} from '../../../common/model/workflow_node';
import {Err} from '../../../common/status/error';
import {getMysqlInstance} from '../../common/db/mysql';
import {Mapper} from "../../common/entity/mapper";
import CommonUtil from "../../common/util/common";
import {
    convertCountSql,
    generateDeleteSql,
    generateGroupLeftJoin2Sql,
    generateGroupLeftJoin3Sql,
    generateQuerySql
} from '../../common/util/sql';
import {projectIssueModel} from './../../../common/model/project_issue';
import {ECommon_Model_Workflow_Node_Status} from './../../../common/model/workflow_node';
import {roleMemberModel, Table_Role_Member} from "../../../common/model/role_member";
import {Table_Team_User, teamUserModel} from "../../../common/model/team_user";
import {memberTagMemberModel, Table_Member_Tag_Member} from "../../../common/model/member_tag_member";
import {ECommon_Model_Organization_Member_Type} from "../../../common/model/organization";

class ProjectMapper extends Mapper<typeof projectModel>{
    constructor(){
        super(projectModel)
    }


    async list(organizationId:string,page:number,size:number,keyword?:string,organizationUserId?:string):Promise<{
        count:number,
        totalPage:number,
        data:ICommon_Model_Project[]
    }> {
        if(page===undefined || page<0 || size===undefined || size<=0) {
            throw Err.Common.paramError
        }
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance();
        let str=`select count(1) from ${Table_Project} where organization_id=${organizationId}`,keywordStr="",userIdStr=""
        if(keyword) {
            keywordStr=`name like '%${keyword}%'`
        }
        if(organizationUserId) {
            userIdStr=`created_by='${organizationUserId}'`
        }
        if(keywordStr && userIdStr) {
            str+=" and "+keywordStr+" and "+userIdStr
        } else if(keywordStr) {
            str+=" and "+keywordStr
        } else if(userIdStr) {
            str+=" and "+userIdStr
        }
        let count=Number(Object.values(await mysql.executeOne<number>(str))[0])
        let totalPage=CommonUtil.pageTotal(count,size)
        let ret=await mysql.execute(generateQuerySql(projectModel,[],{
            organization_id:organizationId,
            ...(keyword && {
                name:{
                    exp:"%like%",
                    value:keyword
                }
            }),
            ...(organizationUserId && {
                created_by:organizationUserId
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

    async recentProjectList(organizationUserId:string) {
        if(!organizationUserId) {
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
                    exp:"count",
                    value:{
                        field:"status",
                        exp:"=",
                        value:ECommon_Model_Workflow_Node_Status.NOTSTART
                    },
                    rename:"notstart"
                },{
                    exp:"count",
                    value:{
                        field:"status",
                        exp:"=",
                        value:ECommon_Model_Workflow_Node_Status.INPROGRESS
                    },
                    rename:"inprogress",
                },{
                    exp:"count",
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
                columns:["id","name","photo","keyword"],
                calcColumns:[]
            }
        },["project_id"],{
            assigner_id:{
                model:projectIssueModel,
                value:organizationUserId
            },
            reporter_id:{
                model:projectIssueModel,
                value:organizationUserId
            },
        },"or",null,"and",{
            isVirtualField:true,
            field:"notstart",
            model:workflowNodeModel,
            type:"desc"
        },0,20)
        let ret=await mysql.execute(sql)
        ret=ret.map(item=>{
            return {
                keyword:item.keyword,
                id:item.id,
                name:item.name,
                photo:item.photo,
                notstart:Number(item.notstart),
                inprogress:Number(item.inprogress),
                done:Number(item.done)
            }
        })
        return ret;
    }

    async userProjectList(organizationUserId:string,page:number,size:number,type:"all"|"created"|"joined",keyword?:string) {
        if(!organizationUserId) {
            throw Err.User.userIdNotExists
        }
        let mysql=getMysqlInstance();
        let calcCount=await mysql.executeOne<number>(`select count(1) from (select rm.item_id from ${Table_Role_Member} rm left join ${Table_Project} p on p.id=rm.item_id left join ${Table_Team_User} tu on tu.team_id=rm.member_id left join ${Table_Member_Tag_Member} mtm on mtm.member_tag_id=rm.member_id  where (rm.member_id='${organizationUserId}' or rm.member_type =${ECommon_Model_Organization_Member_Type.DEFAULT} or not isnull(tu.team_id) || not isnull(mtm.member_tag_id)) and not isnull(p.id)  ${type=="all"?``:type=="created"?`and p.created_by='${organizationUserId}'`:`and p.created_by<>'${organizationUserId}'`} ${keyword?` and p.name like '%${keyword}%'`:''} GROUP BY rm.item_id) as Z`)
        let count=Number(Object.values(calcCount)[0]);
        let totalPage=CommonUtil.pageTotal(count,size)
        let sql=generateGroupLeftJoin3Sql({
            model:roleMemberModel,
            columns:{
                columns:["item_id"],
                calcColumns:[]
            }
        },{
            model:projectModel,
            expression:{
                id:{
                    model:roleMemberModel,
                    field:"item_id"
                }
            }
        },{
            model:teamUserModel,
            expression:{
                team_id:{
                    model:roleMemberModel,
                    field:"member_id"
                }
            }
        },{
            model:memberTagMemberModel,
            expression:{
                member_tag_id:{
                    model:roleMemberModel,
                    field:"member_id"
                }
            }
        },["item_id"],{
            "$or0":{
                member_id:{
                    model:roleMemberModel,
                    value:organizationUserId
                },
                member_type:{
                    model:roleMemberModel,
                    value:ECommon_Model_Organization_Member_Type.DEFAULT
                },
                team_id:{
                    model:teamUserModel,
                    value:{
                        exp:"is not null"
                    }
                },
                member_tag_id: {
                    model:memberTagMemberModel,
                    value:{
                        exp:"is not null"
                    }
                }
            },
            id:{
                model:projectModel,
                value:{
                    exp:"is not null"
                }
            },
            ...(keyword && {
                name:{
                    model:projectModel,
                    value:{
                        exp:"%like%",
                        value:keyword
                    }
                }
            }),
            ...((type=="created" || type=="joined") && {
                created_by:{
                    model:projectModel,
                    value:{
                        exp:type=="created"?"=":"<>",
                        value:organizationUserId
                    }
                }
            })
        },"and",null,"and",{
            field:"name",
            model:projectModel,
            type:"asc",
            isVirtualField:false
        },page*size,size)
        let arr=await mysql.execute(sql);
        let arrProjectId=arr.map(item=>item.item_id);
        if(arrProjectId.length>0) {
            let sql=generateGroupLeftJoin2Sql({
                model:projectModel,
                columns:{
                    columns:["id","name","photo","keyword"],
                    calcColumns:[]
                }
            },{
                model:projectIssueModel,
                expression:{
                    project_id:{
                        model:projectModel,
                        field:"id"
                    }
                },
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
                        exp:"count",
                        value:{
                            field:"status",
                            exp:"=",
                            value:ECommon_Model_Workflow_Node_Status.NOTSTART
                        },
                        rename:"notstart"
                    },{
                        exp:"count",
                        value:{
                            field:"status",
                            exp:"=",
                            value:ECommon_Model_Workflow_Node_Status.INPROGRESS
                        },
                        rename:"inprogress",
                    },{
                        exp:"count",
                        value:{
                            field:"status",
                            exp:"=",
                            value:ECommon_Model_Workflow_Node_Status.DONE
                        },
                        rename:"done"
                    }]
                }
            },["id"],{
                id:{
                    model:projectModel,
                    value:{
                        exp:"in",
                        value:arrProjectId
                    }
                }
            },"and",null,"and",{
                isVirtualField:false,
                field:"id",
                model:projectModel,
                type:"field",
                value:arrProjectId
            },0,20)
            let ret=await mysql.execute(sql)
            ret=ret.map(item=>{
                return {
                    keyword:item.keyword,
                    id:item.id,
                    name:item.name,
                    photo:item.photo,
                    notstart:Number(item.notstart),
                    inprogress:Number(item.inprogress),
                    done:Number(item.done)
                }
            })
            return {
                page:page,
                count:count,
                totalPage:totalPage,
                data:ret
            }
        } else {
            return {
                page:page,
                count:count,
                totalPage:totalPage,
                data:[]
            }
        }
    }

    async getProjectListByOrganizationId(organizationId:string) {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(projectModel,[],{
            organization_id:organizationId
        },"and",{
            field:"name",
            type:"asc"
        }))
        return ret;
    }
    async clearProjects(projectIds:string[]){
        if(!projectIds || projectIds.length==0) {
            return;
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectModel,{
            id:{
                exp:"in",
                value:projectIds
            }
        }))
    }

    async issueCount(projectId:string) {
        if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let mysql=getMysqlInstance()
        let sql=convertCountSql(generateQuerySql(projectIssueModel,null,{
            project_id:projectId
        }))
        let count=Number(Object.values(await mysql.executeOne(sql))[0])
        return count
    }
}
export let projectMapper=new ProjectMapper
