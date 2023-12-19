import {
    ECommon_Model_Workflow_Node_Field_Type_Label_Type,
    ICommon_Model_Workflow_Node_Field_Type,
    workflowNodeFieldTypeModel
} from '../../../common/model/workflow_node_field_type';
import {
    ICommon_Model_Workflow_Node_Field_Type_Config,
    workflowNodeFieldTypeConfigModel
} from '../../../common/model/workflow_node_field_type_config';
import {Err} from '../../../common/status/error';
import {getMysqlInstance} from '../../common/db/mysql';
import {Mapper} from "../../common/entity/mapper";
import {
    generateBatchCreateSql,
    generateCreateSql,
    generateDeleteSql,
    generateMaxSql,
    generateQuerySql,
    generateSnowId,
    generateUpdateSql
} from '../../common/util/sql';
import {ECommon_Field_Type, Field_Types, ICommon_Field_Type} from "../../../common/field/type";
import {projectIssueProcessModel} from "../../../common/model/project_issue_process";
import {
    ICommon_Model_Project_Issue_Field_Value,
    projectIssueFieldValueModel
} from "../../../common/model/project_issue_field_value";

class WorkflowNodeFieldTypeMapper extends Mapper<typeof workflowNodeFieldTypeModel> {
    constructor() {
        super(workflowNodeFieldTypeModel)
    }

    async workflowNodeFieldInfo(workflowNodeFieldTypeId:string):Promise<{
        field:ICommon_Model_Workflow_Node_Field_Type,
        fieldType:ICommon_Field_Type,
        values?:ICommon_Model_Workflow_Node_Field_Type_Config[]
    }> {
        if(!workflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateQuerySql(workflowNodeFieldTypeModel,null,{
            id:workflowNodeFieldTypeId
        })
        let objField=await mysql.executeOne(sql)
        let objFieldType = Field_Types[objField.field_type_id]
        let ret=<{
            field:ICommon_Model_Workflow_Node_Field_Type,
            fieldType:ICommon_Field_Type,
            values?:ICommon_Model_Workflow_Node_Field_Type_Config[]
        }>{
            field: objField,
            fieldType: objFieldType,
            values: []
        }
        let arrValues = await mysql.execute(generateQuerySql(workflowNodeFieldTypeConfigModel, [], {
            workflow_node_field_type_id: objField.id
        }))
        ret.values = arrValues
        return ret;
    }

    async getWorkflowNodeFieldList(workflowNodeId:string):Promise<{
        field:ICommon_Model_Workflow_Node_Field_Type,
        fieldType:ICommon_Field_Type,
        values?:ICommon_Model_Workflow_Node_Field_Type_Config[]
    }[]> {
        if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateQuerySql(workflowNodeFieldTypeModel,null,{
            workflow_node_id:workflowNodeId
        },"and",{
            field:"weight",
            type:"asc"
        })
        let arrField=await mysql.execute(sql)
        let ret:{
            field:ICommon_Model_Workflow_Node_Field_Type,
            fieldType:ICommon_Field_Type,
            values?:ICommon_Model_Workflow_Node_Field_Type_Config[]
        }[]=[]
        let arrPromise=[]
        for(let objField of arrField) {
            let objFieldType=Field_Types[objField.field_type_id]
            let obj:{
                field:ICommon_Model_Workflow_Node_Field_Type,
                fieldType:ICommon_Field_Type,
                values?:ICommon_Model_Workflow_Node_Field_Type_Config[]
            }={
                field:objField,
                fieldType:objFieldType,
                values:[]
            }
            arrPromise.push((async ()=>{
                ret.push(obj)
                let arrValues=await mysql.execute(generateQuerySql(workflowNodeFieldTypeConfigModel,[],{
                    workflow_node_field_type_id:objField.id
                }))
                obj.values=arrValues
            })())
        }
        await Promise.all(arrPromise)
        return ret;
    }
    
    async addWorkflowNodeField(workflowNodeId:string,fieldTypeId:ECommon_Field_Type,name:string,optional:number,defaultStringValue?:string,defaultNumberValue?:number,description?:string):Promise<ICommon_Model_Workflow_Node_Field_Type> {
        if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        } else if(fieldTypeId===undefined || fieldTypeId===null) {
            throw Err.Project.Field.fieldTypeNotFound
        }
        let weight=0,mysql=getMysqlInstance()
        let existSort=await mysql.executeOne(generateMaxSql(workflowNodeFieldTypeModel,"weight",{
            workflow_node_id:workflowNodeId
        }))
        if(existSort && existSort.weight) {
            weight=existSort.weight+1
        }
        let id=await generateSnowId()
        await mysql.execute(generateCreateSql(workflowNodeFieldTypeModel,{
            workflow_node_id:workflowNodeId,
            id:id,
            field_type_id:fieldTypeId,
            name,
            default_string_value:defaultStringValue,
            default_number_value:defaultNumberValue,
            optional,
            description,
            weight,
            ...((fieldTypeId===ECommon_Field_Type.LABEL || fieldTypeId===ECommon_Field_Type.MULTILABEL) && {
                label_type:ECommon_Model_Workflow_Node_Field_Type_Label_Type.USER
            })
        }))
        let arr=await mysql.execute(generateQuerySql(projectIssueProcessModel,["project_issue_id"],{
            workflow_node_process:{
                exp:"json_array_contain",
                value:workflowNodeId
            }
        }))
        if(arr.length>0) {
            let arrCreate:ICommon_Model_Project_Issue_Field_Value[]=[]
            for(let obj of arr) {
                arrCreate.push({
                    id:await generateSnowId(),
                    workflow_node_field_type_id:id,
                    project_issue_id:obj.project_issue_id,
                    field_config_ids:null,
                    ref_values:null,
                    number_value:null,
                    string_value:null
                })
            }
            await mysql.execute(generateBatchCreateSql(projectIssueFieldValueModel,arrCreate))
        }
        let ret=await mysql.executeOne(generateQuerySql(workflowNodeFieldTypeModel,[],{
            id:id
        }))
        return ret;
    }

    async editWorkflowNodeFieldLabelType(workflowNodeFieldTypeId:string, labelType:number) {
        if(!workflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(workflowNodeFieldTypeModel,{
            label_type:labelType
        },{
            id:workflowNodeFieldTypeId
        }))
    }

    async deleteWorkflowNodeField(workflowNodeFieldTypeId:string) {
        if(!workflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(workflowNodeFieldTypeModel,[],{
            id:workflowNodeFieldTypeId
        }))
        if(obj) {
            await Promise.all([
                mysql.execute(generateDeleteSql(workflowNodeFieldTypeModel,{
                    id:workflowNodeFieldTypeId
                })),
                mysql.execute(generateDeleteSql(workflowNodeFieldTypeConfigModel,{
                    workflow_node_field_type_id:workflowNodeFieldTypeId
                })),
                mysql.execute(generateUpdateSql(workflowNodeFieldTypeModel,{
                    weight:{
                        exp:"-",
                        value:1
                    }
                },{
                    workflow_node_id:obj.workflow_node_id,
                    weight:{
                        exp:">",
                        value:obj.weight
                    }
                }))
            ])
        }
    }

    async moveWorkflowNodeField(workflowNodeFieldTypeId:string, weight:number) {
        if(!workflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(workflowNodeFieldTypeModel,[],{
            id:workflowNodeFieldTypeId
        }))
        if(obj) {
            if(weight>obj.weight) {
                await mysql.execute(generateUpdateSql(workflowNodeFieldTypeModel,{
                    weight:{
                        exp:"-",
                        value:1
                    }
                },{
                    workflow_node_id:obj.workflow_node_id,
                    weight:{
                        exp:"> <=",
                        value:[obj.weight,weight]
                    }
                }))
                await mysql.executeOne(generateUpdateSql(workflowNodeFieldTypeModel,{
                    weight: weight
                },{
                    id:workflowNodeFieldTypeId
                }))
            } else if(weight<obj.weight) {
                await mysql.execute(generateUpdateSql(workflowNodeFieldTypeModel,{
                    weight:{
                        exp:"+",
                        value:1
                    }
                },{
                    workflow_node_id:obj.workflow_node_id,
                    weight:{
                        exp:">= <",
                        value:[weight,obj.weight]
                    }
                }))
                await mysql.executeOne(generateUpdateSql(workflowNodeFieldTypeModel,{
                    weight: weight
                },{
                    id:workflowNodeFieldTypeId
                }))
            }
            let ret=await mysql.executeOne(generateQuerySql(workflowNodeFieldTypeModel,[],{
                id:workflowNodeFieldTypeId
            }))
            return ret;
        } else {
            return null;
        }
    }

    async listWorkflowNodeFieldConfig(workflowNodeFieldTypeId:string):Promise<ICommon_Model_Workflow_Node_Field_Type_Config[]> {
        if(!workflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(workflowNodeFieldTypeConfigModel,[],{
            workflow_node_field_type_id:workflowNodeFieldTypeId
        },"and",{
            field:"weight",
            type:"asc"
        }))
        return ret;
    }

    async addWorkflowNodeFieldConfig(workflowNodeFieldTypeId :string,value :string,selected :number,weight:number):Promise<ICommon_Model_Workflow_Node_Field_Type_Config> {
        if(!workflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        let id=await generateSnowId()
        await mysql.execute(generateCreateSql(workflowNodeFieldTypeConfigModel,{
            id:id,
            workflow_node_field_type_id:workflowNodeFieldTypeId,
            value:value,
            selected:selected,
            weight:weight
        }))
        let ret=await mysql.executeOne(generateQuerySql(workflowNodeFieldTypeConfigModel,[],{
            id
        }))
        return ret;
    }

    async getFieldByNodeFieldTypeId(workflowNodeFieldTypeId :string) {
        if(!workflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(workflowNodeFieldTypeModel,[],{
            id:workflowNodeFieldTypeId
        }))
        return ret;
    }

    async getFieldByFieldTypeConfigId(fieldTypeConfigValueId :string) {
        if(!fieldTypeConfigValueId) {
            throw Err.Project.Field.fieldTypeConfigValueIdNotFound
        }
        let mysql=getMysqlInstance()
        let obj = await mysql.executeOne(generateQuerySql(workflowNodeFieldTypeConfigModel,[],{
            id:fieldTypeConfigValueId
        }))
        if(!obj) {
            throw Err.Project.Field.fieldTypeConfigValueIdNotFound
        }
        let ret=await mysql.executeOne(generateQuerySql(workflowNodeFieldTypeModel,[],{
            id:obj.workflow_node_field_type_id
        }))
        return ret;
    }

    async checkFieldConfigValueSelectedExist(workflowNodeFieldTypeId:string) {
        if(!workflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(workflowNodeFieldTypeConfigModel,[],{
            workflow_node_field_type_id:workflowNodeFieldTypeId,
            selected:1
        }))
        return !!ret;
    }

    async editWorkflowNodeFieldConfig(fieldTypeConfigValueId :string,value :string,selected :number,weight:number):Promise<ICommon_Model_Workflow_Node_Field_Type_Config> {
        if(!fieldTypeConfigValueId) {
            throw Err.Project.Field.fieldTypeConfigValueIdNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(workflowNodeFieldTypeConfigModel,{
            value,
            selected,
            weight
        },{
            id:fieldTypeConfigValueId
        }))
        let ret=await mysql.executeOne(generateQuerySql(workflowNodeFieldTypeConfigModel,[],{
            id:fieldTypeConfigValueId
        }))
        return ret;
    }

    async deleteConfigByFieldId(fieldTypeId :string) {
        if(fieldTypeId===undefined ||fieldTypeId===null) {
            throw Err.Project.Field.fieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(workflowNodeFieldTypeConfigModel,{
            workflow_node_field_type_id:fieldTypeId
        }))
    }

    async deleteWorkflowNodeFieldConfigs(fieldTypeConfigValueIds :string[]) {
        if(!fieldTypeConfigValueIds) {
            throw Err.Project.Field.fieldTypeConfigValueIdNotFound
        }
        if(fieldTypeConfigValueIds.length>0) {
            let mysql=getMysqlInstance()
            await mysql.execute(generateDeleteSql(workflowNodeFieldTypeConfigModel,{
                id:{
                    exp:"in",
                    value:fieldTypeConfigValueIds
                }
            }))
        }
    }

    async workflowFieldsCopy(workflowNodeId:string,newWorkflowNodeId:string) {
        if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let mysql=getMysqlInstance()
        let arrFields=await mysql.execute(generateQuerySql(workflowNodeFieldTypeModel,[],{
            workflow_node_id:workflowNodeId
        }))
        let arrConfigValues:ICommon_Model_Workflow_Node_Field_Type_Config[]=[]
        if(arrFields.length>0) {
            arrConfigValues=await mysql.execute(generateQuerySql(workflowNodeFieldTypeConfigModel,[],{
                workflow_node_field_type_id:{
                    exp:"in",
                    value:arrFields.map(item=>item.id)
                }
            }))
        } 
        let objConfigValue=<{
            [param:string]:ICommon_Model_Workflow_Node_Field_Type_Config[]
        }>{}
        for(let obj of arrConfigValues) {
            obj.id=await generateSnowId()
            if(objConfigValue[obj.workflow_node_field_type_id]) {
                objConfigValue[obj.workflow_node_field_type_id].push(obj)
            } else {
                objConfigValue[obj.workflow_node_field_type_id]=[obj]
            }
        }
        for(let obj of arrFields) {
            let id=obj.id
            obj.id=await generateSnowId()
            obj.workflow_node_id=newWorkflowNodeId
            if(objConfigValue[id]) {
                for(let o of objConfigValue[id]) {
                    o.workflow_node_field_type_id=obj.id
                }
            }
        }
        if(arrFields && arrFields.length>0) {
            await mysql.execute(generateBatchCreateSql(workflowNodeFieldTypeModel,arrFields))
            let arr=await mysql.execute(generateQuerySql(projectIssueProcessModel,["project_issue_id"],{
                workflow_node_process:{
                    exp:"json_array_contain",
                    value:newWorkflowNodeId
                }
            }))
            if(arr.length>0) {
                let arrCreate:ICommon_Model_Project_Issue_Field_Value[]=[]
                for(let obj of arrFields) {
                    for(let objProjectIssue of arr) {
                        arrCreate.push({
                            id:await generateSnowId(),
                            workflow_node_field_type_id:obj.id,
                            project_issue_id:objProjectIssue.project_issue_id,
                            field_config_ids:null,
                            ref_values:null,
                            number_value:null,
                            string_value:null
                        })
                    }
                }
                await mysql.execute(generateBatchCreateSql(projectIssueFieldValueModel,arrCreate))
            }
        }
        let arr:ICommon_Model_Workflow_Node_Field_Type_Config[]=[]
        for(let id in objConfigValue) {
            for(let obj of objConfigValue[id]) {
                arr.push(obj)
            }
        }
        if(arr.length>0) {
            await mysql.execute(generateBatchCreateSql(workflowNodeFieldTypeConfigModel,arr))
        }
    }

    async getFieldTypesByFieldIds(fieldIds:string[]):Promise<{
        fieldId:string,
        fieldType:ICommon_Field_Type
    }[]> {
        if(fieldIds.length==0) {
            return []
        }
        let mysql=getMysqlInstance()
        let sql=generateQuerySql(workflowNodeFieldTypeModel,null,{
            id:{
                exp:"in",
                value:fieldIds
            }
        },"and",{
            field:"id",
            type:"field",
            value:fieldIds
        })
        let arr=await mysql.execute(sql)
        return arr.map(obj=>{
            return {
                fieldId:obj.id,
                fieldType:Field_Types[obj.field_type_id]
            }
        });
    }

    async clearFieldByWorkflowNodeId(workflowNodeId:string){
        let mysql=getMysqlInstance()
        let arr=await mysql.execute(generateQuerySql(workflowNodeFieldTypeModel,["id"],{
            workflow_node_id:workflowNodeId
        }))
        let arrPromise=[]
        if(arr.length>0) {
            arrPromise.push(mysql.execute(generateDeleteSql(workflowNodeFieldTypeModel, {
                workflow_node_id: workflowNodeId
            })))
            arrPromise.push(mysql.execute(generateDeleteSql(workflowNodeFieldTypeConfigModel,{
                workflow_node_field_type_id:{
                    exp:"in",
                    value:arr.map(item=>item.id)
                }
            })))
        }
        await Promise.all(arrPromise);
    }

    async setWorkflowNodeFieldsWeight(workflowNodeFieldTypeIds:string) {
        if(!workflowNodeFieldTypeIds) {
            return
        }
        let arr=workflowNodeFieldTypeIds.split(",")
        let arrPromise=[]
        let mysql=getMysqlInstance()
        for(let i=0;i<arr.length;i++) {
            arrPromise.push(mysql.execute(generateUpdateSql(workflowNodeFieldTypeModel,{
                weight:i
            },{
                id:arr[i]
            })))
        }
        await Promise.all(arrPromise)
    }
}

export let workflowNodeFieldTypeMapper=new WorkflowNodeFieldTypeMapper