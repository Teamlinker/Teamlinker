import { ICommon_Model_Field_Solution_Workflow_Node_Field_Type } from '../../../common/model/field_solution_workflow_node_field_type';
import { ECommon_Model_Field_Type, ICommon_Model_Field_Type } from '../../../common/model/field_type';
import { ICommon_Model_Field_Type_Config_Value } from '../../../common/model/field_type_config_value';
import { ICommon_Route_Req_ProjectIssue_Field, ICommon_Route_Res_ProjectIssue_fieldsInfo } from "../../../common/routes/response";
import { Err } from '../../../common/status/error';
import { Entity } from "../../common/entity/entity";
import { EServer_Common_Event_Types } from '../../common/event/types';
import { generateSnowId } from '../../common/util/sql';
import ProjectService from "../service/project";
import { ICommon_Model_Project_Issue, projectIssueModel } from './../../../common/model/project_issue';
import { ICommon_Model_Project_Issue_Field_Value } from './../../../common/model/project_issue_field_value';
import { commentMapper } from './../mapper/comment';
import { projectIssueMapper } from './../mapper/issue';
import { FieldSolutionService } from './field';
import ProjectModuleService from './module';
import ProjectTagService from './tag';
import { WorkflowActionService, WorkflowNodeService } from './workflow';
export default class ProjectIssue extends Entity<typeof projectIssueModel,typeof projectIssueMapper> {
    constructor(){
        super(projectIssueMapper)
    }
    
    async createFieldValues(values:ICommon_Route_Req_ProjectIssue_Field[]) {
        if(!Array.isArray(values) || !values) {
            return
        }
        let fieldIds=values.map(item=>item.fieldId)
        let fieldTypes=await FieldSolutionService.getFieldTypesByFieldIds(fieldIds)
        let newFields=fieldTypes.map(item=>item.fieldId)
        let arr=<ICommon_Model_Project_Issue_Field_Value[]>[];
        for(let i=0;i<newFields.length;i++) {
            let val=newFields[i]
            let index=fieldIds.indexOf(val)
            if(index>-1){
                let obj=values[index]
                let objFieldType=fieldTypes[i]
                let ret=await this.generateFieldValue(objFieldType,obj)
                arr.push(ret)
            }
        }
        if(arr.length>0) {
            await projectIssueMapper.createFieldValues(arr);
        }
    }

    async generateFieldValue(objFieldType:{
        fieldId:string,
        fieldType:ICommon_Model_Field_Type
    },obj:ICommon_Route_Req_ProjectIssue_Field):Promise<ICommon_Model_Project_Issue_Field_Value> {
        let ret=<ICommon_Model_Project_Issue_Field_Value>{}
        let id=await generateSnowId()
        if(objFieldType.fieldType.type==ECommon_Model_Field_Type.DATE || objFieldType.fieldType.type==ECommon_Model_Field_Type.DATETIME || objFieldType.fieldType.type==ECommon_Model_Field_Type.TIME || objFieldType.fieldType.type==ECommon_Model_Field_Type.TEXT || objFieldType.fieldType.type==ECommon_Model_Field_Type.MULTITEXT) {
            ret=<ICommon_Model_Project_Issue_Field_Value>{
                id:id,
                project_issue_id:this.getId(),
                field_id:obj.fieldId,
                string_value:obj.value as string
            }
        } else if(objFieldType.fieldType.type == ECommon_Model_Field_Type.SWITCH) {
            ret=<ICommon_Model_Project_Issue_Field_Value>{
                id:id,
                project_issue_id:this.getId(),
                field_id:obj.fieldId,
                number_value:obj.value as number
            }
        } else if(objFieldType.fieldType.type == ECommon_Model_Field_Type.SELECT || objFieldType.fieldType.type == ECommon_Model_Field_Type.MULTISELECT) {
            ret=<ICommon_Model_Project_Issue_Field_Value>{
                id:id,
                project_issue_id:this.getId(),
                field_id:obj.fieldId,
                field_config_ids:obj.value as string[]
            }
        } else if(objFieldType.fieldType.type == ECommon_Model_Field_Type.LABEL || objFieldType.fieldType.type == ECommon_Model_Field_Type.MULTILABEL) {
            ret=<ICommon_Model_Project_Issue_Field_Value>{
                id:id,
                project_issue_id:this.getId(),
                field_id:obj.fieldId,
                ref_values:obj.value as string[]
            }
        } 
        return ret;
    }

    async updateFieldValue(value:ICommon_Route_Req_ProjectIssue_Field) {
        if(!value) {
            return
        }
        let fieldTypes=await FieldSolutionService.getFieldTypesByFieldIds([value.fieldId])
        if(fieldTypes && fieldTypes.length>0) {
            let obj=await this.generateFieldValue(fieldTypes[0],value)
            await projectIssueMapper.updateFieldValue(obj)
        }
    }

    override async create(): Promise<ICommon_Model_Project_Issue> {
        let project=await ProjectService.getItemById(this.item.project_id)
        if(!project) {
            throw Err.Project.projectNotFound
        }
        let info=await project.getFirstNodeInfo(this.item.issue_type_id)
        if(!info || !info.node) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        this.item.workflow_node_id=info.node.id
        let obj=await super.create()
        await projectIssueMapper.handleProcess(obj.id,info.node.id)
        return obj;
    }

    async getNextNodeFields(workflowActionId:string) {
        let obj=await WorkflowActionService.getItemById(workflowActionId)
        if(!obj) {
            throw Err.Project.Workflow.workflowActionNotFound
        }
        let ret=await this.getWorkflowNodeFields(obj.getItem().dest_node_id)
        return ret;
    }

    async getWorkflowNodeFields(workflowNodeId:string){
        if(!workflowNodeId) {
            return null;
        }
        let project=await ProjectService.getItemById(this.getItem().project_id)
        let info=await project.getBindInfo()
        let workflow=await info.workflowSolution.getWorkflowByIssueTypeId(this.getItem().issue_type_id,info.issueTypeSolution.getId())
        if(info.fieldSolution) {
            let ret=await info.fieldSolution.listWorkflowNodeField(workflowNodeId,workflow.id,info.workflowSolution.getId())
            return ret;
        }
        else {
            return null
        }
    }

    async confirmNextNode(workflowActionId:string,values:ICommon_Route_Req_ProjectIssue_Field[]) {
        let obj=await WorkflowActionService.getItemById(workflowActionId)
        if(!obj) {
            throw Err.Project.Workflow.workflowActionNotFound
        }
        if(obj.getItem().dest_node_id) {
            this.assignItem({
                workflow_node_id:obj.getItem().dest_node_id
            })
            await this.update()
            await this.createFieldValues(values)
            let project=await ProjectService.getItemById(this.getItem().project_id)
            let info=await project.getBindInfo()
            await projectIssueMapper.handleProcess(this.getId(),obj.getItem().dest_node_id,{
                workflowSolutionId:info.workflowSolution.getId(),
                fieldSolutionId:info.fieldSolution?info.fieldSolution.getId():null
            })
        }
    }
    
    async fieldsInfo(){
        let project=await ProjectService.getItemById(this.getItem().project_id)
        let info=await project.getBindInfo()
        if(!info.fieldSolution) {
            return null;
        }
        let process=await projectIssueMapper.getProcess(this.getId())
        if(!process) {
            return null
        }
        let fieldValues=await projectIssueMapper.getFieldValues(this.getId());
        if(!fieldValues || fieldValues.length==0) {
            return null
        }
        let workflow=await info.workflowSolution.getWorkflowByIssueTypeId(this.getItem().issue_type_id,info.issueTypeSolution.getId())
        let objFieldsInfo=<{
            [weight:number]:{
                field: ICommon_Model_Field_Solution_Workflow_Node_Field_Type;
                fieldType: ICommon_Model_Field_Type;
                values?: ICommon_Model_Field_Type_Config_Value[];
            }[]
        }>{}
        for(let obj of process) {
            let fieldsInfo=await info.fieldSolution.listWorkflowNodeField(obj,workflow.id,info.workflowSolution.getId())
            for(let fieldInfo of fieldsInfo) {
                let weight=fieldInfo.field.weight
                if(objFieldsInfo[weight]) {
                    objFieldsInfo[weight].push(fieldInfo)
                } else {
                    objFieldsInfo[weight]=[fieldInfo]
                }
            }
        }
        let arr:{
            weight:number,
            data:{
                field: ICommon_Model_Field_Solution_Workflow_Node_Field_Type;
                fieldType: ICommon_Model_Field_Type;
                values?: ICommon_Model_Field_Type_Config_Value[];
            }[]
        }[]=[]
        for(let weight in objFieldsInfo) {
            let isMatch=false;
            for(let i=0;i<arr.length;i++) {
                if(arr[i].weight<parseInt(weight)) {
                    arr.splice(i,0,{
                        weight:parseInt(weight),
                        data:objFieldsInfo[weight]
                    })
                    isMatch=true
                    break
                }
            }
            if(!isMatch) {
                arr.push({
                    weight:parseInt(weight),
                    data:objFieldsInfo[weight]
                })
            }
        }
        let arr1:{
            field: ICommon_Model_Field_Solution_Workflow_Node_Field_Type;
            fieldType: ICommon_Model_Field_Type;
            values?: ICommon_Model_Field_Type_Config_Value[];
        }[]=[]
        for(let obj of arr) {
            arr1=arr1.concat(obj.data)
        }
        let arr2:ICommon_Route_Res_ProjectIssue_fieldsInfo[]=[]
        for(let obj of arr1) {
            for(let obj1 of fieldValues) {
                if(obj1.field_id==obj.field.id) {
                    arr2.push(Object.assign({},obj1,obj));
                }
            }
        }
        return arr2;
    }

    async editDescription(description:string) {
        await projectIssueMapper.editDescription(this.getId(),description);
    }

    async getDescription() {
        let ret=await projectIssueMapper.getDescription(this.getId())
        return ret;
    }

    override async delete(eventPulish?: EServer_Common_Event_Types.Types): Promise<void> {
        await super.delete()
        await projectIssueMapper.clear(this.getId())
        await commentMapper.clear(this.getId());
    }

    async getBasicInfo() {
        let ret=await projectIssueMapper.getBasicInfo(this.getId())
        return ret;
    }

    static async getObjByUniqueKey(uniqueKey:string) {
        if(!uniqueKey || !uniqueKey.includes("-")) {
            throw Err.Project.ProjectIssue.uniqueKeyError
        }
        let arr=uniqueKey.split("-")
        let project=await ProjectService.getObjByKeyword(arr[0])
        if(!project) {
            return null;
        }
        let uniqueId=parseInt(arr[1])
        let projectIssueItem=await projectIssueMapper.getItemByUniqueId(uniqueId)
        if(!projectIssueItem) {
            return null;
        }
        if(projectIssueItem.project_id!=project.getId()) {
            return null;
        }
        let obj=new ProjectIssue
        obj.setItem(projectIssueItem)
        return obj
        
    }

    async actionsInfo() {
        let workflowNode=await WorkflowNodeService.getItemById(this.getItem().workflow_node_id)
        if(!workflowNode){
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let ret=await workflowNode.getActionList()
        return ret;
    }

    override async copy(deletedFields?: (keyof ICommon_Model_Project_Issue)[]): Promise<this> {
        let obj=await super.copy(["unique_id"])
        await projectIssueMapper.copyIssue(this.getId(),obj.getId())
        return obj;
    }

    async addChildIssue(projectIssueChildId :string) {
         let obj=await ProjectIssue.getItemById(projectIssueChildId)
         if(!obj) {
             throw Err.Project.ProjectIssue.projectIssueNotFound
         }
         await projectIssueMapper.addChildIssue(this.getId(),obj.getId());
    }
    
    async removeChildIssue(projectIssueChildId :string) {
        let obj=await ProjectIssue.getItemById(projectIssueChildId)
         if(!obj) {
             throw Err.Project.ProjectIssue.projectIssueNotFound
         }
         await projectIssueMapper.removeChildIssue(this.getId(),obj.getId());
    }
   
    async addParentIssue(projectIssueParentId :string){
        let obj=await ProjectIssue.getItemById(projectIssueParentId)
         if(!obj) {
             throw Err.Project.ProjectIssue.projectIssueNotFound
         }
         await projectIssueMapper.addChildIssue(obj.getId(),this.getId());
    }
    
    async removeParentIssue(projectIssueParentId :string) {
        let obj=await ProjectIssue.getItemById(projectIssueParentId)
         if(!obj) {
             throw Err.Project.ProjectIssue.projectIssueNotFound
         }
         await projectIssueMapper.removeChildIssue(obj.getId(),this.getId());
    }

    async addRelatedIssue(projectIssueRelatedId :string) {
        let obj=await ProjectIssue.getItemById(projectIssueRelatedId)
         if(!obj) {
             throw Err.Project.ProjectIssue.projectIssueNotFound
         }
         await projectIssueMapper.addRelatedIssue(this.getId(),obj.getId());
    }

    async removeRelatedIssue(projectIssueRelatedId :string) {
        let obj=await ProjectIssue.getItemById(projectIssueRelatedId)
         if(!obj) {
             throw Err.Project.ProjectIssue.projectIssueNotFound
         }
         await projectIssueMapper.removeRelatedIssue(this.getId(),obj.getId());
    }

    async otherInfoList() {
        let arr=await Promise.all([projectIssueMapper.parentIssue(this.getId()),projectIssueMapper.childIssueList(this.getId()),projectIssueMapper.relatedIssueList(this.getId()),projectIssueMapper.issueLabelList(this.getId()),projectIssueMapper.issueModuleList(this.getId())])
        return {
            parent:arr[0],
            children:arr[1],
            relateds:arr[2],
            labels:arr[3],
            modules:arr[4]
        }
    }

    async bindTag(tagId :string) {
        let obj=await ProjectTagService.getItemById(tagId)
        if(!obj) {
            throw Err.Project.Tag.tagNotfound
        }
        await projectIssueMapper.bindIssueLabel(this.getId(),tagId)
    }

    async unbindTag(tagId :string) {
        let obj=await ProjectTagService.getItemById(tagId)
        if(!obj) {
            throw Err.Project.Tag.tagNotfound
        }
        await projectIssueMapper.unbindIssueLabel(this.getId(),tagId)
    }

    async bindModule(moduleId :string) {
        let obj=await ProjectModuleService.getItemById(moduleId)
        if(!obj) {
            throw Err.Project.Module.moduleNotFound
        }
        await projectIssueMapper.bindIssueModule(this.getId(),moduleId)
    }

    async unbindModule(moduleId :string) {
        let obj=await ProjectModuleService.getItemById(moduleId)
        if(!obj) {
            throw Err.Project.Module.moduleNotFound
        }
        await projectIssueMapper.unbindIssueModule(this.getId(),moduleId)
    }

    static async filter(projectId :string,page :number,size :number,createdBy? :string,issueTypeId? :string,name? :string,priority? :number,assignerId? :string,reporterId? :string,status? :number,moduleId? :string,tagId? :string) {
        let project=await ProjectService.getItemById(projectId)
        if(!project) {
            throw Err.Project.projectNotFound
        }
        let ret=await projectIssueMapper.filter(projectId ,page ,size ,createdBy ,issueTypeId,name,priority,assignerId,reporterId,status,moduleId,tagId)
        return ret;
    }

    static async clearByProjectIds(projectIds:string[]) {
        let ret=await projectIssueMapper.getIdsByProjectIds(projectIds);
        if(ret.length>0) {
            await projectIssueMapper.clearMany(ret);
            await commentMapper.clearByProjectIssueIds(ret)
        }
        
    }
    
}