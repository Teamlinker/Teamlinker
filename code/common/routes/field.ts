import {
    ECommon_Model_Workflow_Node_Field_Type_Label_Type,
    ICommon_Model_Workflow_Node_Field_Type
} from '../model/workflow_node_field_type';
import {ECommon_Services} from "../types";
import {ICommon_Model_Workflow_Node_Field_Type_Config} from '../model/workflow_node_field_type_config';
import {ICommon_Route_Res_Workflow_Node_Field} from "./response";
import {ECommon_HttpApi_Method} from "./types";
import {Permission_Types} from "../permission/permission";
import {ECommon_Field_Type, ICommon_Field_Type} from "../field/type";

const api={
    baseUrl:"/field",
    service:ECommon_Services.Cooperation,
    routes:{
        typeList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/type/list",
            req:<{
                               
            }>{},
            res:<ICommon_Field_Type[]>{},
            permission:[Permission_Types.Organization.READ]
        },
        typeInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/type/item",
            req:<{
                fieldTypeId:ECommon_Field_Type
            }>{},
            res:<ICommon_Field_Type>{},
            permission:[Permission_Types.Organization.READ]
        },
        listWorkflowNodeField:{
            method:ECommon_HttpApi_Method.GET,
            path:"/field/list",
            req: <{
                workflowNodeId: string,
            }>{},
            res: <ICommon_Route_Res_Workflow_Node_Field[]>{},
            permission:[Permission_Types.Organization.READ]
        },
        workflowNodeFieldInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/field/item",
            req: <{
                workflowNodeFieldTypeId: string
            }>{},
            res: <ICommon_Route_Res_Workflow_Node_Field>{},
            permission:[Permission_Types.Organization.READ]
        },
        addWorkflowNodeField:{
            method:ECommon_HttpApi_Method.POST,
            path:"/field/item",
            req: <{
                workflowNodeId: string,
                fieldTypeId: ECommon_Field_Type,
                optional: number,
                defaultStringValue?: string,
                defaultNumberValue?:number,
                name: string,
                description?: string,
            }>{},
            res: <ICommon_Model_Workflow_Node_Field_Type>{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        editWorkflowNodeFieldLabelType:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/field/item/label",
            req: <{
                workflowNodeFieldTypeId: string,
                labelType:ECommon_Model_Workflow_Node_Field_Type_Label_Type
            }>{},
            res: {},
            permission:[Permission_Types.Organization.ADMIN]
        },
        editWorkflowNodeField:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/field/item",
            req: <{
                workflowNodeFieldTypeId:string,
                optional?: number,
                defaultStringValue?: string,
                defaultNumberValue?:number,
                name?: string,
                description?: string,
                labelType:ECommon_Model_Workflow_Node_Field_Type_Label_Type
            }>{},
            res: <ICommon_Model_Workflow_Node_Field_Type>{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        deleteWorkflowNodeField:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/field/item",
            req: <{
                workflowNodeFieldTypeId:string
            }>{},
            res: {},
            permission:[Permission_Types.Organization.ADMIN]
        },
        moveWorkflowNodeField:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/field/weight",
            req: <{
                workflowNodeFieldTypeId:string,
                weight:number
            }>{},
            res: <ICommon_Model_Workflow_Node_Field_Type>{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        listWorkflowNodeFieldConfig:{
            method:ECommon_HttpApi_Method.GET,
            path:"/field/config/list",
            req: <{
                workflowNodeFieldTypeId :string
            }>{},
            res: <ICommon_Model_Workflow_Node_Field_Type_Config[]>{},
            permission:[Permission_Types.Organization.READ]
        },
        editWorkflowNodeFieldConfig:{
            method:ECommon_HttpApi_Method.POST,
            path:"/field/config/item",
            req: <{
                workflowNodeFieldTypeId :string,
                data:{
                    id?:string
                    value :string,
                    selected :number
                }[]
            }>{},
            res: <ICommon_Model_Workflow_Node_Field_Type_Config[]>{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        workflowFieldsCopy:{
            method:ECommon_HttpApi_Method.POST,
            path:"/copy",
            req:<{
                workflowNodeId:string,
                newWorkflowNodeId:string,
                overwrite:number
            }>{},
            res:{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        setWorkflowNodeFieldsWeight:{
            method:ECommon_HttpApi_Method.POST,
            path:"/weight",
            req:<{
                workflowNodeFieldTypeIds:string,
            }>{},
            res:{},
            permission:[Permission_Types.Organization.ADMIN]
        }
    }
}

export default api