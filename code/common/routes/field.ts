import { ECommon_Model_Field_Solution_Workflow_Node_Field_Type_Label_Type, ICommon_Model_Field_Solution_Workflow_Node_Field_Type } from '../model/field_solution_workflow_node_field_type';
import { ECommon_Services } from "../types";
import { ICommon_Model_Field_Solution } from './../model/field_solution';
import { ICommon_Model_Field_Type } from './../model/field_type';
import { ICommon_Model_Field_Type_Config_Value } from './../model/field_type_config_value';
import { ICommon_Route_Res_FieldSolution_Info, ICommon_Route_Res_FieldSolution_ListWorkflowNodeField } from "./response";
import { ECommon_HttpApi_Method } from "./types";

const api={
    baseUrl:"/field",
    service:ECommon_Services.Cooperation,
    routes:{
        typeList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/type/list",
            req:<{
                               
            }>{},
            res:<ICommon_Model_Field_Type[]>{},
            onlyAdmin:true
        },
        typeInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/type/item",
            req:<{
                fieldTypeId:string                
            }>{},
            res:<ICommon_Model_Field_Type>{},
            onlyAdmin:true
        },
        solutionList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/list",
            req:<{
                               
            }>{},
            res:<ICommon_Model_Field_Solution[]>{},
            onlyAdmin:true
        },
        solutionInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/item",
            req:<{
                fieldSolutionId:string                
            }>{},
            res:<ICommon_Route_Res_FieldSolution_Info>{},
            onlyAdmin:true
        },
        solutionCreate:{
            method:ECommon_HttpApi_Method.POST,
            path:"/solution/item",
            req:<{
                 name:string,
                 description?:string             
            }>{},
            res:<ICommon_Model_Field_Solution>{},
            onlyAdmin:true
        },
        solutionEdit:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/solution/item",
            req:<{
                fieldSolutionId:string
                name?:string,
                description?:string             
            }>{},
            res:<ICommon_Model_Field_Solution>{},
            onlyAdmin:true
        },
        solutionDelete:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/solution/item",
            req:<{
                fieldSolutionId:string             
            }>{},
            res:{},
            onlyAdmin:true
        },
        bindWorkflowSolution:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/solution/bind",
            req:<{
                fieldSolutionId:string,
                workflowSolutionId:string             
            }>{},
            res:{},
            onlyAdmin:true
        },
        unbindWorkflowSolution:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/solution/unbind",
            req:<{
                fieldSolutionId:string,
                workflowSolutionId:string             
            }>{},
            res:{},
            onlyAdmin:true
        },
        listWorkflowNodeField:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/field/list",
            req: <{
                fieldSolutionId: string,
                workflowNodeId: string,
                workflowId: string,
                workflowSolutionId: string
            }>{},
            res: <ICommon_Route_Res_FieldSolution_ListWorkflowNodeField[]>{},
            onlyAdmin:true
        },
        workflowNodeFieldInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/field/item",
            req: <{
                fieldSolutionWorkflowNodeFieldTypeId: string
            }>{},
            res: <ICommon_Route_Res_FieldSolution_ListWorkflowNodeField>{},
            onlyAdmin:true
        },
        addWorkflowNodeField:{
            method:ECommon_HttpApi_Method.POST,
            path:"/solution/field/item",
            req: <{
                fieldSolutionId: string,
                workflowNodeId: string,
                fieldTypeId: string,
                optional: number,
                defaultValue?: string,
                name: string,
                workflowId: string,
                workflowSolutionId: string,
                description?: string,
                weight?:number
            }>{},
            res: <ICommon_Model_Field_Solution_Workflow_Node_Field_Type>{},
            onlyAdmin:true
        },
        editWorkflowNodeFieldLabelType:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/solution/field/item/label",
            req: <{
                fieldSolutionWorkflowNodeFieldTypeId: string,
                labelType:ECommon_Model_Field_Solution_Workflow_Node_Field_Type_Label_Type
            }>{},
            res: {},
            onlyAdmin:true
        },
        editWorkflowNodeField:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/solution/field/item",
            req: <{
                fieldSolutionWorkflowNodeFieldTypeId:string,
                optional?: number,
                defaultValue?: string,
                name?: string,
                description?: string,
                lable_type?:ECommon_Model_Field_Solution_Workflow_Node_Field_Type_Label_Type,
                weight?:number
            }>{},
            res: <ICommon_Model_Field_Solution_Workflow_Node_Field_Type>{},
            onlyAdmin:true
        },
        deleteWorkflowNodeField:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/solution/field/item",
            req: <{
                fieldSolutionWorkflowNodeFieldTypeId:string
            }>{},
            res: {},
            onlyAdmin:true
        },
        moveWorkflowNodeField:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/solution/field/sort",
            req: <{
                fieldSolutionWorkflowNodeFieldTypeId:string,
                sort:number
            }>{},
            res: <ICommon_Model_Field_Solution_Workflow_Node_Field_Type>{},
            onlyAdmin:true
        },
        listWorkflowNodeFieldConfig:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/field/config/list",
            req: <{
                fieldSolutionWorkflowNodeFieldTypeId :string
            }>{},
            res: <ICommon_Model_Field_Type_Config_Value[]>{},
            onlyAdmin:true
        },
        addWorkflowNodeFieldConfig:{
            method:ECommon_HttpApi_Method.POST,
            path:"/solution/field/config/item",
            req: <{
                fieldSolutionWorkflowNodeFieldTypeId :string,
                data:{
                    id?:string,
                    value :string,
                    name :string,
                    selected :number
                }[]
            }>{},
            res: <ICommon_Model_Field_Type_Config_Value[]>{},
            onlyAdmin:true
        },
        editWorkflowNodeFieldConfig:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/solution/field/config/item",
            req: <{
                fieldTypeConfigValueId :string,
                value? :string,
                name? :string,
                selected? :number
            }>{},
            res: <ICommon_Model_Field_Type_Config_Value>{},
            onlyAdmin:true
        },
        deleteWorkflowNodeFieldConfig:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/solution/field/config/item",
            req: <{
                fieldTypeConfigValueId :string
            }>{},
            res: {},
            onlyAdmin:true
        },
        workflowFieldsCopy:{
            method:ECommon_HttpApi_Method.POST,
            path:"/solution/workflow/copy",
            req:<{
                fieldSolutionId:string,
                workflowSolutionId:string,
                workflowId:string,
                newFieldSolutionId:string,
                newWorkflowSolutionId:string
            }>{},
            res:{},
            onlyAdmin:true
        },
        workflowCanCopyedList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/workflow/copy/list",
            req:<{
                fieldSolutionId:string,
                workflowSolutionId:string,
                workflowId:string
            }>{},
            res:<{
                workflowSolution:{
                    id:string,
                    name:string
                },
                fieldSolution:{
                    id:string,
                    name:string
                }
            }[]>{},
            onlyAdmin:true
        }
    }
}

export default api