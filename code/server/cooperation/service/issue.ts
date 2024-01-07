import {ICommon_Model_Workflow_Node_Field_Type} from '../../../common/model/workflow_node_field_type';
import {ICommon_Model_Workflow_Node_Field_Type_Config} from '../../../common/model/workflow_node_field_type_config';
import {
    ICommon_Route_Req_ProjectIssue_Field,
    ICommon_Route_Req_ProjectIssue_Field_Value,
    ICommon_Route_Res_ProjectIssue_fieldsInfo
} from "../../../common/routes/response";
import {Err} from '../../../common/status/error';
import {Entity} from "../../common/entity/entity";
import {generateSnowId} from '../../common/util/sql';
import {ProjectService} from "../service/project";
import {ICommon_Model_Project_Issue, projectIssueModel} from './../../../common/model/project_issue';
import {ICommon_Model_Project_Issue_Field_Value} from './../../../common/model/project_issue_field_value';
import {projectIssueApprovalMapper, projectIssueHistoryMapper, projectIssueMapper} from './../mapper/issue';
import {WorkflowNodeFieldTypeService} from './field';
import {ProjectModuleService} from './module';
import {WorkflowActionService, WorkflowApprovalService, WorkflowNodeService, WorkflowService} from './workflow';
import {ECommon_Field_Type, ICommon_Field_Type} from "../../../common/field/type";
import {ProjectReleaseService} from "./release";
import {IServer_Common_Event_Types} from "../../common/event/types";
import rpcContentApi from "../../content/rpc/content"
import {ECommon_Model_Content_Type} from "../../../common/model/content";
import {
    ECommon_Model_Project_Issue_History_Type,
    projectIssueHistoryModel
} from "../../../common/model/project_issue_history";
import {ECommon_Model_Workflow_Approval_Type} from "../../../common/model/workflow_approval";
import rpcUserApi from "../../user/rpc/user"
import {
    ECommon_Model_Project_Issue_Approval_Action,
    ECommon_Model_Project_Issue_Approval_Type,
    ICommon_Model_Project_Issue_Approval,
    projectIssueApprovalModel
} from "../../../common/model/project_issue_approval";
import {ICommon_Model_Workflow_Action} from "../../../common/model/workflow_action";
import {ICommon_Model_Workflow_Node} from "../../../common/model/workflow_node";
import {BoardSprintIssueService} from "./board";
import {PlanTableService} from "./plan";

export class ProjectIssueService extends Entity<typeof projectIssueModel, typeof projectIssueMapper> {
    constructor() {
        super(projectIssueMapper)
    }

    static async globalSearch(keyword: string, size: number, organizationUserId: string) {
        let ret = await projectIssueMapper.globalSearch(keyword, size, organizationUserId)
        return ret;
    }

    static async recentIssueList(organizationUserId: string, size: number) {
        let ret = await projectIssueMapper.recentIssueList(organizationUserId, size)
        return ret;
    }

    async convert(issueTypeId: string, values: ICommon_Route_Req_ProjectIssue_Field[], organizationUserId: string) {
        if (this.getItem().issue_type_id === issueTypeId) {
            return
        }
        await projectIssueMapper.clearBeforeConvert(this.getId())
        let objFirstNode = await WorkflowService.getFirstNode(issueTypeId)
        if (!objFirstNode) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        this.assignItem({
            issue_type_id: issueTypeId,
            workflow_node_id: objFirstNode.id
        })
        await Promise.all([
            this.update(),
            projectIssueMapper.handleProcess(this.getId(), objFirstNode.id),
            this.createFieldValues(values)
        ])
        let objHistory = new ProjectIssueHistoryService()
        objHistory.assignItem({
            project_issue_id: this.getId(),
            type: ECommon_Model_Project_Issue_History_Type.ISSUE_TYPE_CONVERT,
            organization_user_id: organizationUserId,
            project_id: this.getItem().project_id,
        })
        objHistory.create()
    }

    async createFieldValues(values: ICommon_Route_Req_ProjectIssue_Field[]) {
        if (!Array.isArray(values) || !values) {
            return
        }
        let fieldIds = values.map(item => item.fieldId)
        let fieldTypes = await WorkflowNodeFieldTypeService.getFieldTypesByFieldIds(fieldIds)
        let newFields = fieldTypes.map(item => item.fieldId)
        let arr = <ICommon_Model_Project_Issue_Field_Value[]>[];
        for (let i = 0; i < newFields.length; i++) {
            let val = newFields[i]
            let index = fieldIds.indexOf(val)
            if (index > -1) {
                let obj = values[index]
                let objFieldType = fieldTypes[i]
                let ret = await this.generateFieldValue(objFieldType, obj)
                arr.push(ret)
            }
        }
        if (arr.length > 0) {
            await projectIssueMapper.createFieldValues(arr);
        }
    }

    async checkApproval(organizationUserId: string) {
        let process = await projectIssueMapper.getProcess(this.getId())
        let objWorkFlowApproval = await WorkflowApprovalService.getItemByExp({
            workflow_node_id: process[process.length - 1]
        })
        if (!objWorkFlowApproval) {
            throw Err.Project.Workflow.approvalNotFound
        }
        switch (objWorkFlowApproval.getItem().type) {
            case ECommon_Model_Workflow_Approval_Type.PERSON: {
                let organizationUserIds = objWorkFlowApproval.getItem().value
                if (organizationUserIds.includes(organizationUserId)) {
                    return true
                } else {
                    return false
                }
                break
            }
            case ECommon_Model_Workflow_Approval_Type.TEAM: {
                let teamIds = objWorkFlowApproval.getItem().value
                let arrTeamPerson = await Promise.allSettled(teamIds.map(item => {
                    return rpcUserApi.listTeamUser(item).then(data => {
                        return data.map(item => item.id)
                    })
                }))
                let tagId = objWorkFlowApproval.getItem().extra
                let tagPerson = []
                if (tagId) {
                    tagPerson = await rpcUserApi.listTagUser(tagId).then(data => {
                        return data.map(item => item.organizationUser.id)
                    })
                }
                let arrPerson = [...tagPerson]
                for (let obj of arrTeamPerson) {
                    if (obj.status === "fulfilled") {
                        arrPerson.push(...obj.value)
                    }
                }
                if (arrPerson.includes(organizationUserId)) {
                    return true
                }
                return false
                break
            }
            case ECommon_Model_Workflow_Approval_Type.FIELD: {
                let fieldTypeId = objWorkFlowApproval.getItem().value[0]
                let obj = await projectIssueMapper.getFieldValueByProjectIssueAndFieldType(this.getId(), fieldTypeId)
                let users = obj.ref_values
                if (users.includes(organizationUserId)) {
                    return true
                } else {
                    return false
                }
                break
            }
        }
        return false
    }

    async revokeApproval() {
        let process = await projectIssueMapper.getProcess(this.getId())
        let lastWorkflowId = process?.[process.length - 1]
        if (lastWorkflowId) {
            let objWorkflowNode = await WorkflowNodeService.getItemById(lastWorkflowId)
            if (objWorkflowNode?.getItem().is_approval) {
                let workflowId = process?.[process.length - 2]
                objWorkflowNode = await WorkflowNodeService.getItemById(workflowId)
                if (objWorkflowNode) {
                    await Promise.all([
                        projectIssueMapper.handleProcess(this.getId(), objWorkflowNode.getId()),
                        (async () => {
                            let objApproval = await ProjectIssueApprovalService.getItemByExp({
                                project_issue_id: this.getId()
                            })
                            await objApproval?.delete()
                        })()
                    ])
                }
            }
        }
    }

    async resolveApproval(organizationUserId: string) {
        let process = await projectIssueMapper.getProcess(this.getId())
        let objWorkflow = await WorkflowNodeService.getItemById(process[process.length - 1])
        if (objWorkflow?.getItem().is_approval) {
            let objApproval = await ProjectIssueApprovalService.getItemByExp({
                project_issue_id: this.getId()
            })
            if (objApproval?.getItem().type === ECommon_Model_Project_Issue_Approval_Type.PENDING) {
                objApproval.assignItem({
                    type: ECommon_Model_Project_Issue_Approval_Type.RESOLVED,
                    approval_organization_user_id: organizationUserId
                })
                await objApproval.update()
                this.assignItem({
                    workflow_node_id: objWorkflow.getId()
                })
                await this.update()
                let objHistory = new ProjectIssueHistoryService()
                objHistory.assignItem({
                    project_issue_id: this.getId(),
                    type: ECommon_Model_Project_Issue_History_Type.APPROVAL_RESOLVE,
                    organization_user_id: organizationUserId,
                    project_id: this.getItem().project_id
                })
                objHistory.create()
            }
        }
    }

    async rejectApproval(organizationUserId: string, reason: string) {
        let process = await projectIssueMapper.getProcess(this.getId())
        let objWorkflow = await WorkflowNodeService.getItemById(process[process.length - 1])
        if (objWorkflow?.getItem().is_approval) {
            let objApproval = await ProjectIssueApprovalService.getItemByExp({
                project_issue_id: this.getId()
            })
            if (objApproval?.getItem().type === ECommon_Model_Project_Issue_Approval_Type.PENDING) {
                objApproval.assignItem({
                    type: ECommon_Model_Project_Issue_Approval_Type.REJECTED,
                    approval_organization_user_id: organizationUserId
                })
                await objApproval.update(reason)
                let objHistory = new ProjectIssueHistoryService()
                objHistory.assignItem({
                    project_issue_id: this.getId(),
                    type: ECommon_Model_Project_Issue_History_Type.APPROVAL_REJECT,
                    organization_user_id: organizationUserId,
                    project_id: this.getItem().project_id
                })
                objHistory.create()
            }
        }
    }

    async commitApproval() {
        let process = await projectIssueMapper.getProcess(this.getId())
        let objWorkflow = await WorkflowNodeService.getItemById(process[process.length - 1])
        if (objWorkflow?.getItem().is_approval) {
            let objApproval = await ProjectIssueApprovalService.getItemByExp({
                project_issue_id: this.getId()
            })
            if (objApproval?.getItem().type === ECommon_Model_Project_Issue_Approval_Type.REJECTED) {
                objApproval.assignItem({
                    type: ECommon_Model_Project_Issue_Approval_Type.PENDING,
                    approval_organization_user_id: null
                })
                await objApproval.update()
            }
        }
    }

    async generateFieldValue(objFieldType: {
        fieldId: string,
        fieldType: ICommon_Field_Type
    }, obj: ICommon_Route_Req_ProjectIssue_Field, fieldValueId?: string): Promise<ICommon_Model_Project_Issue_Field_Value> {
        let ret = <ICommon_Model_Project_Issue_Field_Value>{}
        let id = fieldValueId ?? await generateSnowId()
        if (objFieldType.fieldType.type == ECommon_Field_Type.DATE || objFieldType.fieldType.type == ECommon_Field_Type.TIME || objFieldType.fieldType.type == ECommon_Field_Type.TEXT || objFieldType.fieldType.type == ECommon_Field_Type.MULTITEXT) {
            ret = {
                id: id,
                project_issue_id: this.getId(),
                string_value: obj.value as string ?? "",
                workflow_node_field_type_id: objFieldType.fieldId,
                number_value: null,
                ref_values: null,
                field_config_ids: null
            }
        } else if (objFieldType.fieldType.type == ECommon_Field_Type.SWITCH) {
            ret = {
                id: id,
                project_issue_id: this.getId(),
                number_value: obj.value as number,
                workflow_node_field_type_id: objFieldType.fieldId,
                string_value: null,
                ref_values: null,
                field_config_ids: null
            }
        } else if (objFieldType.fieldType.type == ECommon_Field_Type.SELECT || objFieldType.fieldType.type == ECommon_Field_Type.MULTISELECT) {
            ret = {
                id: id,
                project_issue_id: this.getId(),
                field_config_ids: objFieldType.fieldType.type == ECommon_Field_Type.MULTISELECT ? (obj.value as string[] ?? []) : (obj.value ? [obj.value as string] : []),
                workflow_node_field_type_id: objFieldType.fieldId,
                string_value: null,
                ref_values: null,
                number_value: null,
            }
        } else if (objFieldType.fieldType.type == ECommon_Field_Type.LABEL || objFieldType.fieldType.type == ECommon_Field_Type.MULTILABEL) {
            ret = {
                id: id,
                project_issue_id: this.getId(),
                ref_values: objFieldType.fieldType.type == ECommon_Field_Type.MULTILABEL ? (obj.value as string[] ?? []) : (obj.value ? [obj.value as string] : []),
                number_value: null,
                workflow_node_field_type_id: objFieldType.fieldId,
                string_value: null,
                field_config_ids: null
            }
        }
        return ret;
    }

    async updateFieldValue(value: ICommon_Route_Req_ProjectIssue_Field_Value, organizationUserId: string) {
        if (!value) {
            return
        }
        let fieldTypes = await WorkflowNodeFieldTypeService.getFieldTypesByFieldIds([value.fieldId])
        if (fieldTypes && fieldTypes.length > 0) {
            let obj = await this.generateFieldValue(fieldTypes[0], value, value.fieldValueId)
            let ret = await projectIssueMapper.updateFieldValue(obj)
            WorkflowNodeFieldTypeService.getItemById(value.fieldId).then(data => {
                if (data) {
                    let objHistory = new ProjectIssueHistoryService()
                    objHistory.assignItem({
                        project_issue_id: this.getId(),
                        name: data.getItem().name,
                        type: ECommon_Model_Project_Issue_History_Type.UPDATE_FIELD,
                        organization_user_id: organizationUserId,
                        project_id: this.getItem().project_id
                    })
                    objHistory.create()
                }
            })
            return ret;
        }
    }

    override async create(): Promise<ICommon_Model_Project_Issue> {
        let project = await ProjectService.getItemById(this.item.project_id)
        if (!project) {
            throw Err.Project.projectNotFound
        }
        let info = await project.getFirstNodeInfo(this.item.issue_type_id)
        if (!info) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        this.item.workflow_node_id = info.id
        this.item.unique_id = await projectIssueMapper.getAvailableUniqueId(this.item.project_id)
        let obj = await super.create()
        await projectIssueMapper.handleProcess(obj.id, info.id)
        await rpcContentApi.save(obj.id, ECommon_Model_Content_Type.PROJECT_ISSUE_DESCRIPTION, obj.created_by, "")
        let objHistory = new ProjectIssueHistoryService()
        objHistory.assignItem({
            project_issue_id: obj.id,
            type: ECommon_Model_Project_Issue_History_Type.CREATE_ISSUE,
            organization_user_id: obj.created_by,
            project_id: project.getId(),
            value: obj.name
        })
        objHistory.create()
        return obj;
    }

    async getNextNodeFields(workflowActionId: string) {
        let destNodeId = ""
        if (workflowActionId.startsWith("_")) {
            destNodeId = workflowActionId.substring(1)
        } else {
            let obj = await WorkflowActionService.getItemById(workflowActionId)
            if (!obj) {
                throw Err.Project.Workflow.workflowActionNotFound
            }
            destNodeId = obj.getItem().dest_node_id
        }
        let process = await projectIssueMapper.getProcess(this.getId())
        if (process && process.includes(destNodeId)) {
            return []
        }
        let ret = await this.getWorkflowNodeFields(destNodeId)
        return ret;
    }

    async getWorkflowNodeFields(workflowNodeId: string) {
        if (!workflowNodeId) {
            return null;
        }
        let ret = await WorkflowNodeFieldTypeService.listWorkflowNodeField(workflowNodeId);
        return ret;
    }

    async confirmNextNode(workflowActionId: string, values: ICommon_Route_Req_ProjectIssue_Field[], organizationUserId: string) {
        let destNodeId = ""
        if (workflowActionId.startsWith("_")) {
            destNodeId = workflowActionId.substring(1)
        } else {
            let obj = await WorkflowActionService.getItemById(workflowActionId)
            if (!obj) {
                throw Err.Project.Workflow.workflowActionNotFound
            }
            destNodeId = obj.getItem().dest_node_id
        }
        if (destNodeId) {
            await this.handleConfirmNextNode(destNodeId, values)
            WorkflowNodeService.getItemById(destNodeId).then(data => {
                if (data) {
                    let objHistory = new ProjectIssueHistoryService()
                    objHistory.assignItem({
                        project_issue_id: this.getId(),
                        type: ECommon_Model_Project_Issue_History_Type.UPDATE_NODE,
                        organization_user_id: organizationUserId,
                        project_id: this.getItem().project_id,
                        value: data.getItem().name
                    })
                    objHistory.create()
                }
            })
        }
    }

    async handleConfirmNextNode(workflowNodeId: string, values: ICommon_Route_Req_ProjectIssue_Field[]) {
        let objDestNode = await WorkflowNodeService.getItemById(workflowNodeId)
        if (!objDestNode) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let process = await projectIssueMapper.getProcess(this.getId())
        await Promise.all([
            (async () => {
                if (!objDestNode.getItem().is_approval) {
                    this.assignItem({
                        workflow_node_id: workflowNodeId
                    })
                    await this.update()
                }
            })(),
            this.createFieldValues(values),
            projectIssueMapper.handleProcess(this.getId(), workflowNodeId),
            (async () => {
                let objApproval = await ProjectIssueApprovalService.getItemByExp({
                    project_issue_id: this.getId()
                })
                if (objApproval) {
                    await objApproval.delete()
                }
                if (objDestNode.getItem().is_approval && !process.includes(objDestNode.getId())) {
                    objApproval = new ProjectIssueApprovalService
                    objApproval.assignItem({
                        project_issue_id: this.getId(),
                        workflow_node_id: objDestNode.getId(),
                        type: ECommon_Model_Project_Issue_Approval_Type.PENDING
                    })
                    await objApproval.create()
                }
            })()
        ])
    }

    async fieldsInfo() {
        let process = await projectIssueMapper.getProcess(this.getId())
        if (!process) {
            return []
        }
        let fieldValues = await projectIssueMapper.getFieldValues(this.getId());
        if (!fieldValues || fieldValues.length == 0) {
            return []
        }
        let objFieldsInfo = <{
            [weight: number]: {
                field: ICommon_Model_Workflow_Node_Field_Type;
                fieldType: ICommon_Field_Type;
                values?: ICommon_Model_Workflow_Node_Field_Type_Config[];
            }[]
        }>{}
        for (let obj of process) {
            let fieldsInfo = await WorkflowNodeFieldTypeService.listWorkflowNodeField(obj)
            for (let fieldInfo of fieldsInfo) {
                let weight = fieldInfo.field.weight
                if (objFieldsInfo[weight]) {
                    objFieldsInfo[weight].push(fieldInfo)
                } else {
                    objFieldsInfo[weight] = [fieldInfo]
                }
            }
        }
        let arr: {
            weight: number,
            data: {
                field: ICommon_Model_Workflow_Node_Field_Type;
                fieldType: ICommon_Field_Type;
                values?: ICommon_Model_Workflow_Node_Field_Type_Config[];
            }[]
        }[] = []
        for (let weight in objFieldsInfo) {
            let isMatch = false;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].weight < parseInt(weight)) {
                    arr.splice(i, 0, {
                        weight: parseInt(weight),
                        data: objFieldsInfo[weight]
                    })
                    isMatch = true
                    break
                }
            }
            if (!isMatch) {
                arr.push({
                    weight: parseInt(weight),
                    data: objFieldsInfo[weight]
                })
            }
        }
        let arr1: {
            field: ICommon_Model_Workflow_Node_Field_Type;
            fieldType: ICommon_Field_Type;
            values?: ICommon_Model_Workflow_Node_Field_Type_Config[];
        }[] = []
        for (let obj of arr) {
            arr1 = arr1.concat(obj.data)
        }
        let arr2: ICommon_Route_Res_ProjectIssue_fieldsInfo[] = []
        for (let obj of arr1) {
            for (let obj1 of fieldValues) {
                if (obj1.workflow_node_field_type_id == obj.field.id) {
                    arr2.push({
                        nodeField: obj,
                        issueFieldValue: obj1
                    });
                }
            }
        }
        return arr2;
    }

    async editDescription(description: string, organizationUserId: string) {
        await rpcContentApi.save(this.getId(), ECommon_Model_Content_Type.PROJECT_ISSUE_DESCRIPTION, organizationUserId, description)
        let objHistory = new ProjectIssueHistoryService()
        objHistory.assignItem({
            project_issue_id: this.getId(),
            name: "Description",
            type: ECommon_Model_Project_Issue_History_Type.UPDATE_FIELD,
            organization_user_id: organizationUserId,
            project_id: this.getItem().project_id
        })
        objHistory.create()
    }

    async getDescription() {
        let ret = await rpcContentApi.get(this.getId(), ECommon_Model_Content_Type.PROJECT_ISSUE_DESCRIPTION)
        return ret?.content;
    }

    override async delete(eventPulish?: keyof IServer_Common_Event_Types): Promise<void> {
        await super.delete()
        await projectIssueMapper.clear(this.getId())
        await rpcContentApi.clearByRefId(this.getId())
        await projectIssueHistoryMapper.clear(this.getId())
        let objApproval = await ProjectIssueApprovalService.getItemByExp({
            project_issue_id: this.getId()
        })
        await objApproval?.delete()
        await BoardSprintIssueService.clearByIssueTypeIds([this.getId()])
        await PlanTableService.removeIssue(this.getId())
    }

    async getBasicInfo() {
        let [ret, process] = await Promise.all([
            projectIssueMapper.getBasicInfo(this.getId()),
            await projectIssueMapper.getProcess(this.getId())
        ])
        let approval = await this.getApprovalInfo(process)
        return {
            ...ret,
            approval
        };
    }

    async getApprovalInfo(process?: string[]) {
        let approval: ICommon_Model_Project_Issue_Approval & {
            reason?: string,
            workflowNode: ICommon_Model_Workflow_Node
        }
        if (!process) {
            process = await projectIssueMapper.getProcess(this.getId())
        }
        let workflowNode = await WorkflowNodeService.getItemById(process[process.length - 1])
        if (workflowNode.getItem().is_approval) {
            let obj = await ProjectIssueApprovalService.getItemByExp({
                project_issue_id: this.getId()
            })
            if (obj) {
                approval = await obj.info()
            }
        }
        return approval
    }

    static async getObjByUniqueKey(uniqueKey: string) {
        if (!uniqueKey || !uniqueKey.includes("-")) {
            throw Err.Project.ProjectIssue.uniqueKeyError
        }
        let arr = uniqueKey.split("-")
        let project = await ProjectService.getObjByKeyword(arr[0])
        if (!project) {
            return null;
        }
        let uniqueId = parseInt(arr[1])
        let projectIssueItem = await projectIssueMapper.getItemByUniqueId(uniqueId)
        if (!projectIssueItem) {
            return null;
        }
        if (projectIssueItem.project_id != project.getId()) {
            return null;
        }
        let obj = new ProjectIssueService()
        obj.setItem(projectIssueItem)
        return obj

    }

    async actionsInfo(organizationUserId: string): Promise<ICommon_Model_Workflow_Action[] | {
        isApproval: true,
        type: ECommon_Model_Project_Issue_Approval_Action
    }[]> {
        let process = await projectIssueMapper.getProcess(this.getId())
        let workflowNode = await WorkflowNodeService.getItemById(process[process.length - 1])
        if (!workflowNode) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        if (workflowNode.getItem().is_approval) {
            let objApproval = await ProjectIssueApprovalService.getItemByExp({
                project_issue_id: this.getId()
            })
            if (objApproval) {
                if (objApproval.getItem().type === ECommon_Model_Project_Issue_Approval_Type.PENDING) {
                    let access = await this.checkApproval(organizationUserId)
                    if (access) {
                        return [
                            {
                                isApproval: true,
                                type: ECommon_Model_Project_Issue_Approval_Action.RESOLVE
                            },
                            {
                                isApproval: true,
                                type: ECommon_Model_Project_Issue_Approval_Action.REJECT
                            }
                        ]
                    } else {
                        return [
                            {
                                isApproval: true,
                                type: ECommon_Model_Project_Issue_Approval_Action.REVOKE
                            }
                        ]
                    }
                } else if (objApproval.getItem().type === ECommon_Model_Project_Issue_Approval_Type.REJECTED) {
                    return [
                        {
                            isApproval: true,
                            type: ECommon_Model_Project_Issue_Approval_Action.REVOKE
                        },
                        {
                            isApproval: true,
                            type: ECommon_Model_Project_Issue_Approval_Action.COMMIT
                        }
                    ]
                } else if (objApproval.getItem().type === ECommon_Model_Project_Issue_Approval_Type.RESOLVED) {
                    let ret = await workflowNode.getActionList()
                    return ret;
                }
            } else {
                return []
            }
        } else {
            let ret = await workflowNode.getActionList()
            return ret;
        }
    }

    override async copy(deletedFields?: (keyof ICommon_Model_Project_Issue)[]): Promise<this> {
        let obj = await super.copy(["unique_id"])
        obj.assignItem({
            unique_id: await projectIssueMapper.getAvailableUniqueId(this.item.project_id)
        })
        await Promise.all([
            obj.update(),
            projectIssueMapper.copyIssue(this.getId(), obj.getId()),
            (async () => {
                let objDescription = await rpcContentApi.get(this.getId(), ECommon_Model_Content_Type.PROJECT_ISSUE_DESCRIPTION)
                if (objDescription) {
                    await rpcContentApi.save(obj.getId(), ECommon_Model_Content_Type.PROJECT_ISSUE_DESCRIPTION, objDescription.created_by, objDescription.content)
                }
            })()
        ])
        let objHistory = new ProjectIssueHistoryService()
        objHistory.assignItem({
            project_issue_id: obj.getItem().id,
            type: ECommon_Model_Project_Issue_History_Type.CREATE_ISSUE,
            organization_user_id: obj.getItem().created_by,
            project_id: obj.getItem().project_id,
            value: obj.getItem().name
        })
        objHistory.create()
        return obj;
    }

    async addChildIssue(projectIssueChildId: string) {
        let obj = await ProjectIssueService.getItemById(projectIssueChildId)
        if (!obj) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssueMapper.addChildIssue(this.getId(), obj.getId());
        await PlanTableService.addChildIssue(this.getId(), projectIssueChildId)
    }

    async removeChildIssue(projectIssueChildId: string) {
        let obj = await ProjectIssueService.getItemById(projectIssueChildId)
        if (!obj) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssueMapper.removeChildIssue(this.getId(), obj.getId());
        await PlanTableService.removeIssue(projectIssueChildId)
    }

    async addParentIssue(projectIssueParentId: string) {
        let obj = await ProjectIssueService.getItemById(projectIssueParentId)
        if (!obj) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssueMapper.addChildIssue(obj.getId(), this.getId());
        await PlanTableService.addChildIssue(projectIssueParentId, this.getId())
    }

    async removeParentIssue(projectIssueParentId: string) {
        let obj = await ProjectIssueService.getItemById(projectIssueParentId)
        if (!obj) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssueMapper.removeChildIssue(obj.getId(), this.getId());
        await PlanTableService.removeIssue(this.getId())
    }

    async addRelatedIssue(projectIssueRelatedId: string) {
        let obj = await ProjectIssueService.getItemById(projectIssueRelatedId)
        if (!obj) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssueMapper.addRelatedIssue(this.getId(), obj.getId());
    }

    async removeRelatedIssue(projectIssueRelatedId: string) {
        let obj = await ProjectIssueService.getItemById(projectIssueRelatedId)
        if (!obj) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        await projectIssueMapper.removeRelatedIssue(this.getId(), obj.getId());
    }

    async otherInfoList() {
        let arr = await Promise.all([
            projectIssueMapper.parentIssue(this.getId()),
            projectIssueMapper.childIssueList(this.getId()),
            projectIssueMapper.relatedIssueList(this.getId()),
            projectIssueMapper.issueLabelList(this.getId()),
            projectIssueMapper.issueModuleList(this.getId())
        ])
        return {
            parent: arr[0],
            children: arr[1],
            relateds: arr[2],
            labels: arr[3],
            modules: arr[4]
        }
    }

    async childIssueList() {
        let ret = await projectIssueMapper.childIssueList(this.getId())
        return ret;
    }

    async bindLabels(labelIds: string[], organizationUserId: string) {
        await projectIssueMapper.bindIssueLabels(this.getId(), labelIds)
        let ret = await projectIssueMapper.issueLabelList(this.getId());
        let objHistory = new ProjectIssueHistoryService()
        objHistory.assignItem({
            project_issue_id: this.getId(),
            name: "Label",
            type: ECommon_Model_Project_Issue_History_Type.UPDATE_FIELD,
            organization_user_id: organizationUserId,
            project_id: this.getItem().project_id,
            value: ret.map(item => item.name).join(",")
        })
        objHistory.create()
        return ret;
    }


    async bindModule(moduleId: string, organizationUserId: string) {
        if (moduleId) {
            let obj = await ProjectModuleService.getItemById(moduleId)
            if (!obj) {
                throw Err.Project.Module.moduleNotFound
            }
        }
        await projectIssueMapper.bindIssueModule(this.getId(), moduleId)
        let ret = await projectIssueMapper.issueModuleList(this.getId())
        let objHistory = new ProjectIssueHistoryService()
        objHistory.assignItem({
            project_issue_id: this.getId(),
            name: "Module",
            type: ECommon_Model_Project_Issue_History_Type.UPDATE_FIELD,
            organization_user_id: organizationUserId,
            project_id: this.getItem().project_id,
            value: ret.map(item => item.name).join(",")
        })
        objHistory.create()
        return ret;
    }


    static async filter(organizationId: string, projectId: string, page: number, size: number, createdBy?: string, issueTypeId?: string, name?: string, priority?: number, assignerId?: string, reporterId?: string, status?: number, moduleId?: string, labelId?: string, projectIssueIds?: string[]) {
        let ret = await projectIssueMapper.filter(organizationId, projectId, page, size, createdBy, issueTypeId, name, priority, assignerId, reporterId, status, moduleId, labelId, projectIssueIds)
        return ret;
    }

    static async clearByProjectIds(projectIds: string[]) {
        let ret = await projectIssueMapper.getIdsByProjectIds(projectIds);
        if (ret.length > 0) {
            await projectIssueMapper.clearMany(ret);
            await rpcContentApi.clearByRefIds(ret)
        }
        await projectIssueHistoryMapper.clearByProjectIds(projectIds)
    }

    static async clearIssueValueByFieldTypeId(workflowFieldTypeId: string) {
        await projectIssueMapper.clearIssueValueByFieldTypeId(workflowFieldTypeId)
    }

    static async clearByIssueTypeId(issueTypeId: string) {
        await projectIssueMapper.clearByIssueTypeId(issueTypeId)
    }

    async releaseList() {
        let ret = await ProjectReleaseService.issueReleaseList(this.getId())
        return ret;
    }

    async bindReleases(projectReleaseIds: string[], organizationUserId: string) {
        let ret = await ProjectReleaseService.issueBindReleaseList(this.getId(), projectReleaseIds)
        let objHistory = new ProjectIssueHistoryService()
        objHistory.assignItem({
            project_issue_id: this.getId(),
            name: "Release",
            type: ECommon_Model_Project_Issue_History_Type.UPDATE_FIELD,
            organization_user_id: organizationUserId,
            project_id: this.getItem().project_id,
            value: ret.map(item => item.name).join(",")
        })
        objHistory.create()
        return ret;
    }

    async getOrganizationUserIdsByIssueExtraField() {
        let ret = await projectIssueMapper.getOrganizationUserIdsByIssueExtraField(this.getId())
        return ret;
    }

    static async clearWorkflowNode(workflowNodeId: string) {
        let arr = await ProjectIssueService.getItemsByExp({
            workflow_node_id: workflowNodeId
        })
        await Promise.allSettled(arr.map(obj => {
            return projectIssueMapper.getProcess(obj.getId()).then(process => {
                let index = process.indexOf(workflowNodeId)
                let lastWorkflowNodeId = process[index - 1]
                return obj.handleConfirmNextNode(lastWorkflowNodeId, null)
            })
        }))
        await projectIssueMapper.clearWorkflowNodeProcessAndFields(workflowNodeId)
    }

    static async clearWorkflowNodeFieldTypeConfig(fieldTypeConfigValueId: string) {
        await projectIssueMapper.clearWorkflowNodeFieldTypeConfig(fieldTypeConfigValueId)
    }
}

export class ProjectIssueHistoryService extends Entity<typeof projectIssueHistoryModel, typeof projectIssueHistoryMapper> {
    constructor() {
        super(projectIssueHistoryMapper)
    }

    static async list(projectIssueId: string) {
        let ret = await projectIssueHistoryMapper.list(projectIssueId)
        return ret;
    }
}

export class ProjectIssueApprovalService extends Entity<typeof projectIssueApprovalModel, typeof projectIssueApprovalMapper> {
    constructor() {
        super(projectIssueApprovalMapper)
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types): Promise<void> {
        await super.delete(eventPublish);
        await rpcContentApi.clearByRefIdAndType(this.getItem().project_issue_id, ECommon_Model_Content_Type.PROJECT_ISSUE_REJECT)
    }

    async info() {
        let reason: string
        if (this.getItem().type === ECommon_Model_Project_Issue_Approval_Type.REJECTED) {
            let obj = await rpcContentApi.get(this.getItem().project_issue_id, ECommon_Model_Content_Type.PROJECT_ISSUE_REJECT)
            reason = obj.content
        }
        let objWorkflow = await WorkflowNodeService.getItemById(this.getItem().workflow_node_id)
        return {
            ...this.getItem(),
            workflowNode: objWorkflow.getItem(),
            reason
        }
    }

    override async update(reason?: any): Promise<typeof projectIssueApprovalModel["model"]> {
        if (this._item.type === ECommon_Model_Project_Issue_Approval_Type.REJECTED && this._item.type !== this.getItem().type) {
            await rpcContentApi.clearByRefIdAndType(this.getItem().project_issue_id, ECommon_Model_Content_Type.PROJECT_ISSUE_REJECT)
        }
        let ret = await super.update();
        if (ret.type === ECommon_Model_Project_Issue_Approval_Type.REJECTED && reason) {
            await rpcContentApi.save(this.getItem().project_issue_id, ECommon_Model_Content_Type.PROJECT_ISSUE_REJECT, ret.approval_organization_user_id, reason)
        }
        return ret
    }
}