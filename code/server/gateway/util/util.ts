import * as crypto from "crypto";
import * as fs from "fs-extra";
import { Table_Project } from '../../../common/model/project';
import { Table_Project_Issue } from "../../../common/model/project_issue";
import { Table_Workflow, workflowModel } from "../../../common/model/workflow";
import { workflowActionModel } from "../../../common/model/workflow_action";
import { workflowNodeModel } from "../../../common/model/workflow_node";
import { workflowSolutionModel } from "../../../common/model/workflow_solution";
import { Table_Workflow_Solution_Workflow_Issue_Type, workflowSolutionWorkflowIssueTypeModel } from "../../../common/model/workflow_solution_workflow_issue_type";
import { Permission_Base, Permission_Types } from '../../../common/permission/permission';
import { getMysqlInstance } from "../../common/db/mysql";
import { getNacosInstance } from '../../common/nacos/nacos';
import { generateBatchCreateSql, generateCreateSql, generateSnowId } from '../../common/util/sql';
import rpcFileApi from '../rpc/file';
import rpcUserApi from '../rpc/user';
import { Table_Field_Solution } from './../../../common/model/field_solution';
import { Table_Field_Solution_Workflow_Node_Field_Type } from './../../../common/model/field_solution_workflow_node_field_type';
import { Table_Field_Solution_Workflow_Solution } from './../../../common/model/field_solution_workflow_solution';
import { ECommon_Model_Field_Type, fieldTypeModel, Table_Field_Type } from './../../../common/model/field_type';
import { Table_Field_Type_Config_Value } from './../../../common/model/field_type_config_value';
import { Table_Issue_Type } from './../../../common/model/issue_type';
import { Table_Issue_Type_Solution } from './../../../common/model/issue_type_solution';
import { Table_Issue_Type_Solution_Issue_Type } from './../../../common/model/issue_type_solution_issue_type';
import { Table_Permission } from './../../../common/model/permission';
import { Table_Project_Issue_Description } from './../../../common/model/project_issue_description';
import { Table_Project_Issue_Field_Value } from './../../../common/model/project_issue_field_value';
import { Table_Project_Issue_Parent } from './../../../common/model/project_issue_parent';
import { Table_Project_Issue_Process } from './../../../common/model/project_issue_process';
import { Table_Project_Issue_Related } from './../../../common/model/project_issue_related';
import { projectIssueTypeSolutionModel, Table_Project_Issue_Solution } from './../../../common/model/project_issue_type_solution';
import { Table_Project_Label } from './../../../common/model/project_label';
import { Table_Project_Label_Issue } from './../../../common/model/project_label_issue';
import { Table_Project_Member } from './../../../common/model/project_member';
import { Table_Project_Module } from './../../../common/model/project_module';
import { Table_Project_Module_Issue } from './../../../common/model/project_module_issue';
import { Table_Project_Role } from './../../../common/model/project_role';
import { Table_Role_Permission } from './../../../common/model/role_permission';
import { Table_Team } from './../../../common/model/team';
import { Table_Team_Role } from './../../../common/model/team_role';
import { Table_Team_User } from './../../../common/model/team_user';
import { Table_User } from './../../../common/model/user';
import { ICommon_Version_Config, Table_Version } from './../../../common/model/version';
import { Table_Workflow_Action } from './../../../common/model/workflow_action';
import { ECommon_Model_Workflow_Node_Status, Table_Workflow_Node } from './../../../common/model/workflow_node';
import { Table_Workflow_Solution } from './../../../common/model/workflow_solution';
import { Table_Workflow_Solution_Issue_Type_Solution, workflowSolutionIssueTypeSolutionModel } from './../../../common/model/workflow_solution_issue_type_solution';
import { Table_Workflow_Solution_Workflow, workflowSolutionWorkflowModel } from './../../../common/model/workflow_solution_workflow';
import { OBTPConfig } from './obtp';
export interface IServer_GateWay_FormData {
    isFile:boolean,
    name:string,
    fileName:string,
    data:Buffer|string,
    md5:string,
    size:number
}

function bufferSplit(buffer, separator) {
    let result = [];
    let index = 0;
  
    while ((index = buffer.indexOf(separator)) != -1) {
      result.push(buffer.slice(0, index));
      buffer = buffer.slice(index + separator.length);
    }
    result.push(buffer);
  
    return result;
}

export function parseFormData(str: Buffer, boundary: string): IServer_GateWay_FormData[] {
    if (!str) {
        return null;
    }
    let ret: IServer_GateWay_FormData[] = [];
    let result = bufferSplit(str, boundary)
    result.pop()
    result.shift()
    result = result.map(item => item.slice(2, item.length - 2))
    result.forEach(item => {
        let obj=<IServer_GateWay_FormData>{}
        let [info, data] = bufferSplit(item, '\r\n\r\n')
        info = info.toString()
        if (info.indexOf('\r\n') >= 0) {
            let infoResult = info.split('\r\n')[0].split('; ')
            let name = infoResult[1].split('=')[1]
            name = name.substring(1, name.length - 1)
            let filename = infoResult[2].split('=')[1]
            filename = filename.substring(1, filename.length - 1)
            obj.isFile=true;
            obj.data=data;
            obj.fileName=filename
            obj.name=name;
            obj.size=data.length;
            obj.md5=crypto.createHash("md5").update(data).digest("hex")
        } else {
            let name = info.split('; ')[1].split('=')[1]
            name = name.substring(1, name.length - 1)
            const value = data.toString()
            obj.name=name;
            obj.data=value
        }
        ret.push(obj)
    })
    return ret;
}

export async function handleImageFields(data:object){
    let arrImage=<{
        object:object,
        key:string|number
    }[]>[]
    let arrUser=<{
        object:object,
        key:string|number
    }[]>[]
    function _clone(o){
        var k, b;
        if(o && ((b = (o instanceof Array)) || o instanceof Object)) {
            for(k in o){
                if(o.hasOwnProperty(k)){
                    if(["photo","image","icon","img"].includes(k) && typeof(o[k])=="string" && o[k].length>=18 && /^\d+$/.test(o[k])) {
                        arrImage.push({
                            object:o,
                            key:k
                        })
                    } else if(["created_by","modified_by","assigner_id","reporter_id"].includes(k) && typeof(o[k])=="string" && o[k].length>=18 && /^\d+$/.test(o[k])) {
                        arrUser.push({
                            object:o,
                            key:k
                        })
                    } else {
                        _clone(o[k])
                    }
                }
            }
        }
    }
    _clone(data)
    await Promise.all([(async ()=>{
        if(arrImage.length>0) {
            let ids=arrImage.map(item=>{
                return item.object[item.key];
            })
            let paths=await rpcFileApi.getPaths(ids)
            for(let i=0;i<arrImage.length;i++)
            {
                arrImage[i].object[arrImage[i].key]=paths[i]
            }
        }
    })(),(async ()=>{
        if(arrUser.length>0) {
            let ids=arrUser.map(item=>{
                return item.object[item.key];
            })
            let paths=await rpcUserApi.getUsersInfo(ids)
            for(let i=0;i<arrUser.length;i++)
            {
                arrUser[i].object[arrUser[i].key]=paths[i]
            }
        }
    })()])
    
}

async function resetSystem(){
    let mysql=getMysqlInstance()
    await mysql.execute(`delete from ${Table_Version}`) 
    await mysql.execute(`delete from ${Table_Permission}`) 
    await mysql.execute(`delete from ${Table_Project_Role}`) 
    await mysql.execute(`delete from ${Table_Role_Permission}`) 
    await mysql.execute(`delete from ${Table_User}`) 
    await mysql.execute(`delete from ${Table_Project}`) 
    await mysql.execute(`delete from ${Table_Project_Member}`) 
    await mysql.execute(`delete from ${Table_Team_Role}`)
    await mysql.execute(`delete from ${Table_Team}`)  
    await mysql.execute(`delete from ${Table_Team_User}`)
    await mysql.execute(`delete from ${Table_Issue_Type}`)
    await mysql.execute(`delete from ${Table_Issue_Type_Solution}`)
    await mysql.execute(`delete from ${Table_Issue_Type_Solution_Issue_Type}`)
    await mysql.execute(`delete from ${Table_Workflow}`)
    await mysql.execute(`delete from ${Table_Workflow_Node}`)
    await mysql.execute(`delete from ${Table_Workflow_Action}`)
    await mysql.execute(`delete from ${Table_Workflow_Solution}`)
    await mysql.execute(`delete from ${Table_Workflow_Solution_Workflow_Issue_Type}`)
    await mysql.execute(`delete from ${Table_Workflow_Solution_Issue_Type_Solution}`)
    await mysql.execute(`delete from ${Table_Workflow_Solution_Workflow}`)
    await mysql.execute(`delete from ${Table_Project_Module}`)
    await mysql.execute(`delete from ${Table_Project_Label}`)
    await mysql.execute(`delete from ${Table_Field_Solution}`)
    await mysql.execute(`delete from ${Table_Field_Solution_Workflow_Node_Field_Type}`)
    await mysql.execute(`delete from ${Table_Field_Type}`)
    await mysql.execute(`delete from ${Table_Field_Type_Config_Value}`)
    await mysql.execute(`delete from ${Table_Field_Solution_Workflow_Solution}`)
    await mysql.execute(`delete from ${Table_Project_Issue}`)
    await mysql.execute(`delete from ${Table_Project_Issue_Description}`)
    await mysql.execute(`delete from ${Table_Project_Issue_Field_Value}`)
    await mysql.execute(`delete from ${Table_Project_Issue_Parent}`)
    await mysql.execute(`delete from ${Table_Project_Issue_Process}`)
    await mysql.execute(`delete from ${Table_Project_Issue_Related}`)
    await mysql.execute(`delete from ${Table_Project_Issue_Solution}`)
    await mysql.execute(`delete from ${Table_Project_Module_Issue}`)
    await mysql.execute(`delete from ${Table_Project_Label_Issue}`)
}

export async function initSystem() {
    await resetSystem()
    let mysql=getMysqlInstance()
    let ret=await mysql.execute<any[]>(`select * from ${Table_Version}`)
    if(ret===null || ret.length==0){
        let adminId=await initAdmin()
        let userId=await initUser()
        await initVersion()
        let objPermission=await initPermission()
        let {projectRoleUserId,groupRoleUserId}=await initRole(objPermission);
        await initTeam(userId,groupRoleUserId);
        let projectId=await initProject(userId,projectRoleUserId)
        let {issueTypeBugId,issueTypeSolutionId,issueTypeSolutionName,issueTypeTaskId,issueTypeTicketId}=await initIssueType(projectId)
        await initWorkflow(issueTypeSolutionId,issueTypeSolutionName,issueTypeTaskId,issueTypeBugId,issueTypeTicketId)
        await initField()
    }
    console.log("init finish")
}

async function initUser():Promise<string> {
    let mysql=getMysqlInstance()
    let userId=await generateSnowId()
    await mysql.execute(`insert into ${Table_User} (id,username,password) values ('${userId}','sx','sx')`)
    await mysql.execute(`insert into ${Table_User} (id,username,password) values ('${await generateSnowId()}','wgq','wgq')`)
    await mysql.execute(`insert into ${Table_User} (id,username,password) values ('${await generateSnowId()}','hxx','hxx')`)
    return userId
}

async function initAdmin():Promise<string> {
    let mysql=getMysqlInstance()
    let adminId=await generateSnowId()
    await mysql.execute(`insert into ${Table_User} (id,username,password,admin) values ('${adminId}','teamlinker','teamlinker',1)`)
    return adminId
}

async function initTeam(userId:string,groupRoleUserId:string) {
    let mysql=getMysqlInstance()
    let groupId=await generateSnowId()
    await mysql.execute(`insert into ${Table_Team} (id,name,created_by) values ('${groupId}','test_group','${userId}')`)
    await mysql.execute(`insert into ${Table_Team_User} (id,role_id,team_id,user_id) values ('${await generateSnowId()}','${groupRoleUserId}','${groupId}','${userId}')`)
}

async function initProject(userId:string,projectRoleUserId:string):Promise<string> {
    let mysql=getMysqlInstance()
    let projectId=await generateSnowId()
    await mysql.execute(`insert into ${Table_Project} (id,name,keyword,created_by) values ('${projectId}','test','test','${userId}')`)
    await mysql.execute(`insert into ${Table_Project_Member} (id,role_id,project_id,member_id,type) values ('${await generateSnowId()}','${projectRoleUserId}','${projectId}','${userId}',0)`)
    return projectId
}

async function initVersion() {
    let mysql=getMysqlInstance()
    let config:ICommon_Version_Config={
        fileBasePath:"/tmp/teamlinker"
    }
    await mysql.execute(`insert into ${Table_Version} (version,config) values ('${getNacosInstance().version}','${JSON.stringify(config)}')`)
    if(!(await fs.pathExists(config.fileBasePath))) {
        await fs.mkdirp(config.fileBasePath)
    }
}

async function initPermission():Promise<{
    [param:number]:string
}> {
    let mysql=getMysqlInstance()
    let objPermission=<{
        [param:number]:string
    }>{}
    for(let key in Permission_Types) {
        let value=Permission_Types[key]
        let type=key
        let keys=Object.keys(value)
        for(let key of keys) {
            let val=value[key]
            if(val instanceof Permission_Base) {
                let name=val.toString()
                let value=val.value
                let id=await generateSnowId()
                await mysql.execute(`insert into ${Table_Permission} (id,name,type,value) values ('${id}','${name}','${type}','${value}')`)
                objPermission[value]=id
            }
        }
    }
    return objPermission
}

async function initRole(objPermission:{
    [param:number]:string
}):Promise<{
    projectRoleUserId:string,
    groupRoleUserId:string
}> {
    let mysql = getMysqlInstance()
    let objProjectRole = OBTPConfig.Role.Project_Role, projectRoleUserId;
    for (let key in objProjectRole) {
        let obj = objProjectRole[key]
        let projectRoleId = await generateSnowId()
        if (obj.name == "user") {
            projectRoleUserId = projectRoleId
        }
        let name = obj.name
        let description = obj.description
        await mysql.execute(`insert into ${Table_Project_Role} (id,name,description) values ('${projectRoleId}','${name}','${description}')`)
        for (let o of obj.permission) {
            let id = await generateSnowId()
            await mysql.execute(`insert into ${Table_Role_Permission} (id,role_id,permission_id) values ('${id}','${projectRoleId}','${objPermission[o.value]}')`)
        }
    }
    let objGroupRole = OBTPConfig.Role.Team_Role, groupRoleUserId;
    for (let key in objGroupRole) {
        let obj = objGroupRole[key]
        let groupRoleId = await generateSnowId()
        if (obj.name == "user") {
            groupRoleUserId = groupRoleId
        }
        let name = obj.name
        let description = obj.description
        await mysql.execute(`insert into ${Table_Team_Role} (id,name,description) values ('${groupRoleId}','${name}','${description}')`)
        for (let o of obj.permission) {
            let id = await generateSnowId()
            await mysql.execute(`insert into ${Table_Role_Permission} (id,role_id,permission_id) values ('${id}','${groupRoleId}','${objPermission[o.value]}')`)
        }
    }
    return {
        projectRoleUserId,
        groupRoleUserId
    }
}

async function initIssueType(projectId:string) {
    let mysql = getMysqlInstance()
    let taskId=await generateSnowId()
    let bugId=await generateSnowId()
    let ticketId=await generateSnowId()
    let solutionId=await generateSnowId()
    await mysql.execute(`insert into ${Table_Issue_Type} (id,name,reserved) values ('${taskId}','Task',1)`)
    await mysql.execute(`insert into ${Table_Issue_Type} (id,name,reserved) values ('${bugId}','Bug',1)`)
    await mysql.execute(`insert into ${Table_Issue_Type} (id,name,reserved) values ('${ticketId}','Ticket',1)`)
    await mysql.execute(`insert into ${Table_Issue_Type_Solution} (id,name,description,reserved) values ('${solutionId}','Default','Default',1)`)
    await mysql.execute(`insert into ${Table_Issue_Type_Solution_Issue_Type} (id,issue_type_id,issue_type_solution_id) values ('${await generateSnowId()}','${taskId}','${solutionId}')`)
    await mysql.execute(`insert into ${Table_Issue_Type_Solution_Issue_Type} (id,issue_type_id,issue_type_solution_id) values ('${await generateSnowId()}','${bugId}','${solutionId}')`)
    await mysql.execute(`insert into ${Table_Issue_Type_Solution_Issue_Type} (id,issue_type_id,issue_type_solution_id) values ('${await generateSnowId()}','${ticketId}','${solutionId}')`)
    await mysql.execute(generateCreateSql(projectIssueTypeSolutionModel,{
        id:await generateSnowId(),
        project_id:projectId,
        issue_type_solution_id:solutionId
    }))
    return {
        issueTypeTaskId:taskId,
        issueTypeBugId:bugId,
        issueTypeTicketId:ticketId,
        issueTypeSolutionId:solutionId,
        issueTypeSolutionName:"Default"
    }
}

async function initWorkflow(issueTypeSolutionId:string,issueTypeSolutionName:string,issueTypeTaskId:string,issueTypeBugId:string,issueTypeTicketId:string) {
    let mysql = getMysqlInstance()
    let workflowId=await generateSnowId()
    await mysql.execute(generateCreateSql(workflowModel,{
        id:workflowId,
        name:"default",
        description:"",
        reserved:1
    }))
    let workflowNodeOpenId=await generateSnowId()
    let workflowNodeProgressId=await generateSnowId()
    let workflowNodeClosedId=await generateSnowId()
    let workflowNodeResolvedId=await generateSnowId()
    await mysql.execute(generateCreateSql(workflowNodeModel,{
        id:workflowNodeOpenId,
        name:"open",
        reserved:1,
        status:ECommon_Model_Workflow_Node_Status.NOTSTART,
        workflow_id:workflowId
    }))
    await mysql.execute(generateCreateSql(workflowNodeModel,{
        id:workflowNodeProgressId,
        name:"in progress",
        status:ECommon_Model_Workflow_Node_Status.INPROGRESS,
        workflow_id:workflowId
    }))
    await mysql.execute(generateCreateSql(workflowNodeModel,{
        id:workflowNodeClosedId,
        name:"closed",
        status:ECommon_Model_Workflow_Node_Status.DONE,
        workflow_id:workflowId
    }))
    await mysql.execute(generateCreateSql(workflowNodeModel,{
        id:workflowNodeResolvedId,
        name:"resolved",
        status:ECommon_Model_Workflow_Node_Status.DONE,
        workflow_id:workflowId
    }))
    let actionOpenToProgressId=await generateSnowId()
    let actionProgressToOpenId=await generateSnowId()
    let actionOpenToClosedId=await generateSnowId()
    let actionClosedToOpenId=await generateSnowId()
    let actionProgressToResolvedId=await generateSnowId()
    let actionResolvedToProgressId=await generateSnowId()
    await mysql.execute(generateCreateSql(workflowActionModel,{
        id:actionOpenToProgressId,
        name:"open to progress",
        reserved:1,
        workflow_id:workflowId,
        source_node_id:workflowNodeOpenId,
        dest_node_id:workflowNodeProgressId
    }))
    await mysql.execute(generateCreateSql(workflowActionModel,{
        id:actionProgressToOpenId,
        name:"progress to open",
        reserved:1,
        workflow_id:workflowId,
        source_node_id:workflowNodeProgressId,
        dest_node_id:workflowNodeOpenId
    }))
    await mysql.execute(generateCreateSql(workflowActionModel,{
        id:actionOpenToClosedId,
        name:"open to close",
        reserved:1,
        workflow_id:workflowId,
        source_node_id:workflowNodeOpenId,
        dest_node_id:workflowNodeClosedId
    }))
    await mysql.execute(generateCreateSql(workflowActionModel,{
        id:actionClosedToOpenId,
        name:"closed to open",
        reserved:1,
        workflow_id:workflowId,
        source_node_id:workflowNodeClosedId,
        dest_node_id:workflowNodeOpenId
    }))
    await mysql.execute(generateCreateSql(workflowActionModel,{
        id:actionProgressToResolvedId,
        name:"progress to resolved",
        reserved:1,
        workflow_id:workflowId,
        source_node_id:workflowNodeProgressId,
        dest_node_id:workflowNodeResolvedId
    }))
    await mysql.execute(generateCreateSql(workflowActionModel,{
        id:actionResolvedToProgressId,
        name:"resolved to progress",
        reserved:1,
        workflow_id:workflowId,
        source_node_id:workflowNodeResolvedId,
        dest_node_id:workflowNodeProgressId
    }))
    let workflowSolutionId=await generateSnowId()
    await mysql.execute(generateCreateSql(workflowSolutionModel,{
        id:workflowSolutionId,
        reserved:1,
        name:issueTypeSolutionName,
    }))
    await mysql.execute(generateCreateSql(workflowSolutionWorkflowModel,{
        id:await generateSnowId(),
        workflow_solution_id:workflowSolutionId,
        workflow_id:workflowId
    }))
    await mysql.execute(generateCreateSql(workflowSolutionIssueTypeSolutionModel,{
        id:await generateSnowId(),
        workflow_solution_id:workflowSolutionId,
        issue_type_solution_id:issueTypeSolutionId
    }))
    await mysql.execute(generateCreateSql(workflowSolutionWorkflowIssueTypeModel,{
        id:await generateSnowId(),
        workflow_solution_id:workflowSolutionId,
        workflow_id:workflowId,
        issue_type_id:issueTypeTaskId,
        issue_type_solution_id:issueTypeSolutionId
    }))
    await mysql.execute(generateCreateSql(workflowSolutionWorkflowIssueTypeModel,{
        id:await generateSnowId(),
        workflow_solution_id:workflowSolutionId,
        workflow_id:workflowId,
        issue_type_id:issueTypeBugId,
        issue_type_solution_id:issueTypeSolutionId
    }))
    await mysql.execute(generateCreateSql(workflowSolutionWorkflowIssueTypeModel,{
        id:await generateSnowId(),
        workflow_solution_id:workflowSolutionId,
        workflow_id:workflowId,
        issue_type_id:issueTypeTicketId,
        issue_type_solution_id:issueTypeSolutionId
    }))
}

async function initField() {
    let mysql = getMysqlInstance()
    let fieldTypeLabelId=await generateSnowId()
    let fieldTypeMultiLabelId=await generateSnowId()
    let fieldTypeTextId=await generateSnowId()
    let fieldTypeMultiTextId=await generateSnowId()
    let fieldTypeSelectId=await generateSnowId()
    let fieldTypeMultiSelectId=await generateSnowId()
    let fieldTypeSwitchId=await generateSnowId()
    let fieldTypeTimeId=await generateSnowId()
    let fieldTypeDateId=await generateSnowId()
    let fieldTypeDateTimeId=await generateSnowId()
    await mysql.execute(generateBatchCreateSql(fieldTypeModel,[{
        id:fieldTypeLabelId,
        name:"label",
        type:ECommon_Model_Field_Type.LABEL
    },{
        id:fieldTypeMultiLabelId,
        name:"multi label",
        multi:1,
        type:ECommon_Model_Field_Type.MULTILABEL
    },{
        id:fieldTypeTextId,
        name:"text",
        type:ECommon_Model_Field_Type.TEXT
    },{
        id:fieldTypeMultiTextId,
        name:"multi text",
        type:ECommon_Model_Field_Type.MULTITEXT
    },{
        id:fieldTypeSelectId,
        name:"select",
        type:ECommon_Model_Field_Type.SELECT
    },{
        id:fieldTypeMultiSelectId,
        name:"multi select",
        multi:1,
        type:ECommon_Model_Field_Type.MULTISELECT
    },{
        id:fieldTypeSwitchId,
        name:"switch",
        type:ECommon_Model_Field_Type.SWITCH
    },{
        id:fieldTypeTimeId,
        name:"timepicker",
        type:ECommon_Model_Field_Type.TIME
    },{
        id:fieldTypeDateId,
        name:"datepicker",
        type:ECommon_Model_Field_Type.DATE
    },{
        id:fieldTypeDateTimeId,
        name:"datetimepicker",
        type:ECommon_Model_Field_Type.DATETIME
    }]))
}