import {ICommon_Model_Project, projectModel} from "../../../common/model/project";
import {ICommon_Model_Project_Issue, projectIssueModel} from "../../../common/model/project_issue";
import {ICommon_Model_Project_Label, projectLabelModel} from "../../../common/model/project_label";
import {ICommon_Model_Project_Module, projectModuleModel} from "../../../common/model/project_module";
import {workflowNodeModel} from "../../../common/model/workflow_node";
import {ICommon_Route_Res_Project_filter} from "../../../common/routes/response";
import {Err} from "../../../common/status/error";
import {keys} from "../../../common/transform";
import {getMysqlInstance} from '../../common/db/mysql';
import {Mapper} from "../../common/entity/mapper";
import {
    generateBatchCreateSql,
    generateCreateSql,
    generateDeleteSql,
    generateLeftJoin2Sql,
    generateLeftJoin3Sql,
    generateLeftJoinSql,
    generateQuerySql,
    generateSnowId,
    generateUpdateSql
} from '../../common/util/sql';
import {workflowNodeFieldTypeModel} from '../../../common/model/workflow_node_field_type';
import {ICommon_Model_Issue_Type, issueTypeModel} from './../../../common/model/issue_type';
import {projectIssueDescriptionModel} from './../../../common/model/project_issue_description';
import {
    ICommon_Model_Project_Issue_Field_Value,
    projectIssueFieldValueModel
} from './../../../common/model/project_issue_field_value';
import {projectIssueParentModel} from './../../../common/model/project_issue_parent';
import {projectIssueProcessModel} from './../../../common/model/project_issue_process';
import {projectIssueRelatedModel} from './../../../common/model/project_issue_related';
import {projectLabelIssueModel} from './../../../common/model/project_label_issue';
import {projectModuleIssueModel} from './../../../common/model/project_module_issue';
import {ICommon_Model_Workflow_Node} from './../../../common/model/workflow_node';

class ProjectIssueMapper extends Mapper<typeof projectIssueModel> {
    constructor() {
        super(projectIssueModel)
    }
    async createFieldValues(values:ICommon_Model_Project_Issue_Field_Value[]) {
        if(!Array.isArray(values) || values.length==0) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateBatchCreateSql(projectIssueFieldValueModel,values))
    }

    async updateFieldValue(value:ICommon_Model_Project_Issue_Field_Value) {
        if(!value) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(projectIssueFieldValueModel,value,{
            workflow_node_field_type_id:value.workflow_node_field_type_id,
            project_issue_id:value.project_issue_id
        }))
    }

    async handleProcess(projectIssueId:string,workflowNodeId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        } else if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(projectIssueProcessModel,[],{
            project_issue_id:projectIssueId
        }))
        if(!obj) {
            await mysql.execute(generateCreateSql(projectIssueProcessModel,{
                id:await generateSnowId(),
                project_issue_id:projectIssueId,
                workflow_node_process:[workflowNodeId]
            }))
        } else if(!obj.workflow_node_process) {
            await mysql.execute(generateUpdateSql(projectIssueProcessModel,{
                workflow_node_process:[workflowNodeId]
            },{
                project_issue_id:projectIssueId
            }))
        } else {
            let process=obj.workflow_node_process;
            if(process.includes(workflowNodeId)) {
                let index=process.indexOf(workflowNodeId)
                let arrDelete=process.splice(index+1)
                for(let nodeId of arrDelete) {
                    let arr=await mysql.execute(generateQuerySql(workflowNodeFieldTypeModel,["id"],{
                        workflow_node_id:nodeId,
                    }))
                    await mysql.execute(generateDeleteSql(projectIssueFieldValueModel,{
                        workflow_node_field_type_id:{
                            exp:"in",
                            value:arr.map(item=>item.id)
                        },
                        project_issue_id:projectIssueId
                    }))
                }
            } else {
                process=process.concat(workflowNodeId)
            }
            await mysql.execute(generateUpdateSql(projectIssueProcessModel,{
                workflow_node_process:process
            },{
                project_issue_id:projectIssueId
            }))
        }
    }

    async getProcess(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(projectIssueProcessModel,[],{
            project_issue_id:projectIssueId
        }))
        if(!obj || !obj.workflow_node_process) {
            return null
        }
        return obj.workflow_node_process
    }

    async getFieldValues(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(projectIssueFieldValueModel,[],{
            project_issue_id:projectIssueId
        }))
        return ret;
    }

    async editDescription(projectIssueId:string,description:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        if(!description) {
            description=null;
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(projectIssueDescriptionModel,["id"],{
            project_issue_id:projectIssueId
        }))
        if(ret) {
            await mysql.execute(generateUpdateSql(projectIssueDescriptionModel,{
                content:description
            },{
                project_issue_id:projectIssueId
            }))
        } else {
            await mysql.execute(generateCreateSql(projectIssueDescriptionModel,{
                id:await generateSnowId(),
                project_issue_id:projectIssueId,
                content:description
            }))
        }
    }

    async getDescription(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(projectIssueDescriptionModel,[],{
            project_issue_id:projectIssueId
        }))
        if(!ret) {
            return null
        }
        return ret.content
    }

    async clear(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectIssueDescriptionModel,{
            project_issue_id:projectIssueId
        }))
        await mysql.execute(generateDeleteSql(projectIssueFieldValueModel,{
            project_issue_id:projectIssueId
        }))
        await mysql.execute(generateDeleteSql(projectIssueParentModel,{
            parent_id:projectIssueId,
            child_id:projectIssueId
        },"or"))
        await mysql.execute(generateDeleteSql(projectIssueProcessModel,{
            project_issue_id:projectIssueId
        }))
        await mysql.execute(generateDeleteSql(projectIssueRelatedModel,{
            project_issue_1_id:projectIssueId,
            project_issue_2_id:projectIssueId
        },"or"))
        
    }

    async getBasicInfo(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoin3Sql({
            model:projectIssueModel,
            columns:keys<Omit<ICommon_Model_Project_Issue,"issue_type_id"|"workflow_node_id"|"project_id">>().map(item=>item.name)
        },{
            model:workflowNodeModel,
            columns:keys<ICommon_Model_Workflow_Node>().map(item=>item.name),
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"workflow_node_id"
                }
            },
            aggregation:"workflowNode"
        },{
            model:issueTypeModel,
            columns:keys<ICommon_Model_Issue_Type>().map(item=>item.name),
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"issue_type_id"
                }
            },
            aggregation:"issueType"
        },{
            model:projectModel,
            columns:keys<ICommon_Model_Project>().map(item=>item.name),
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"project_id"
                }
            },
            aggregation:"project"
        },{
            id:{
                model:projectIssueModel,
                value:projectIssueId
            }
        })
        let ret=await mysql.executeOne(sql);
        return ret;
    }

    async getItemByUniqueId(uniqueId:number) {
        if(!uniqueId) {
            throw  Err.Project.ProjectIssue.uniqueKeyError
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(projectIssueModel,[],{
            unique_id:uniqueId
        }))
        return ret;
    }

    async copyIssue(projectIssueId:string,newProjectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let description=await mysql.executeOne(generateQuerySql(projectIssueDescriptionModel,[],{
            project_issue_id:projectIssueId
        }))
        if(description) {
            await mysql.execute(generateCreateSql(projectIssueDescriptionModel,{
                id:await generateSnowId(),
                project_issue_id:newProjectIssueId,
                content:description.content
            }))
        }
        let fieldValues=await mysql.execute(generateQuerySql(projectIssueFieldValueModel,[],{
            project_issue_id:projectIssueId
        }))
        for(let obj of fieldValues) {
            obj.id=await generateSnowId()
            obj.project_issue_id=newProjectIssueId
        }
        if(fieldValues.length>0) {
            await mysql.execute(generateBatchCreateSql(projectIssueFieldValueModel,fieldValues))
        }
        let process=await mysql.executeOne(generateQuerySql(projectIssueProcessModel,[],{
            project_issue_id:projectIssueId
        }))
        if(process) {
            await mysql.execute(generateCreateSql(projectIssueProcessModel,{
                id:await generateSnowId(),
                project_issue_id:newProjectIssueId,
                workflow_node_process:process.workflow_node_process
            }))
        }
        let projectLabelIssues=await mysql.execute(generateQuerySql(projectLabelIssueModel,[],{
            project_issue_id:projectIssueId
        }))
        if(projectLabelIssues.length>0) {
            for(let obj of projectLabelIssues) {
                obj.id=await generateSnowId()
                obj.project_issue_id=newProjectIssueId
            }
            await mysql.execute(generateBatchCreateSql(projectLabelIssueModel,projectLabelIssues))
        }
        let projectModuleIssues=await mysql.execute(generateQuerySql(projectModuleIssueModel,[],{
            project_issue_id:projectIssueId
        }))
        if(projectModuleIssues.length>0) {
            for(let obj of projectModuleIssues) {
                obj.id=await generateSnowId()
                obj.project_issue_id=newProjectIssueId
            }
            await mysql.execute(generateBatchCreateSql(projectModuleIssueModel,projectModuleIssues))
        }
    }

    async addChildIssue(projectParentIssueId:string,projectChildIssueId:string) {
        if(!projectParentIssueId || !projectChildIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(projectIssueParentModel,["id"],{
            parent_id:projectParentIssueId,
            child_id:projectChildIssueId
        }))
        if(obj) {
            throw Err.Project.ProjectIssue.parentChildExists
        }
        await mysql.execute(generateCreateSql(projectIssueParentModel,{
            id:await generateSnowId(),
            parent_id:projectParentIssueId,
            child_id:projectChildIssueId
        }))
    }

    async removeChildIssue(projectParentIssueId:string,projectChildIssueId:string) {
        if(!projectParentIssueId || !projectChildIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectIssueParentModel,{
            parent_id:projectParentIssueId,
            child_id:projectChildIssueId
        }))
    }

    async addRelatedIssue(projectIssue1Id:string,projectIssue2Id:string) {
        if(!projectIssue1Id || !projectIssue2Id) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(projectIssueRelatedModel,[],{
            project_issue_1_id:{
                exp:"in",
                value:[projectIssue1Id,projectIssue2Id]
            },
            project_issue_2_id:{
                exp:"in",
                value:[projectIssue1Id,projectIssue2Id]
            }
        }))
        if(ret) {
            throw Err.Project.ProjectIssue.relatedExists
        }
        await mysql.execute(generateCreateSql(projectIssueRelatedModel,{
            id:await generateSnowId(),
            project_issue_1_id:projectIssue1Id,
            project_issue_2_id:projectIssue2Id
        }))
    }

    async removeRelatedIssue(projectIssue1Id:string,projectIssue2Id:string) {
        if(!projectIssue1Id || !projectIssue2Id) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectIssueRelatedModel,{
            project_issue_1_id:{
                exp:"in",
                value:[projectIssue1Id,projectIssue2Id]
            },
            project_issue_2_id:{
                exp:"in",
                value:[projectIssue1Id,projectIssue2Id]
            }
        }))
    }

    async childIssueList(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:projectIssueParentModel
        },{
            model:projectIssueModel,
            columns:keys<ICommon_Model_Project_Issue>().map(item=>item.name),
            expression:{
                id:{
                    model:projectIssueParentModel,
                    field:"child_id"
                }
            }
        },{
            parent_id:{
                model:projectIssueParentModel,
                value:projectIssueId
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }

    async parentIssue(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:projectIssueParentModel
        },{
            model:projectIssueModel,
            columns:keys<ICommon_Model_Project_Issue>().map(item=>item.name),
            expression:{
                id:{
                    model:projectIssueParentModel,
                    field:"parent_id"
                }
            }
        },{
            child_id:{
                model:projectIssueParentModel,
                value:projectIssueId
            }
        })
        let ret=await mysql.executeOne(sql)
        return ret;
    }

    async relatedIssueList(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let sql1=generateLeftJoinSql({
            model:projectIssueRelatedModel
        },{
            model:projectIssueModel,
            columns:keys<ICommon_Model_Project_Issue>().map(item=>item.name),
            expression:{
                id:{
                    model:projectIssueRelatedModel,
                    field:"project_issue_2_id"
                }
            }
        },{
            project_issue_1_id:{
                model:projectIssueRelatedModel,
                value:projectIssueId
            }
        })
        let ret1=await mysql.execute(sql1)
        let sql2=generateLeftJoinSql({
            model:projectIssueRelatedModel
        },{
            model:projectIssueModel,
            columns:keys<ICommon_Model_Project_Issue>().map(item=>item.name),
            expression:{
                id:{
                    model:projectIssueRelatedModel,
                    field:"project_issue_1_id"
                }
            }
        },{
            project_issue_2_id:{
                model:projectIssueRelatedModel,
                value:projectIssueId
            }
        })
        let ret2=await mysql.execute(sql2)
        return [...ret1,...ret2];
    }

    async issueLabelList(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:projectLabelIssueModel
        },{
            model:projectLabelModel,
            columns:keys<ICommon_Model_Project_Label>().map(item=>item.name),
            expression:{
                id:{
                    model:projectLabelIssueModel,
                    field:"project_label_id"
                }
            }
        },{
            project_issue_id:{
                model:projectLabelIssueModel,
                value:projectIssueId
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }

    async issueModuleList(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:projectModuleIssueModel
        },{
            model:projectModuleModel,
            columns:keys<ICommon_Model_Project_Module>().map(item=>item.name),
            expression:{
                id:{
                    model:projectModuleIssueModel,
                    field:"project_module_id"
                }
            }
        },{
            project_issue_id:{
                model:projectModuleIssueModel,
                value:projectIssueId
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }

    async bindIssueLabel(projectIssueId:string,projectLabelId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        } else if(!projectLabelId) {
            throw Err.Project.Label.labelNotfound
        }
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(projectLabelIssueModel,[],{
            project_issue_id:projectIssueId,
            project_label_id:projectLabelId
        }))
        if(obj) {
            throw Err.Project.Label.labelIssueExists
        }
        await mysql.execute(generateCreateSql(projectLabelIssueModel,{
            id:await generateSnowId(),
            project_issue_id:projectIssueId,
            project_label_id:projectLabelId
        }))
    }

    async unbindIssueLabel(projectIssueId:string,projectLabelId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        } else if(!projectLabelId) {
            throw Err.Project.Label.labelNotfound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectLabelIssueModel,{
            project_issue_id:projectIssueId,
            project_label_id:projectLabelId
        }))
    }

    async bindIssueModule(projectIssueId:string,projectModuleId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        } else if(!projectModuleId) {
            throw Err.Project.Module.moduleNotFound
        }
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(projectModuleIssueModel,[],{
            project_issue_id:projectIssueId,
            project_module_id:projectModuleId
        }))
        if(obj) {
            throw Err.Project.Module.moduleIssueExists
        }
        await mysql.execute(generateCreateSql(projectModuleIssueModel,{
            id:await generateSnowId(),
            project_issue_id:projectIssueId,
            project_module_id:projectModuleId
        }))
    }

    async unbindIssueModule(projectIssueId:string,projectModuleId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        } else if(!projectModuleId) {
            throw Err.Project.Module.moduleNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectModuleIssueModel,{
            project_issue_id:projectIssueId,
            project_module_id:projectModuleId
        }))
    }

    async filter(projectId :string,page :number,size :number,createdBy? :string,issueTypeId? :string,name? :string,priority? :number,assignerId? :string,reporterId? :string,status? :number,moduleId? :string,labelId? :string):Promise<ICommon_Route_Res_Project_filter[]> {
        if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let mysql=getMysqlInstance()
        let setId:Set<string>=new Set;
        if(moduleId) {
            let arrModuleIssueId=(await mysql.execute(generateQuerySql(projectModuleIssueModel,["id"],{
                project_module_id:moduleId
            }))).map(item=>item.id)
            for(let obj of arrModuleIssueId) {
                setId.add(obj)
            }
        }
        if(labelId) {
            let arrLabelIssueId=(await mysql.execute(generateQuerySql(projectLabelIssueModel,["id"],{
                project_label_id:labelId
            }))).map(item=>item.id)
            for(let obj of arrLabelIssueId) {
                setId.add(obj)
            }
        }
        let sql=generateLeftJoin2Sql({
            model:projectIssueModel,
            columns:["id","assigner_id","reporter_id","unique_id","name","unique_id","created_time","created_by"]
        },{
            model:issueTypeModel,
            columns:["id","icon","name"],
            aggregation:"issueType",
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"issue_type_id"
                }
            }
        },{
            model:workflowNodeModel,
            columns:["status"],
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"workflow_node_id"
                }
            }
        },{
            project_id:{
                model:projectIssueModel,
                value:projectId
            },
            ...(createdBy && {
                created_by:{
                    model:projectIssueModel,
                    value:createdBy
                }
            }),
            ...(issueTypeId && {
                issue_type_id:{
                    model:issueTypeModel,
                    value:issueTypeId
                }
            }),
            ...(name && {
                name:{
                    model:projectIssueModel,
                    value:{
                        exp:"%like%",
                        value:name
                    }
                }
            }),
            ...(Number.isInteger(priority) && {
                priority:{
                    model:projectIssueModel,
                    value:priority
                }
            }),
            ...(assignerId && {
                assigner_id:{
                    model:projectIssueModel,
                    value:assignerId
                }
            }),
            ...(reporterId && {
                reporter_id:{
                    model:projectIssueModel,
                    value:reporterId
                }
            }),
            ...(status && {
                status:{
                    model:workflowNodeModel,
                    value:status
                }
            }),
            ...(((labelId || moduleId) && setId.size>0) && {
                id:{
                    model:projectIssueModel,
                    value:{
                        exp:"in",
                        value:Array.from(setId)
                    }
                }
            }),
        },"and",{
            model:projectIssueModel,
            field:"name",
            type:"asc"
        },page*size,size)
        let ret=await mysql.execute(sql)
        return ret;
    }

    async clearMany(projectIssueIds:string[]) {
        if(!projectIssueIds) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectIssueModel,{
            id:{
                exp:"in",
                value:projectIssueIds
            }
        }))
        await mysql.execute(generateDeleteSql(projectIssueDescriptionModel,{
            project_issue_id:{
                exp:"in",
                value:projectIssueIds
            }
        }))
        await mysql.execute(generateDeleteSql(projectIssueFieldValueModel,{
            project_issue_id:{
                exp:"in",
                value:projectIssueIds
            }
        }))
        await mysql.execute(generateDeleteSql(projectIssueParentModel,{
            parent_id:{
                exp:"in",
                value:projectIssueIds
            },
            child_id:{
                exp:"in",
                value:projectIssueIds
            }
        },"or"))
        await mysql.execute(generateDeleteSql(projectIssueProcessModel,{
            project_issue_id:{
                exp:"in",
                value:projectIssueIds
            }
        }))
        await mysql.execute(generateDeleteSql(projectIssueRelatedModel,{
            project_issue_1_id:{
                exp:"in",
                value:projectIssueIds
            },
            project_issue_2_id:{
                exp:"in",
                value:projectIssueIds
            }
        },"or"))
    }

    async getIdsByProjectIds(projectIds:string[]){
        if(!projectIds || projectIds.length==0) {
            return []
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(projectIssueModel,["id"],{
            project_id:{
                exp:"in",
                value:projectIds
            }
        },"and",{
            field:"project_id",
            type:"field",
            value:projectIds
        }))
        return ret.map(item=>item.id);
    }

    async clearIssueValueByFieldTypeId(workflowFieldTypeId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectIssueFieldValueModel,{
            workflow_node_field_type_id:workflowFieldTypeId
        }))
    }

}

export let projectIssueMapper=new ProjectIssueMapper