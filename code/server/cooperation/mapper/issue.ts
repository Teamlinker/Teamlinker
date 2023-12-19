import {ICommon_Model_Project, projectModel} from "../../../common/model/project";
import {ICommon_Model_Project_Issue, projectIssueModel} from "../../../common/model/project_issue";
import {ICommon_Model_Project_Label, projectLabelModel} from "../../../common/model/project_label";
import {ICommon_Model_Project_Module, projectModuleModel} from "../../../common/model/project_module";
import {workflowNodeModel} from "../../../common/model/workflow_node";
import {
    ICommon_Route_Res_Global_Search_Project_Issue_Item,
    ICommon_Route_Res_Project_Issue_filter
} from "../../../common/routes/response";
import {Err} from "../../../common/status/error";
import {keys} from "../../../common/transform";
import {getMysqlInstance} from '../../common/db/mysql';
import {Mapper} from "../../common/entity/mapper";
import {
    convertCountSql,
    generateBatchCreateOnUpdateSql,
    generateBatchCreateSql,
    generateCreateSql,
    generateDeleteLeftJoinSql,
    generateDeleteSql,
    generateGroupLeftJoin4Sql,
    generateLeftJoin3Sql,
    generateLeftJoinSql,
    generateQuerySql,
    generateSnowId,
    generateUpdateSql
} from '../../common/util/sql';
import {
    ECommon_Model_Workflow_Node_Field_Type_Label_Type,
    ICommon_Model_Workflow_Node_Field_Type,
    workflowNodeFieldTypeModel
} from '../../../common/model/workflow_node_field_type';
import {ICommon_Model_Issue_Type, issueTypeModel} from './../../../common/model/issue_type';
import {
    ICommon_Model_Project_Issue_Field_Value,
    projectIssueFieldValueModel
} from './../../../common/model/project_issue_field_value';
import {projectIssueParentModel} from './../../../common/model/project_issue_parent';
import {projectIssueProcessModel, Table_Project_Issue_Process} from './../../../common/model/project_issue_process';
import {projectIssueRelatedModel} from './../../../common/model/project_issue_related';
import {projectLabelIssueModel} from './../../../common/model/project_label_issue';
import {projectModuleIssueModel} from './../../../common/model/project_module_issue';
import {ICommon_Model_Workflow_Node} from './../../../common/model/workflow_node';
import CommonUtil from "../../common/util/common";
import {projectReleaseIssueModel} from "../../../common/model/project_release_issue";
import {projectIssueHistoryModel} from "../../../common/model/project_issue_history";
import {projectIssueApprovalModel} from "../../../common/model/project_issue_approval";
import {workflowNodeFieldTypeMapper} from "./field";
import {IssueTypeService} from "../service/issueType";
import {WorkflowService} from "../service/workflow";
import {WorkflowNodeFieldTypeService} from "../service/field";
import {ECommon_Field_Type, ICommon_Field_Type} from "../../../common/field/type";
import {ICommon_Model_Workflow_Node_Field_Type_Config} from "../../../common/model/workflow_node_field_type_config";
import {boardSprintIssueModel} from "../../../common/model/board_sprint_issue";
import {roleMemberModel} from "../../../common/model/role_member";
import {teamUserModel} from "../../../common/model/team_user";
import {memberTagMemberModel} from "../../../common/model/member_tag_member";
import {ECommon_Model_Organization_Member_Type} from "../../../common/model/organization";

class ProjectIssueMapper extends Mapper<typeof projectIssueModel> {
    constructor() {
        super(projectIssueModel)
    }
    async recentIssueList(organizationUserId:string,size:number) {
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:projectIssueModel,
            columns:keys<ICommon_Model_Project_Issue>().map(item=>item.name)
        },{
            model:projectModel,
            columns:keys<ICommon_Model_Project>().map(item=>item.name),
            aggregation:"project",
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"project_id"
                }
            }
        },{
            assigner_id:{
                model:projectIssueModel,
                value:organizationUserId
            },
            reporter_id:{
                model:projectIssueModel,
                value:organizationUserId
            }
        },"or",{
            field:"modified_time",
            type:"desc",
            model:projectIssueModel
        },0,size)
        let arr=await mysql.execute(sql)
        return arr;
    }

    async getAvailableUniqueId(projectId:string) {
        if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(projectIssueModel,["unique_id"],{
            project_id:projectId
        },"and",{
            field:"unique_id",
            type:"desc"
        }))
        if(obj) {
            return obj.unique_id+1
        } else {
            return 1
        }
    }

    async globalSearch(keyword:string,size:number,organizationUserId:string):Promise<ICommon_Route_Res_Global_Search_Project_Issue_Item[]> {
        let mysql=getMysqlInstance()
        let match=keyword.match(/(\w+)\s*\-\s*(\d+)/)
        let projectKeyword:string,issueUniqueId:string
        if(match) {
            projectKeyword=match[1]
            issueUniqueId=match[2]
        }
        let sql=generateGroupLeftJoin4Sql({
            model:projectIssueModel,
            columns:{
                columns:keys<ICommon_Model_Project_Issue>().map(item=>item.name),
                calcColumns:[]
            }
        },{
            model:projectModel,
            columns:{
                columns:keys<ICommon_Model_Project>().map(item=>item.name),
                calcColumns:[]
            },
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"project_id"
                }
            },
            aggregation:"project"
        },{
            model:roleMemberModel,
            expression:{
                item_id:{
                    model:projectModel,
                    field:"id"
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
        },["id"],{
            "$or0":{
                member_id:{
                    model:roleMemberModel,
                    value:organizationUserId
                },
                member_type:{
                    model:roleMemberModel,
                    value:ECommon_Model_Organization_Member_Type.DEFAULT
                },
                organization_user_id:{
                    model:teamUserModel,
                    value:organizationUserId
                },
                "organization_user_id ": {
                    model:memberTagMemberModel,
                    value:organizationUserId
                }
            },
            id:{
                model:projectModel,
                value:{
                    exp:"is not null"
                }
            },
            ...((projectKeyword && issueUniqueId)?{
                keyword:{
                    model:projectModel,
                    value:projectKeyword
                },
                unique_id:{
                    model:projectIssueModel,
                    value:issueUniqueId
                }
            }:{
                name:{
                    model:projectIssueModel,
                    value:{
                        exp:"%like%",
                        value:keyword
                    }
                }
            }),
        },"and",null,"and",{
            field:"name",
            model:projectIssueModel,
            type:"asc",
            isVirtualField:false
        },0,size)
        let ret=await mysql.execute(sql)
        return ret;
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
            id:value.id
        }))
        let ret=await mysql.executeOne(generateQuerySql(projectIssueFieldValueModel,[],{
            id:value.id
        }))
        return ret;
    }

    async getFieldValueByProjectIssueAndFieldType(projectIssueId:string,workflowNodeFieldTypeId:string) {
        if(!projectIssueId || !workflowNodeFieldTypeId) {
            return
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(projectIssueFieldValueModel,[],{
            project_issue_id:projectIssueId,
            workflow_node_field_type_id:workflowNodeFieldTypeId
        }))
        return ret;
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
                    if(arr.length>0) {
                        await mysql.execute(generateDeleteSql(projectIssueFieldValueModel,{
                            workflow_node_field_type_id:{
                                exp:"in",
                                value:arr.map(item=>item.id)
                            },
                            project_issue_id:projectIssueId
                        }))
                    }
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

    async clearBeforeConvert(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        await Promise.all([
            mysql.execute(generateDeleteSql(projectIssueFieldValueModel,{
                project_issue_id:projectIssueId
            })),
            mysql.execute(generateDeleteSql(projectIssueProcessModel,{
                project_issue_id:projectIssueId
            })),
            mysql.execute(generateDeleteSql(projectIssueApprovalModel,{
                project_issue_id:projectIssueId
            }))
        ])
    }

    async updateConvertIssueType(relationship:{
        [id:string]:string
    },projectId?:string) {
        let mysql=getMysqlInstance()
        let arrPromise=[]
        Object.keys(relationship).forEach(originalId=>{
            arrPromise.push((async ()=>{
                let newId=relationship[originalId]
                let objIssueType=await IssueTypeService.getItemById(newId)
                if(objIssueType) {
                    let objNode=await WorkflowService.getFirstNode(objIssueType.getId())
                    let list=await WorkflowNodeFieldTypeService.listWorkflowNodeField(objNode.id)
                    let arrIssue=await mysql.execute(generateQuerySql(projectIssueModel,["id"],{
                        ...(projectId && {
                            project_id:projectId
                        }),
                        issue_type_id:originalId
                    }))
                    let arrPromise=[]
                    for(let objIssueId of arrIssue.map(item=>item.id)) {
                        arrPromise.push((async ()=>{
                            let arr=await this.generateField(list,objIssueId)
                            await this.createFieldValues(arr)
                            await mysql.execute(generateCreateSql(projectIssueProcessModel,{
                                id:await generateSnowId(),
                                project_issue_id:objIssueId,
                                workflow_node_process:[objNode.id]
                            }))
                        })())
                    }
                    await Promise.all(arrPromise)
                    await mysql.execute(generateUpdateSql(projectIssueModel,{
                        issue_type_id:newId,
                        workflow_node_id:objNode.id
                    },{
                        ...(projectId && {
                            project_id:projectId
                        }),
                        issue_type_id:originalId
                    }))
                }
            })())
        })
        await Promise.all(arrPromise)
    }

    async generateField(list:{
        field:ICommon_Model_Workflow_Node_Field_Type,
        fieldType:ICommon_Field_Type,
        values?:ICommon_Model_Workflow_Node_Field_Type_Config[]
    }[],objIssueId:string) {
        let arr:ICommon_Model_Project_Issue_Field_Value[]=[]
        for(let field of list) {
            let ret=<ICommon_Model_Project_Issue_Field_Value>{}
            let id=await generateSnowId()
            if(field.fieldType.type==ECommon_Field_Type.DATE || field.fieldType.type==ECommon_Field_Type.TIME || field.fieldType.type==ECommon_Field_Type.TEXT || field.fieldType.type==ECommon_Field_Type.MULTITEXT) {
                ret={
                    id:id,
                    project_issue_id:objIssueId,
                    string_value:"",
                    workflow_node_field_type_id:field.field.id,
                    number_value:null,
                    ref_values:null,
                    field_config_ids:null
                }
            } else if(field.fieldType.type == ECommon_Field_Type.SWITCH) {
                ret={
                    id:id,
                    project_issue_id:objIssueId,
                    number_value:0,
                    workflow_node_field_type_id:field.field.id,
                    string_value:null,
                    ref_values:null,
                    field_config_ids:null
                }
            } else if(field.fieldType.type == ECommon_Field_Type.SELECT || field.fieldType.type == ECommon_Field_Type.MULTISELECT) {
                ret={
                    id:id,
                    project_issue_id:objIssueId,
                    field_config_ids:[],
                    workflow_node_field_type_id:field.field.id,
                    string_value:null,
                    ref_values:null,
                    number_value:null,
                }
            } else if(field.fieldType.type == ECommon_Field_Type.LABEL || field.fieldType.type == ECommon_Field_Type.MULTILABEL) {
                ret={
                    id:id,
                    project_issue_id:objIssueId,
                    ref_values:[],
                    number_value:null,
                    workflow_node_field_type_id:field.field.id,
                    string_value:null,
                    field_config_ids:null
                }
            }
            arr.push(ret)
        }
        return arr;
    }

    async clearBeforeConvertByProjectId(projectId:string) {
        if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let mysql=getMysqlInstance()
        await Promise.all([
            mysql.execute(generateDeleteLeftJoinSql(projectIssueFieldValueModel,{
                model:projectIssueModel,
                expression:{
                    id:{
                        model:projectIssueFieldValueModel,
                        field:"project_issue_id"
                    }
                },
                isDelete:false
            },{
                project_id:{
                    model:projectIssueModel,
                    value:projectId
                }
            })),
            mysql.execute(generateDeleteLeftJoinSql(projectIssueProcessModel,{
                model:projectIssueModel,
                expression:{
                    id:{
                        model:projectIssueProcessModel,
                        field:"project_issue_id"
                    }
                },
                isDelete:false
            },{
                project_id:{
                    model:projectIssueModel,
                    value:projectId
                }
            })),
            mysql.execute(generateDeleteLeftJoinSql(projectIssueApprovalModel,{
                model:projectIssueModel,
                expression:{
                    id:{
                        model:projectIssueApprovalModel,
                        field:"project_issue_id"
                    }
                },
                isDelete:false
            },{
                project_id:{
                    model:projectIssueModel,
                    value:projectId
                }
            }))
        ])
    }

    async clearBeforeConvertByIssueTypeId(issueTypeId:string) {
        if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        }
        let mysql=getMysqlInstance()
        await Promise.all([
            mysql.execute(generateDeleteLeftJoinSql(projectIssueFieldValueModel,{
                model:projectIssueModel,
                expression:{
                    id:{
                        model:projectIssueFieldValueModel,
                        field:"project_issue_id"
                    }
                },
                isDelete:false
            },{
                issue_type_id:{
                    model:projectIssueModel,
                    value:issueTypeId
                }
            })),
            mysql.execute(generateDeleteLeftJoinSql(projectIssueProcessModel,{
                model:projectIssueModel,
                expression:{
                    id:{
                        model:projectIssueProcessModel,
                        field:"project_issue_id"
                    }
                },
                isDelete:false
            },{
                issue_type_id:{
                    model:projectIssueModel,
                    value:issueTypeId
                }
            })),
            mysql.execute(generateDeleteLeftJoinSql(projectIssueApprovalModel,{
                model:projectIssueModel,
                expression:{
                    id:{
                        model:projectIssueApprovalModel,
                        field:"project_issue_id"
                    }
                },
                isDelete:false
            },{
                issue_type_id:{
                    model:projectIssueModel,
                    value:issueTypeId
                }
            }))
        ])
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

    async clear(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        await Promise.all([
            mysql.execute(generateDeleteSql(projectIssueFieldValueModel,{
                project_issue_id:projectIssueId
            })),
            mysql.execute(generateDeleteSql(projectIssueParentModel,{
                parent_id:projectIssueId,
                child_id:projectIssueId
            },"or")),
            mysql.execute(generateDeleteSql(projectIssueProcessModel,{
                project_issue_id:projectIssueId
            })),
            mysql.execute(generateDeleteSql(projectIssueRelatedModel,{
                project_issue_1_id:projectIssueId,
                project_issue_2_id:projectIssueId
            },"or")),
            mysql.execute(generateDeleteSql(projectLabelIssueModel,{
                project_issue_id:projectIssueId
            })),
            mysql.execute(generateDeleteSql(projectModuleIssueModel,{
                project_issue_id:projectIssueId
            })),
            mysql.execute(generateDeleteSql(projectReleaseIssueModel,{
                project_issue_id:projectIssueId
            })),
            mysql.execute(generateDeleteSql(projectIssueApprovalModel,{
                project_issue_id:projectIssueId
            })),
            mysql.execute(generateDeleteSql(projectIssueHistoryModel,{
                project_issue_id:projectIssueId
            })),
            mysql.execute(generateDeleteSql(boardSprintIssueModel,{
                project_issue_id:projectIssueId
            }))
        ])
    }

    async getBasicInfo(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let process=await this.getProcess(projectIssueId)
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
        } else if(projectChildIssueId==projectParentIssueId) {
            throw Err.Project.ProjectIssue.issueEqualForbidden
        }
        let mysql=getMysqlInstance()
        await Promise.all([
            (async ()=>{
                let obj=await mysql.executeOne(generateQuerySql(projectIssueParentModel,["id"],{
                    child_id:projectChildIssueId,
                    parent_id:projectChildIssueId
                },"or"))
                if(obj) {
                    throw Err.Project.ProjectIssue.parentChildExists
                }
            })(),
            (async ()=>{
                let obj=await mysql.executeOne(generateQuerySql(projectIssueParentModel,["id"],{
                    child_id:projectParentIssueId,
                    parent_id:projectChildIssueId
                }))
                if(obj) {
                    throw Err.Project.ProjectIssue.parentChildExists
                }
            })()
        ])
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
        } else if(projectIssue1Id==projectIssue2Id) {
            throw Err.Project.ProjectIssue.issueEqualForbidden
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
        },"and",{
            type:"asc",
            model:projectIssueParentModel,
            field:"child_id"
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
        let ret=await mysql.executeOne(sql)
        let arr:ICommon_Model_Project_Module[]=[]
        if(ret) {
            arr.unshift(ret);
            while (ret.parent_module_id) {
                ret=await mysql.executeOne(generateQuerySql(projectModuleModel,[],{
                    id:ret.parent_module_id
                }))
                if(!ret) {
                    break
                } else {
                    arr.unshift(ret);
                }
            }
        }
        return arr;
    }

    async bindIssueLabels(projectIssueId:string, projectLabelIds:string[]) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        } else if(!projectLabelIds) {
            throw Err.Project.Label.labelNotfound
        }
        let mysql=getMysqlInstance()
        await mysql.executeOne(generateDeleteSql(projectLabelIssueModel,{
            project_issue_id:projectIssueId
        }))
        if(projectLabelIds.length>0) {
            let arr=await Promise.all(projectLabelIds.map(async item=>{
                return {
                    id:await generateSnowId(),
                    project_label_id:item,
                    project_issue_id:projectIssueId
                }
            }))
            await mysql.execute(generateBatchCreateSql(projectLabelIssueModel,arr))
        }
    }

    async bindIssueModule(projectIssueId:string,projectModuleId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        if(projectModuleId) {
            await mysql.execute(generateBatchCreateOnUpdateSql(projectModuleIssueModel,[
                {
                    id:await generateSnowId(),
                    project_issue_id:projectIssueId,
                    project_module_id:projectModuleId
                }
            ],{
                project_module_id:projectModuleId
            }))
        } else {
            await mysql.execute(generateDeleteSql(projectModuleIssueModel,{
                project_issue_id:projectIssueId
            }))
        }
    }

    async filter(organizationId:string,projectId :string,page :number,size :number,createdBy? :string,issueTypeId? :string,name? :string,priority? :number,assignerId? :string,reporterId? :string,status? :number,moduleId? :string,labelId? :string,projectIssueIds?:string[]):Promise<ICommon_Route_Res_Project_Issue_filter> {
        let mysql=getMysqlInstance()
        if(!projectId && name && name.includes("-")) {
            let arr=name.split("-")
            let projectUniqueId=arr[0]
            name=arr[1]
            let obj=await mysql.executeOne(generateQuerySql(projectModel,["id"],{
                keyword:projectUniqueId,
                organization_id:organizationId
            }))
            if(!obj) {
                throw Err.Project.projectNotFound
            }
            projectId=obj.id
        }
        let setModuleId:Set<string>=new Set;
        let setLabelId:Set<string>=new Set;
        if(moduleId) {
            let arrModuleIssueId=(await mysql.execute(generateQuerySql(projectModuleIssueModel,["project_issue_id"],{
                project_module_id:moduleId
            }))).map(item=>item.project_issue_id)
            if(arrModuleIssueId.length==0) {
                return {
                    data:[],
                    count:0,
                    page:page,
                    totalPage:0
                }
            }
            for(let obj of arrModuleIssueId) {
                setModuleId.add(obj)
            }
        }
        if(labelId) {
            let arrLabelIssueId=(await mysql.execute(generateQuerySql(projectLabelIssueModel,["project_issue_id"],{
                project_label_id:labelId
            }))).map(item=>item.project_issue_id)
            if(arrLabelIssueId.length==0) {
                return {
                    data:[],
                    count:0,
                    page:page,
                    totalPage:0
                }
            }
            for(let obj of arrLabelIssueId) {
                setLabelId.add(obj)
            }
        }
        let setId:Set<string>
        if(moduleId && labelId) {
            setId=new Set([...setModuleId].filter(x => setLabelId.has(x)));
        } else if(moduleId && !labelId) {
            setId=setModuleId
        } else if(!moduleId && labelId) {
            setId=setLabelId
        }
        let sql=generateLeftJoin3Sql({
            model:projectIssueModel,
            columns:["id","assigner_id","reporter_id","unique_id","name","unique_id","created_time","created_by","priority"]
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
            model:projectModel,
            columns:keys<typeof projectModel["model"]>().map(item=>item.name),
            aggregation:"project",
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"project_id"
                }
            }
        },{
            organization_id:{
                model:projectModel,
                value:organizationId
            },
            ...(projectId && {
                project_id:{
                    model:projectIssueModel,
                    value:projectId
                }
            }),
            ...(createdBy && {
                created_by:{
                    model:projectIssueModel,
                    value:createdBy
                }
            }),
            ...(issueTypeId && {
                issue_type_id:{
                    model:projectIssueModel,
                    value:issueTypeId
                }
            }),
            ...(name && {
                "$or0":{
                    name:{
                        model:projectIssueModel,
                        value:{
                            exp:"%like%",
                            value:name
                        }
                    },
                    unique_id:{
                        model:projectIssueModel,
                        value:name.includes("-")?name.split("-")[1]:name
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
            ...(Number.isInteger(status) && {
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
            ...(projectIssueIds?.length>0 && {
                id:{
                    model:projectIssueModel,
                    value:{
                        exp:"in",
                        value:projectIssueIds
                    }
                }
            })
        },"and",projectIssueIds?.length>0?{
            model:projectIssueModel,
            field:"id",
            type:"field",
            value:projectIssueIds
        }:{
            model:projectIssueModel,
            field:"name",
            type:"asc"
        },page*size,size)
        let countSql=convertCountSql(sql);
        let count=Number(Object.values(await mysql.executeOne(countSql))[0])
        let totalPage=CommonUtil.pageTotal(count,size)
        let ret=await mysql.execute(sql)
        return {
            data:ret,
            count:count,
            totalPage:totalPage,
            page:page,
        };
    }

    async clearMany(projectIssueIds:string[]) {
        if(!projectIssueIds) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        } else if(projectIssueIds.length==0) {
            return
        }
        let mysql=getMysqlInstance()
        await Promise.all([
            mysql.execute(generateDeleteSql(projectIssueModel,{
                id:{
                    exp:"in",
                    value:projectIssueIds
                }
            })),
            mysql.execute(generateDeleteSql(projectIssueFieldValueModel,{
                project_issue_id:{
                    exp:"in",
                    value:projectIssueIds
                }
            })),
            mysql.execute(generateDeleteSql(projectIssueParentModel,{
                parent_id:{
                    exp:"in",
                    value:projectIssueIds
                },
                child_id:{
                    exp:"in",
                    value:projectIssueIds
                }
            },"or")),
            mysql.execute(generateDeleteSql(projectIssueProcessModel,{
                project_issue_id:{
                    exp:"in",
                    value:projectIssueIds
                }
            })),
            mysql.execute(generateDeleteSql(projectIssueRelatedModel,{
                project_issue_1_id:{
                    exp:"in",
                    value:projectIssueIds
                },
                project_issue_2_id:{
                    exp:"in",
                    value:projectIssueIds
                }
            },"or")),
            mysql.execute(generateDeleteSql(projectIssueApprovalModel,{
                project_issue_id:{
                    exp:"in",
                    value:projectIssueIds
                }
            })),
            mysql.execute(generateDeleteSql(projectIssueHistoryModel,{
                project_issue_id:{
                    exp:"in",
                    value:projectIssueIds
                }
            })),
            mysql.execute(generateDeleteSql(boardSprintIssueModel,{
                project_issue_id:{
                    exp:"in",
                    value:projectIssueIds
                }
            })),
            mysql.execute(generateDeleteSql(projectModuleIssueModel,{
                project_issue_id:{
                    exp:"in",
                    value:projectIssueIds
                }
            })),
            mysql.execute(generateDeleteSql(projectReleaseIssueModel,{
                project_issue_id:{
                    exp:"in",
                    value:projectIssueIds
                }
            })),
            mysql.execute(generateDeleteSql(projectLabelIssueModel,{
                project_issue_id:{
                    exp:"in",
                    value:projectIssueIds
                }
            })),
        ])
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

    async clearByIssueTypeId(issueTypeId:string) {
        if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        }
        let mysql=getMysqlInstance()
        let arr=await mysql.execute(generateQuerySql(projectIssueModel,["id"],{
            issue_type_id:issueTypeId
        }))
        if(arr.length>0) {
            let projectIssueIds=arr.map(item=>item.id)
            await this.clearMany(projectIssueIds)
        }
    }

    async getOrganizationUserIdsByIssueExtraField(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:projectIssueFieldValueModel,
            columns:["ref_values"],
        },{
            model:workflowNodeFieldTypeModel,
            expression:{
                id:{
                    model:projectIssueFieldValueModel,
                    field:"workflow_node_field_type_id"
                }
            }
        },{
            project_issue_id:{
                model:projectIssueFieldValueModel,
                value:projectIssueId
            },
            label_type:{
                model:workflowNodeFieldTypeModel,
                value:ECommon_Model_Workflow_Node_Field_Type_Label_Type.USER
            }
        })
        let arr=await mysql.execute(sql)
        let ret:string[]=[]
        for(let obj of arr) {
            ret.push(...obj.ref_values)
        }
        return ret;
    }

    async clearWorkflowNodeProcessAndFields(workflowNodeId:string) {
        if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let mysql=getMysqlInstance()
        await Promise.all([
            (async ()=>{
                let arr=await workflowNodeFieldTypeMapper.getWorkflowNodeFieldList(workflowNodeId)
                if(arr.length>0) {
                    await mysql.execute(generateDeleteSql(projectIssueFieldValueModel,{
                        workflow_node_field_type_id:{
                            exp:"in",
                            value:arr.map(item=>item.field.id)
                        }
                    }))
                }
            })(),
            (async ()=>{
                await mysql.execute(`update ${Table_Project_Issue_Process}  set workflow_node_process=JSON_REMOVE(workflow_node_process,JSON_UNQUOTE(JSON_SEARCH(workflow_node_process,'one','${workflowNodeId}'))) where JSON_SEARCH(workflow_node_process,'one','${workflowNodeId}') IS NOT NULL`)
            })(),
            mysql.executeOne(generateDeleteSql(projectIssueApprovalModel,{
                workflow_node_id:workflowNodeId
            }))
        ])
    }

    async clearWorkflowNodeFieldTypeConfig(fieldTypeConfigValueId:string) {
        if(!fieldTypeConfigValueId) {
            throw Err.Project.Field.fieldTypeConfigValueIdNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(projectIssueFieldValueModel,{
            field_config_ids:{
                exp:"json_array_remove",
                value:fieldTypeConfigValueId
            }
        },{
            field_config_ids:{
                exp:"json_array_contain",
                value:fieldTypeConfigValueId
            }
        }))
    }

}

export let projectIssueMapper=new ProjectIssueMapper

class ProjectIssueHistoryMapper extends Mapper<typeof projectIssueHistoryModel> {
    constructor() {
        super(projectIssueHistoryModel)
    }
    async list(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(projectIssueHistoryModel,null,{
            project_issue_id:projectIssueId
        },"and",{
            type:"desc",
            field:"id"
        }))
        return ret;
    }

    async clear(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectIssueHistoryModel,{
            project_issue_id:projectIssueId
        }))
    }

    async clearByProjectIds(projectIds:string[]) {
        if(projectIds.length>0) {
            let mysql=getMysqlInstance()
            await mysql.execute(generateDeleteSql(projectIssueHistoryModel,{
                project_id:{
                    exp:"in",
                    value:projectIds
                }
            }))
        }
    }
}

export let projectIssueHistoryMapper=new ProjectIssueHistoryMapper

class ProjectIssueApprovalMapper extends Mapper<typeof projectIssueApprovalModel> {
    constructor() {
        super(projectIssueApprovalModel)
    }
}
export let projectIssueApprovalMapper=new ProjectIssueApprovalMapper
