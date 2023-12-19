import {ICommon_Model_Project, projectModel, Table_Project} from "../../../common/model/project";
import {Err} from "../../../common/status/error";
import {keys} from "../../../common/transform";
import {getMysqlInstance} from "../../common/db/mysql";
import {Mapper} from "../../common/entity/mapper";
import {
    generateCreateSql,
    generateDeleteLeftJoinSql,
    generateDeleteSql,
    generateLeftJoinSql,
    generateQuerySql,
    generateSnowId,
    generateUpdateSql
} from "../../common/util/sql";
import {ICommon_Model_Issue_Type, issueTypeModel} from './../../../common/model/issue_type';
import {ICommon_Model_Issue_Type_Solution, issueTypeSolutionModel} from './../../../common/model/issue_type_solution';
import {
    projectIssueTypeSolutionModel,
    Table_Project_Issue_Type_Solution
} from './../../../common/model/project_issue_type_solution';
import CommonUtil from "../../common/util/common";
import {workflowActionModel} from "../../../common/model/workflow_action";
import {workflowNodeModel} from "../../../common/model/workflow_node";
import {workflowApprovalModel} from "../../../common/model/workflow_approval";
import {workflowNodeFieldTypeConfigModel} from "../../../common/model/workflow_node_field_type_config";
import {workflowNodeFieldTypeModel} from "../../../common/model/workflow_node_field_type";

class IssueTypeMapper extends Mapper<typeof issueTypeModel> {
    constructor() {
        super(issueTypeModel)
    }
    async list(issueTypeSolutionId:string):Promise<ICommon_Model_Issue_Type[]>
    {
        if(!issueTypeSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(issueTypeModel,[],{
            issue_type_solution_id:issueTypeSolutionId
        },null,{
            field:"name",
            type:"asc"
        }))
        return ret;
    }

}
export let issueTypeMapper=new IssueTypeMapper

class IssueTypeSolutionMapper extends Mapper<typeof issueTypeSolutionModel> {
    constructor() {
        super(issueTypeSolutionModel)
    }
    async list(organizationId:string):Promise<ICommon_Model_Issue_Type_Solution[]>
    {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let [reserved,notReserved]=await Promise.all([
            mysql.execute(generateQuerySql(issueTypeSolutionModel,null,{
                organization_id:organizationId,
                reserved:1
            })),
            mysql.execute(generateQuerySql(issueTypeSolutionModel,null,{
                organization_id:organizationId,
                reserved:0
            },"and",{
                field:"name",
                type:"asc"
            })),
        ])

        return reserved.concat(notReserved);
    }

    async getReservedItem(organizationId:string) {
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(issueTypeSolutionModel,[],{
            reserved:1,
            organization_id:organizationId
        }))
        return ret;
    }

    async bindProject(issueTypeSolutionId:string,projectId:string) {
        if(!issueTypeSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        } else if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateCreateSql(projectIssueTypeSolutionModel,{
            id:await generateSnowId(),
            project_id:projectId,
            issue_type_solution_id:issueTypeSolutionId
        }))
    }

    async updateProject(issueTypeSolutionId:string,projectId:string) {
        if(!issueTypeSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        } else if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(projectIssueTypeSolutionModel,{
            issue_type_solution_id:issueTypeSolutionId
        },{
            project_id:projectId
        }))
    }

    async unbindProject(issueTypeSolutionId:string,projectId:string,organizationId:string) {
        if(!issueTypeSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        } else if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let mysql=getMysqlInstance()
        let item=await this.getReservedItem(organizationId);
        await mysql.execute(generateUpdateSql(projectIssueTypeSolutionModel,{
            issue_type_solution_id:item.id
        },{
            project_id:projectId
        }))
    }

    async clearProjects(projectIds:string[]) {
        if(!projectIds || projectIds.length==0) {
            return;
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectIssueTypeSolutionModel,{
            project_id:{
                exp:"in",
                value:projectIds
            }
        }))
    }

    async resetProjects(issueTypeSolutionId:string,organizationId:string) {
        if(!issueTypeSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let item=await this.getReservedItem(organizationId);
        await mysql.execute(generateUpdateSql(projectIssueTypeSolutionModel,{
            issue_type_solution_id:item.id
        },{
            issue_type_solution_id:issueTypeSolutionId
        }))
    }

    async projectList(issueTypeSolutionId:string,page:number,size:number,keyword?:string) {
        if(!issueTypeSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let count:number
        count=Number(Object.values(await mysql.executeOne(`select count(1) from ${Table_Project_Issue_Type_Solution} pits left join ${Table_Project} p on p.id=pits.project_id where pits.issue_type_solution_id=${issueTypeSolutionId}${keyword?` and p.name like '%${keyword}%'`:""}`))[0])
        let totalPage=CommonUtil.pageTotal(count,size)
        let sql=generateLeftJoinSql({
            model:projectIssueTypeSolutionModel
        },{
            model:projectModel,
            columns:keys<ICommon_Model_Project>().map(item=>item.name),
            expression:{
                id:{
                    model:projectIssueTypeSolutionModel,
                    field:"project_id"
                }
            }
        },{
            issue_type_solution_id:{
                model:projectIssueTypeSolutionModel,
                value:issueTypeSolutionId
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
            count:size,
            totalPage:totalPage,
            page:page,
            data:ret
        }
    }

    async getItemByProjectId(projectId:string) {
        if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:projectIssueTypeSolutionModel
        },{
            model:issueTypeSolutionModel,
            columns:keys<ICommon_Model_Issue_Type_Solution>().map(item=>item.name),
            expression:{
                id:{
                    model:projectIssueTypeSolutionModel,
                    field:"issue_type_solution_id"
                }
            }
        },{
            project_id:{
                model:projectIssueTypeSolutionModel,
                value:projectId
            }
        })
        let ret=await mysql.executeOne(sql)
        return ret;
    }

    async clearByOrganizationId(organizationId:string):Promise<string[]> {
        if(!organizationId){
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let issueTypeSolutionList=await mysql.execute(generateQuerySql(issueTypeSolutionModel,["id"],{
            organization_id:organizationId
        }))
        if(issueTypeSolutionList.length>0) {
            let ids=issueTypeSolutionList.map(item=>item.id);
            let [_,__,issueTypeList]=await Promise.all([
                mysql.execute(generateDeleteSql(issueTypeSolutionModel,{
                    organization_id:organizationId
                })),
                mysql.execute(generateDeleteSql(projectIssueTypeSolutionModel,{
                    issue_type_solution_id:{
                        exp:"in",
                        value:ids
                    }
                })),
                mysql.execute(generateQuerySql(issueTypeModel,["id"],{
                    issue_type_solution_id:{
                        exp:"in",
                        value:issueTypeSolutionList.map(item=>item.id)
                    }
                },"and",{
                    field:"issue_type_solution_id",
                    type:"field",
                    value:issueTypeSolutionList.map(item=>item.id)
                }))
            ])
            if(issueTypeList.length>0) {
                let ids=issueTypeList.map(item=>item.id);
                let [_,__,workflowNodeList]=await Promise.all([
                    mysql.execute(generateDeleteSql(issueTypeModel,{
                        id:{
                            exp:"in",
                            value:ids
                        }
                    })),
                    mysql.execute(generateDeleteSql(workflowActionModel,{
                        issue_type_id:{
                            exp:"in",
                            value:ids
                        }
                    })),
                    mysql.execute(generateQuerySql(workflowNodeModel,["id"],{
                        issue_type_id:{
                            exp:"in",
                            value:ids
                        }
                    }))
                ])
                if(workflowNodeList.length>0) {
                    let workflowNodeIds=workflowNodeList.map(item=>item.id)
                    await Promise.all([
                        mysql.execute(generateDeleteSql(workflowNodeModel,{
                            id:{
                                exp:"in",
                                value:workflowNodeIds
                            }
                        })),
                        mysql.execute(generateDeleteSql(workflowApprovalModel,{
                            workflow_node_id:{
                                exp:"in",
                                value:workflowNodeIds
                            }
                        })),
                        mysql.execute(generateDeleteLeftJoinSql(workflowNodeFieldTypeModel,{
                            model:workflowNodeFieldTypeConfigModel,
                            expression:{
                                workflow_node_field_type_id:{
                                    model:workflowNodeFieldTypeModel,
                                    field:"id"
                                }
                            },
                            isDelete:true
                        },{
                            workflow_node_id:{
                                model:workflowNodeFieldTypeModel,
                                value:{
                                    exp:"in",
                                    value:workflowNodeIds
                                }
                            }
                        }))
                    ])
                }
            }
            return issueTypeList.map(item=>item.id);
        } else {
            return []
        }
    }

    async getIssueTypesByOrganizationId(organizationId:string):Promise<string[]> {
        if(!organizationId){
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let issueTypeSolutionList=await mysql.execute(generateQuerySql(issueTypeSolutionModel,["id"],{
            organization_id:organizationId
        }))
        if(issueTypeSolutionList.length>0) {
            let issueTypeList=await mysql.execute(generateQuerySql(issueTypeModel,["id"],{
                issue_type_solution_id:{
                    exp:"in",
                    value:issueTypeSolutionList.map(item=>item.id)
                }
            },"and",{
                field:"issue_type_solution_id",
                type:"field",
                value:issueTypeSolutionList.map(item=>item.id)
            }))
            return issueTypeList.map(item=>item.id);
        }

        return []
    }

}
export let issueTypeSolutionMapper=new IssueTypeSolutionMapper
