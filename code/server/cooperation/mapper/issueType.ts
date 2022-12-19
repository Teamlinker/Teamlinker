import {ICommon_Model_Project, projectModel} from "../../../common/model/project";
import {Err} from "../../../common/status/error";
import {keys} from "../../../common/transform";
import {getMysqlInstance} from "../../common/db/mysql";
import {Mapper} from "../../common/entity/mapper";
import {
    generateCreateSql,
    generateDeleteSql,
    generateLeftJoinSql,
    generateQuerySql,
    generateSnowId,
    generateUpdateSql
} from "../../common/util/sql";
import {ICommon_Model_Issue_Type, issueTypeModel} from './../../../common/model/issue_type';
import {ICommon_Model_Issue_Type_Solution, issueTypeSolutionModel} from './../../../common/model/issue_type_solution';
import {projectIssueTypeSolutionModel} from './../../../common/model/project_issue_type_solution';

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
        let ret=await mysql.execute(generateQuerySql(issueTypeSolutionModel,[],{
            organization_id:organizationId
        },null,{
            field:"name",
            type:"asc"
        }))
        return ret;
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

    async projectList(issueTypeSolutionId:string) {
        if(!issueTypeSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let mysql=getMysqlInstance()
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
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
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
            await mysql.execute(generateDeleteSql(issueTypeSolutionModel,{
                organization_id:organizationId
            }))
            await mysql.execute(generateDeleteSql(projectIssueTypeSolutionModel,{
                issue_type_solution_id:{
                    exp:"in",
                    value:ids
                }
            }))
        }
        let issueTypeList=await mysql.execute(generateQuerySql(issueTypeModel,["id"],{
            issue_type_solution_id:{
                exp:"in",
                value:issueTypeSolutionList.map(item=>item.id)
            }
        }))
        if(issueTypeList.length>0) {
            let ids=issueTypeList.map(item=>item.id);
            await mysql.execute(generateDeleteSql(issueTypeModel,{
                issue_type_solution_id:{
                    exp:"in",
                    value:ids
                }
            }))
        }
        return issueTypeList.map(item=>item.id);
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
            }))
            return issueTypeList.map(item=>item.id);
        }

        return []
    }
}
export let issueTypeSolutionMapper=new IssueTypeSolutionMapper
