import { fieldSolutionModel } from '../../../common/model/field_solution';
import { fieldSolutionWorkflowNodeFieldTypeModel, ICommon_Model_Field_Solution_Workflow_Node_Field_Type } from '../../../common/model/field_solution_workflow_node_field_type';
import { ICommon_Model_Field_Type_Config_Value } from '../../../common/model/field_type_config_value';
import { ICommon_Model_Workflow_Solution, workflowSolutionModel } from '../../../common/model/workflow_solution';
import { Err } from '../../../common/status/error';
import { keys } from '../../../common/transform';
import { getMysqlInstance } from '../../common/db/mysql';
import { Mapper } from "../../common/entity/mapper";
import { generateBatchCreateSql, generateCreateSql, generateDeleteSql, generateLeftJoin2Sql, generateLeftJoinSql, generateMaxSql, generateQuerySql, generateSnowId, generateUpdateSql } from '../../common/util/sql';
import { ICommon_Model_Field_Solution } from './../../../common/model/field_solution';
import { ECommon_Model_Field_Solution_Workflow_Node_Field_Type_Label_Type } from './../../../common/model/field_solution_workflow_node_field_type';
import { fieldSolutionWorkflowSolutionModel } from './../../../common/model/field_solution_workflow_solution';
import { ECommon_Model_Field_Type, fieldTypeModel, ICommon_Model_Field_Type } from './../../../common/model/field_type';
import { fieldTypeConfigValueModel } from './../../../common/model/field_type_config_value';

class FieldTypeMapper extends Mapper<typeof fieldTypeModel> {
    constructor() {
        super(fieldTypeModel)
    }
    async list():Promise<ICommon_Model_Field_Type[]>
    {
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(fieldTypeModel,[],null,null,{
            field:"name",
            type:"asc"
        }))
        return ret;
    }

    async init() {
        let mysql = getMysqlInstance()
        let fieldTypeLabelId = await generateSnowId()
        let fieldTypeMultiLabelId = await generateSnowId()
        let fieldTypeTextId = await generateSnowId()
        let fieldTypeMultiTextId = await generateSnowId()
        let fieldTypeSelectId = await generateSnowId()
        let fieldTypeMultiSelectId = await generateSnowId()
        let fieldTypeSwitchId = await generateSnowId()
        let fieldTypeTimeId = await generateSnowId()
        let fieldTypeDateId = await generateSnowId()
        let fieldTypeDateTimeId = await generateSnowId()
        await mysql.execute(generateBatchCreateSql(fieldTypeModel, [{
            id: fieldTypeLabelId,
            name: "label",
            type: ECommon_Model_Field_Type.LABEL
        }, {
            id: fieldTypeMultiLabelId,
            name: "multi label",
            multi: 1,
            type: ECommon_Model_Field_Type.MULTILABEL
        }, {
            id: fieldTypeTextId,
            name: "text",
            type: ECommon_Model_Field_Type.TEXT
        }, {
            id: fieldTypeMultiTextId,
            name: "multi text",
            type: ECommon_Model_Field_Type.MULTITEXT
        }, {
            id: fieldTypeSelectId,
            name: "select",
            type: ECommon_Model_Field_Type.SELECT
        }, {
            id: fieldTypeMultiSelectId,
            name: "multi select",
            multi: 1,
            type: ECommon_Model_Field_Type.MULTISELECT
        }, {
            id: fieldTypeSwitchId,
            name: "switch",
            type: ECommon_Model_Field_Type.SWITCH
        }, {
            id: fieldTypeTimeId,
            name: "timepicker",
            type: ECommon_Model_Field_Type.TIME
        }, {
            id: fieldTypeDateId,
            name: "datepicker",
            type: ECommon_Model_Field_Type.DATE
        }, {
            id: fieldTypeDateTimeId,
            name: "datetimepicker",
            type: ECommon_Model_Field_Type.DATETIME
        }]))
    }
}

export let fieldTypeMapper=new FieldTypeMapper

class FieldSolutionMapper extends Mapper<typeof fieldSolutionModel> {
    constructor() {
        super(fieldSolutionModel)
    }
    async list(organizationId:string):Promise<ICommon_Model_Field_Solution[]>
    {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(fieldSolutionModel,[],{
            organization_id:organizationId
        },null,{
            field:"name",
            type:"asc"
        }))
        return ret;
    }
    async getBindWorkflowSolutionList(fieldSolutionId:string):Promise<ICommon_Model_Workflow_Solution[]> {
        if(!fieldSolutionId) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:fieldSolutionWorkflowSolutionModel
        },{
            model:workflowSolutionModel,
            columns:keys<ICommon_Model_Workflow_Solution>().map(item=>item.name),
            expression:{
                id:{
                    model:fieldSolutionWorkflowSolutionModel,
                    field:"workflow_solution_id"
                }
            }
        },{
            field_solution_id:{
                model:fieldSolutionWorkflowSolutionModel,
                value:fieldSolutionId
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }

    async workflowNodeFieldInfo(fieldSolutionWorkflowNodeFieldTypeId:string):Promise<{
        field:ICommon_Model_Field_Solution_Workflow_Node_Field_Type,
        fieldType:ICommon_Model_Field_Type,
        values?:ICommon_Model_Field_Type_Config_Value[]
    }> {
        if(!fieldSolutionWorkflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:fieldSolutionWorkflowNodeFieldTypeModel,
            columns:keys<ICommon_Model_Field_Solution_Workflow_Node_Field_Type>().map(item=>item.name),
        },{
            model:fieldTypeModel,
            columns:keys<ICommon_Model_Field_Type>().map(item=>item.name),
            expression:{
                id:{
                    model:fieldSolutionWorkflowNodeFieldTypeModel,
                    field:"field_type_id"
                }
            },
            aggregation:"fieldType"
        },{
            id:{
                model:fieldSolutionWorkflowNodeFieldTypeModel,
                value:fieldSolutionWorkflowNodeFieldTypeId
            }
        })
        let objField=await mysql.executeOne(sql)
        let objFieldType = objField.fieldType
        delete objField.fieldType
        let ret=<{
            field:ICommon_Model_Field_Solution_Workflow_Node_Field_Type,
            fieldType:ICommon_Model_Field_Type,
            values?:ICommon_Model_Field_Type_Config_Value[]
        }>{
            field: objField,
            fieldType: objFieldType,
            values: []
        }
        let arrValues = await mysql.execute(generateQuerySql(fieldTypeConfigValueModel, [], {
            field_solution_workflow_node_field_type_id: objField.id
        }))
        ret.values = arrValues
        return ret;
    }

    async getWorkflowNodeFieldList(fieldSolutionId:string,workflowNodeId:string,workflowId:string,workflowSolutionId:string):Promise<{
        field:ICommon_Model_Field_Solution_Workflow_Node_Field_Type,
        fieldType:ICommon_Model_Field_Type,
        values?:ICommon_Model_Field_Type_Config_Value[]
    }[]> {
        if(!fieldSolutionId) {
            throw Err.Project.Field.fieldSolutionNotFound
        } else if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        } else if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        } else if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:fieldSolutionWorkflowNodeFieldTypeModel,
            columns:keys<ICommon_Model_Field_Solution_Workflow_Node_Field_Type>().map(item=>item.name),
        },{
            model:fieldTypeModel,
            columns:keys<ICommon_Model_Field_Type>().map(item=>item.name),
            expression:{
                id:{
                    model:fieldSolutionWorkflowNodeFieldTypeModel,
                    field:"field_type_id"
                }
            },
            aggregation:"fieldType"
        },{
            field_solution_id:{
                model:fieldSolutionWorkflowNodeFieldTypeModel,
                value:fieldSolutionId
            },
            workflow_id:{
                model:fieldSolutionWorkflowNodeFieldTypeModel,
                value:workflowId
            },
            workflow_node_id:{
                model:fieldSolutionWorkflowNodeFieldTypeModel,
                value:workflowNodeId
            },
            workflow_solution_id:{
                model:fieldSolutionWorkflowNodeFieldTypeModel,
                value:workflowSolutionId
            }
        },"and",{
            model:fieldSolutionWorkflowNodeFieldTypeModel,
            field:"sort",
            type:"asc"
        })
        let arrField=await mysql.execute(sql)
        let ret:{
            field:ICommon_Model_Field_Solution_Workflow_Node_Field_Type,
            fieldType:ICommon_Model_Field_Type,
            values?:ICommon_Model_Field_Type_Config_Value[]
        }[]=[]
        for(let objField of arrField) {
            let objFieldType=objField.fieldType
            delete objField.fieldType
            let obj:{
                field:ICommon_Model_Field_Solution_Workflow_Node_Field_Type,
                fieldType:ICommon_Model_Field_Type,
                values?:ICommon_Model_Field_Type_Config_Value[]
            }={
                field:objField,
                fieldType:objFieldType,
                values:[]
            }
            let arrValues=await mysql.execute(generateQuerySql(fieldTypeConfigValueModel,[],{
                field_solution_workflow_node_field_type_id:objField.id
            }))
            obj.values=arrValues
            ret.push(obj)
        }
        return ret;
    }
    async clearFieldSolution(fieldSolutionId:string) {
        if(!fieldSolutionId) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(fieldSolutionWorkflowSolutionModel,{
            field_solution_id:fieldSolutionId
        }))
        let arrField=await mysql.execute(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,["id"],{
            field_solution_id:fieldSolutionId
        }))
        await mysql.execute(generateDeleteSql(fieldSolutionWorkflowNodeFieldTypeModel,{
            field_solution_id:fieldSolutionId
        }))
        if(arrField.length>0) {
            await mysql.execute(generateDeleteSql(fieldTypeConfigValueModel,{
                field_solution_workflow_node_field_type_id:{
                    exp:"in",
                    value:arrField.map(item=>item.id)
                }
            }))
        } 
    }

    async clearFieldSolutionByOrganizationId(organizationId:string) {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(fieldSolutionModel,["id"],{
            organization_id:organizationId
        }))
        let fieldSolutionIds=ret.map(item=>item.id)
        if(fieldSolutionIds.length>0) {
            await mysql.execute(generateDeleteSql(fieldSolutionModel,{
                organization_id:organizationId
            }))
            await mysql.execute(generateDeleteSql(fieldSolutionWorkflowSolutionModel,{
                field_solution_id:{
                    exp:"in",
                    value:fieldSolutionIds
                }
            }))
            let arrField=await mysql.execute(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,["id"],{
                field_solution_id:{
                    exp:"in",
                    value:fieldSolutionIds
                }
            }))
            await mysql.execute(generateDeleteSql(fieldSolutionWorkflowNodeFieldTypeModel,{
                field_solution_id:{
                    exp:"in",
                    value:fieldSolutionIds
                }
            }))
            if(arrField.length>0) {
                await mysql.execute(generateDeleteSql(fieldTypeConfigValueModel,{
                    field_solution_workflow_node_field_type_id:{
                        exp:"in",
                        value:arrField.map(item=>item.id)
                    }
                }))
            } 
        }
        
    }

    async clearItemsByWorkflowId(workflowId:string) {
        if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let mysql=getMysqlInstance()
        let arr=await mysql.execute(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,["id"],{
            workflow_id:workflowId
        }))
        await mysql.execute(generateDeleteSql(fieldSolutionWorkflowNodeFieldTypeModel,{
            workflow_id:workflowId
        }))
        if(arr.length>0) {
            await mysql.execute(generateDeleteSql(fieldTypeConfigValueModel,{
                field_solution_workflow_node_field_type_id:{
                    exp:"in",
                    value:arr.map(item=>item.id)
                }
            }))
        }
        
    }

    async clearItemsByWorkflowSolutionId(workflowSolutionId:string) {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let arr=await mysql.execute(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,["id"],{
            workflow_solution_id:workflowSolutionId
        }))
        await mysql.execute(generateDeleteSql(fieldSolutionWorkflowNodeFieldTypeModel,{
            workflow_solution_id:workflowSolutionId
        }))
        if(arr.length>0) {
            await mysql.execute(generateDeleteSql(fieldTypeConfigValueModel,{
                field_solution_workflow_node_field_type_id:{
                    exp:"in",
                    value:arr.map(item=>item.id)
                }
            }))
        }
    }

    async clearItemsByWorkflowNodeId(workflowNodeId:string) {
        if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let mysql=getMysqlInstance()
        let arr=await mysql.execute(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,["id"],{
            workflow_node_id:workflowNodeId
        }))
        await mysql.execute(generateDeleteSql(fieldSolutionWorkflowNodeFieldTypeModel,{
            workflow_node_id:workflowNodeId
        }))
        if(arr.length>0) {
            await mysql.execute(generateDeleteSql(fieldTypeConfigValueModel,{
                field_solution_workflow_node_field_type_id:{
                    exp:"in",
                    value:arr.map(item=>item.id)
                }
            }))
        }
    }

    async clearItemsByWorkflowIdAndWorkflowSolutionId(workflowId:string,workflowSolutionId:string) {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        } else if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let mysql=getMysqlInstance()
        let arr=await mysql.execute(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,["id"],{
            workflow_solution_id:workflowSolutionId,
            workflow_id:workflowId
        }))
        await mysql.execute(generateDeleteSql(fieldSolutionWorkflowNodeFieldTypeModel,{
            workflow_solution_id:workflowSolutionId,
            workflow_id:workflowId
        }))
        if(arr.length>0) {
            await mysql.execute(generateDeleteSql(fieldTypeConfigValueModel,{
                field_solution_workflow_node_field_type_id:{
                    exp:"in",
                    value:arr.map(item=>item.id)
                }
            }))
        }
    }

    async bindWorkflowSolution(fieldSolutionId:string,workflowSolutionId:string) {
        if(!fieldSolutionId) {
            throw Err.Project.Field.fieldSolutionNotFound
        } else if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateCreateSql(fieldSolutionWorkflowSolutionModel,{
            id:await generateSnowId(),
            field_solution_id:fieldSolutionId,
            workflow_solution_id:workflowSolutionId
        }))
    }

    async unbindWorkflowSolution(fieldSolutionId:string,workflowSolutionId:string) {
        if(!fieldSolutionId) {
            throw Err.Project.Field.fieldSolutionNotFound
        } else if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(fieldSolutionWorkflowSolutionModel,{
            field_solution_id:fieldSolutionId,
            workflow_solution_id:workflowSolutionId
        }))
        let arrField=await mysql.execute(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,["id"],{
            field_solution_id:fieldSolutionId,
            workflow_solution_id:workflowSolutionId
        }))
        await mysql.execute(generateDeleteSql(fieldSolutionWorkflowNodeFieldTypeModel,{
            field_solution_id:fieldSolutionId,
            workflow_solution_id:workflowSolutionId
        }))
        if(arrField.length>0) {
            await mysql.execute(generateDeleteSql(fieldTypeConfigValueModel,{
                field_solution_workflow_node_field_type_id:{
                    exp:"in",
                    value:arrField.map(item=>item.id)
                }
            }))
        }
        
    }

    async getItemByWorkflowSolutionId(workflowSolutionId:string) {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:fieldSolutionWorkflowSolutionModel
        },{
            model:fieldSolutionModel,
            columns:keys<ICommon_Model_Field_Solution>().map(item=>item.name),
            expression:{
                id:{
                    model:fieldSolutionWorkflowSolutionModel,
                    field:"field_solution_id"
                }
            }
        },{
            workflow_solution_id:{
                model:fieldSolutionWorkflowSolutionModel,
                value:workflowSolutionId
            }
        })
        let ret=await mysql.executeOne(sql)
        return ret
    }

    async checkWorkflowSolution(fieldSolutionId:string,workflowSolutionId:string):Promise<boolean> {
        if(!fieldSolutionId) {
            throw Err.Project.Field.fieldSolutionNotFound
        } else if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(fieldSolutionWorkflowSolutionModel,["id"],{
            field_solution_id:fieldSolutionId,
            workflow_solution_id:workflowSolutionId
        }))
        return ret!=null
    }

    async addWorkflowNodeField(fieldSolutionId:string,workflowNodeId:string,workflowId:string,workflowSolutionId:string,fieldTypeId:string,name:string,optional:number,defaultValue?:string,description?:string,weight?:number):Promise<ICommon_Model_Field_Solution_Workflow_Node_Field_Type> {
        if(!fieldSolutionId) {
            throw Err.Project.Field.fieldSolutionNotFound
        } else if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        } else if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        } else if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        } else if(!fieldTypeId) {
            throw Err.Project.Field.fieldTypeNotFound
        }
        let sort=0,mysql=getMysqlInstance()
        let existSort=await mysql.executeOne(generateMaxSql(fieldSolutionWorkflowNodeFieldTypeModel,"sort",{
            field_solution_id:fieldSolutionId,
            workflow_node_id:workflowNodeId,
            workflow_id:workflowId,
            workflow_solution_id:workflowSolutionId
        }))
        if(existSort && existSort.sort) {
            sort=existSort.sort+1
        }
        let id=await generateSnowId()
        await mysql.execute(generateCreateSql(fieldSolutionWorkflowNodeFieldTypeModel,{
            field_solution_id:fieldSolutionId,
            workflow_node_id:workflowNodeId,
            workflow_id:workflowId,
            workflow_solution_id:workflowSolutionId,
            id:id,
            field_type_id:fieldTypeId,
            name,
            default_value:defaultValue,
            optional,
            description,
            sort,
            weight
        }))
        let ret=await mysql.executeOne(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,[],{
            id:id
        }))
        return ret;
    }

    async editWorkflowNodeFieldLableType(fieldSolutionWorkflowNodeFieldTypeId:string,labelType:number) {
        if(!fieldSolutionWorkflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(fieldSolutionWorkflowNodeFieldTypeModel,{
            label_type:labelType
        },{
            id:fieldSolutionWorkflowNodeFieldTypeId
        }))
    }

    async editWorkflowNodeField(fieldSolutionWorkflowNodeFieldTypeId:string,name?:string,optional?:number,defaultValue?:string,description?:string,labelType?:ECommon_Model_Field_Solution_Workflow_Node_Field_Type_Label_Type,weight?:number):Promise<ICommon_Model_Field_Solution_Workflow_Node_Field_Type> {
        if(!fieldSolutionWorkflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(fieldSolutionWorkflowNodeFieldTypeModel,{
            name,
            optional,
            default_value:defaultValue,
            description,
            label_type:labelType,
            weight
        },{
            id:fieldSolutionWorkflowNodeFieldTypeId
        }))
        let ret=await mysql.executeOne(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,[],{
            id:fieldSolutionWorkflowNodeFieldTypeId
        }))
        return ret;
    }

    async deleteWorkflowNodeField(fieldSolutionWorkflowNodeFieldTypeId:string) {
        if(!fieldSolutionWorkflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,[],{
            id:fieldSolutionWorkflowNodeFieldTypeId
        }))
        if(obj) {
            await mysql.execute(generateDeleteSql(fieldSolutionWorkflowNodeFieldTypeModel,{
                id:fieldSolutionWorkflowNodeFieldTypeId
            }))
            await mysql.execute(generateDeleteSql(fieldTypeConfigValueModel,{
                field_solution_workflow_node_field_type_id:fieldSolutionWorkflowNodeFieldTypeId
            }))
            await mysql.execute(generateUpdateSql(fieldSolutionWorkflowNodeFieldTypeModel,{
                sort:{
                    exp:"-",
                    value:1
                }
            },{
                field_solution_id:obj.field_solution_id,
                workflow_node_id:obj.workflow_node_id,
                workflow_id:obj.workflow_id,
                workflow_solution_id:obj.workflow_solution_id,
                sort:{
                    exp:">",
                    value:obj.sort
                }
            }))
        }
    }

    async moveWorkflowNodeField(fieldSolutionWorkflowNodeFieldTypeId:string,sort:number) {
        if(!fieldSolutionWorkflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,[],{
            id:fieldSolutionWorkflowNodeFieldTypeId
        }))
        if(obj) {
            if(sort>obj.sort) {
                await mysql.execute(generateUpdateSql(fieldSolutionWorkflowNodeFieldTypeModel,{
                    sort:{
                        exp:"-",
                        value:1
                    }
                },{
                    field_solution_id:obj.field_solution_id,
                    workflow_node_id:obj.workflow_node_id,
                    workflow_id:obj.workflow_id,
                    workflow_solution_id:obj.workflow_solution_id,
                    sort:{
                        exp:"> <=",
                        value:[obj.sort,sort]
                    }
                }))
                await mysql.executeOne(generateUpdateSql(fieldSolutionWorkflowNodeFieldTypeModel,{
                    sort
                },{
                    id:fieldSolutionWorkflowNodeFieldTypeId
                }))
            } else if(sort<obj.sort) {
                await mysql.execute(generateUpdateSql(fieldSolutionWorkflowNodeFieldTypeModel,{
                    sort:{
                        exp:"+",
                        value:1
                    }
                },{
                    field_solution_id:obj.field_solution_id,
                    workflow_node_id:obj.workflow_node_id,
                    workflow_id:obj.workflow_id,
                    workflow_solution_id:obj.workflow_solution_id,
                    sort:{
                        exp:">= <",
                        value:[sort,obj.sort]
                    }
                }))
                await mysql.executeOne(generateUpdateSql(fieldSolutionWorkflowNodeFieldTypeModel,{
                    sort
                },{
                    id:fieldSolutionWorkflowNodeFieldTypeId
                }))
            }
            let ret=await mysql.executeOne(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,[],{
                id:fieldSolutionWorkflowNodeFieldTypeId
            }))
            return ret;
        } else {
            return null;
        }
    }

    async listWorkflowNodeFieldConfig(fieldSolutionWorkflowNodeFieldTypeId:string):Promise<ICommon_Model_Field_Type_Config_Value[]> {
        if(!fieldSolutionWorkflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(fieldTypeConfigValueModel,[],{
            field_solution_workflow_node_field_type_id:fieldSolutionWorkflowNodeFieldTypeId
        },"and",{
            field:"name",
            type:"asc"
        }))
        return ret;
    }

    async addWorkflowNodeFieldConfig(fieldSolutionWorkflowNodeFieldTypeId :string,value :string,name :string,selected :number):Promise<ICommon_Model_Field_Type_Config_Value> {
        if(!fieldSolutionWorkflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        let id=await generateSnowId()
        await mysql.execute(generateCreateSql(fieldTypeConfigValueModel,{
            id:id,
            field_solution_workflow_node_field_type_id:fieldSolutionWorkflowNodeFieldTypeId,
            value:value,
            name:name,
            selected:selected
        }))
        let ret=await mysql.executeOne(generateQuerySql(fieldTypeConfigValueModel,[],{
            id
        }))
        return ret;
    }

    async getFieldByNodeFieldTypeId(fieldSolutionWorkflowNodeFieldTypeId :string) {
        if(!fieldSolutionWorkflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,[],{
            id:fieldSolutionWorkflowNodeFieldTypeId
        }))
        return ret;
    }

    async getFieldByFieldTypeConfigId(fieldTypeConfigValueId :string) {
        if(!fieldTypeConfigValueId) {
            throw Err.Project.Field.fieldTypeConfigValueIdNotFound
        }
        let mysql=getMysqlInstance()
        let obj = await mysql.executeOne(generateQuerySql(fieldTypeConfigValueModel,[],{
            id:fieldTypeConfigValueId
        }))
        if(!obj) {
            throw Err.Project.Field.fieldTypeConfigValueIdNotFound
        }
        let ret=await mysql.executeOne(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,[],{
            id:obj.field_solution_workflow_node_field_type_id
        }))
        return ret;
    }

    async checkFieldConfigValueSelectedExist(fieldSolutionWorkflowNodeFieldTypeId:string) {
        if(!fieldSolutionWorkflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(fieldTypeConfigValueModel,[],{
            field_solution_workflow_node_field_type_id:fieldSolutionWorkflowNodeFieldTypeId,
            selected:1
        }))
        return !!ret;
    }

    async editWorkflowNodeFieldConfig(fieldTypeConfigValueId :string,value? :string,name? :string,selected? :number):Promise<ICommon_Model_Field_Type_Config_Value> {
        if(!fieldTypeConfigValueId) {
            throw Err.Project.Field.fieldTypeConfigValueIdNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(fieldTypeConfigValueModel,{
            name,
            value,
            selected
        },{
            id:fieldTypeConfigValueId
        }))
        let ret=await mysql.executeOne(generateQuerySql(fieldTypeConfigValueModel,[],{
            id:fieldTypeConfigValueId
        }))
        return ret;
    }

    async deleteWorkflowNodeFieldConfig(fieldTypeConfigValueId :string) {
        if(!fieldTypeConfigValueId) {
            throw Err.Project.Field.fieldTypeConfigValueIdNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(fieldTypeConfigValueModel,{
            id:fieldTypeConfigValueId
        }))
    }

    async deleteWorkflowNodeFieldConfigs(fieldTypeConfigValueIds :string[]) {
        if(!fieldTypeConfigValueIds) {
            throw Err.Project.Field.fieldTypeConfigValueIdNotFound
        }
        if(fieldTypeConfigValueIds.length>0) {
            let mysql=getMysqlInstance()
            await mysql.execute(generateDeleteSql(fieldTypeConfigValueModel,{
                id:{
                    exp:"in",
                    value:fieldTypeConfigValueIds
                }
            }))
        }
    }

    async getSolutionByFieldSolutionWorkflowNodeFieldTypeId(fieldSolutionWorkflowNodeFieldTypeId:string) {
        if(!fieldSolutionWorkflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,[],{
            id:fieldSolutionWorkflowNodeFieldTypeId
        }))
        if(!obj) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let ret=await mysql.executeOne(generateQuerySql(fieldSolutionModel,[],{
            id:obj.field_solution_id
        }))
        return ret;
    }

    async getSolutionByFieldTypeConfigTypeId(fieldTypeConfigTypeId:string) {
        if(!fieldTypeConfigTypeId) {
            throw Err.Project.Field.fieldTypeConfigValueIdNotFound
        }
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(fieldTypeConfigValueModel,[],{
            id:fieldTypeConfigTypeId
        }))
        if(!obj) {
            throw Err.Project.Field.fieldTypeConfigValueIdNotFound
        }
        let obj1=await mysql.executeOne(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,[],{
            id:obj.field_solution_workflow_node_field_type_id
        }))
        if(!obj1) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let ret=await mysql.executeOne(generateQuerySql(fieldSolutionModel,[],{
            id:obj1.field_solution_id
        }))
        return ret;
    }

    async workflowFieldsCopy(fieldSolutionId:string,workflowSolutionId:string,workflowId:string,newFieldSolutionId:string,newWorkflowSolutionId:string) {
        if(!fieldSolutionId) {
            throw Err.Project.Field.fieldSolutionNotFound
        } else if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        } else if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        } else if(!newFieldSolutionId) {
            throw Err.Project.Field.fieldSolutionNotFound
        } else if(!newWorkflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let arrFields=await mysql.execute(generateQuerySql(fieldSolutionWorkflowNodeFieldTypeModel,[],{
            field_solution_id:fieldSolutionId,
            workflow_solution_id:workflowSolutionId,
            workflow_id:workflowId
        }))
        let arrConfigValues:ICommon_Model_Field_Type_Config_Value[]=[]
        if(arrFields.length>0) {
            arrConfigValues=await mysql.execute(generateQuerySql(fieldTypeConfigValueModel,[],{
                field_solution_workflow_node_field_type_id:{
                    exp:"in",
                    value:arrFields.map(item=>item.id)
                }
            }))
        } 
        let objConfigValue=<{
            [param:string]:ICommon_Model_Field_Type_Config_Value[]
        }>{}
        for(let obj of arrConfigValues) {
            obj.id=await generateSnowId()
            if(objConfigValue[obj.field_solution_workflow_node_field_type_id]) {
                objConfigValue[obj.field_solution_workflow_node_field_type_id].push(obj)
            } else {
                objConfigValue[obj.field_solution_workflow_node_field_type_id]=[obj]
            }
        }
        for(let obj of arrFields) {
            let id=obj.id
            obj.id=await generateSnowId()
            obj.workflow_id=workflowId
            obj.workflow_solution_id=newWorkflowSolutionId
            obj.field_solution_id=newFieldSolutionId
            if(objConfigValue[id]) {
                for(let o of objConfigValue[id]) {
                    o.field_solution_workflow_node_field_type_id=id
                }
            }
        }
        await mysql.execute(generateBatchCreateSql(fieldSolutionWorkflowNodeFieldTypeModel,arrFields))
        let arr:ICommon_Model_Field_Type_Config_Value[]=[]
        for(let id in objConfigValue) {
            for(let obj of objConfigValue[id]) {
                arr.push(obj)
            }
        }
        if(arr.length>0) {
            await mysql.execute(generateBatchCreateSql(fieldTypeConfigValueModel,arr))
        }
    }

    async getFieldTypesByFieldIds(fieldIds:string[]):Promise<{
        fieldId:string,
        fieldType:ICommon_Model_Field_Type
    }[]> {
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:fieldSolutionWorkflowNodeFieldTypeModel,
            columns:["id"],
            rename:{
                fields:["id"],
                newFields:["fieldId"]
            }
        },{
            model:fieldTypeModel,
            columns:keys<ICommon_Model_Field_Type>().map(item=>item.name),
            expression:{
                id:{
                    model:fieldSolutionWorkflowNodeFieldTypeModel,
                    field:"field_type_id"
                }
            },
            aggregation:"fieldType"
        },{
            id:{
                model:fieldSolutionWorkflowNodeFieldTypeModel,
                value:{
                    exp:"in",
                    value:fieldIds
                }
            }
        })
        let arr=await mysql.execute(sql)
        return arr;
    }

    async getFieldSolutionWorkflowSolutionListByWorkflowSolutionIds(workflowSolutionIds:string[]) {
        let mysql=getMysqlInstance()
        let sql=generateLeftJoin2Sql({
            model:fieldSolutionWorkflowSolutionModel
        },{
            model:fieldSolutionModel,
            columns:["id","name"],
            expression:{
                id:{
                    model:fieldSolutionWorkflowSolutionModel,
                    field:"field_solution_id"
                }
            },
            aggregation:"fieldSolution"
        },{
            model:workflowSolutionModel,
            columns:["id","name"],
            expression:{
                id:{
                    model:fieldSolutionWorkflowSolutionModel,
                    field:"workflow_solution_id"
                }
            },
            aggregation:"workflowSolution"
        },{
            workflow_solution_id:{
                model:fieldSolutionWorkflowSolutionModel,
                value:{
                    exp:"in",
                    value:workflowSolutionIds
                }
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }
}

export let fieldSolutionMapper=new FieldSolutionMapper