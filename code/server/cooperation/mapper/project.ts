import {ICommon_Model_Project, projectModel, Table_Project} from '../../../common/model/project';
import {workflowNodeModel} from '../../../common/model/workflow_node';
import {Err} from '../../../common/status/error';
import {getMysqlInstance} from '../../common/db/mysql';
import {Mapper} from "../../common/entity/mapper";
import CommonUtil from "../../common/util/common";
import {generateDeleteSql, generateGroupLeftJoin2Sql, generateQuerySql} from '../../common/util/sql';
import {projectIssueModel} from './../../../common/model/project_issue';
import {ECommon_Model_Workflow_Node_Status} from './../../../common/model/workflow_node';

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
}
export let projectMapper=new ProjectMapper
