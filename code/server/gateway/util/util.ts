import * as fs from "fs-extra";
import * as Importer from "mysql2-import";
import * as path from "path";
import { Table_Project } from '../../../common/model/project';
import { Table_Project_Issue } from "../../../common/model/project_issue";
import { Table_Workflow, workflowModel } from "../../../common/model/workflow";
import { workflowActionModel } from "../../../common/model/workflow_action";
import { workflowNodeModel } from "../../../common/model/workflow_node";
import { workflowSolutionModel } from "../../../common/model/workflow_solution";
import { Table_Workflow_Solution_Workflow_Issue_Type, workflowSolutionWorkflowIssueTypeModel } from "../../../common/model/workflow_solution_workflow_issue_type";
import { Permission_Base, Permission_Types } from '../../../common/permission/permission';
import Application, { ECommon_Application_Mode } from '../../common/app/app';
import { getRedisInstance } from "../../common/cache/redis";
import { getConfigInstance } from '../../common/config/config';
import { getMysqlInstance } from "../../common/db/mysql";
import CommonUtil from "../../common/util/common";
import { generateBatchCreateSql, generateCreateSql, generateQuerySql, generateSnowId, generateUpdateSql } from '../../common/util/sql';
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
import { organizationModel, Table_Organization } from './../../../common/model/organization';
import { ECommon_Organization_User_Role, organizationUserModel, Table_Organization_User } from './../../../common/model/organization_user';
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
import { Table_Version, versionModel } from './../../../common/model/version';
import { Table_Workflow_Action } from './../../../common/model/workflow_action';
import { ECommon_Model_Workflow_Node_Status, Table_Workflow_Node } from './../../../common/model/workflow_node';
import { Table_Workflow_Solution } from './../../../common/model/workflow_solution';
import { Table_Workflow_Solution_Issue_Type_Solution, workflowSolutionIssueTypeSolutionModel } from './../../../common/model/workflow_solution_issue_type_solution';
import { Table_Workflow_Solution_Workflow, workflowSolutionWorkflowModel } from './../../../common/model/workflow_solution_workflow';
import { OBTPConfig } from './obtp';



export async function handleImageFields(data:object,organizationId:string){
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
            let paths=await rpcUserApi.getUsersInfo(ids,organizationId)
            for(let i=0;i<arrUser.length;i++)
            {
                arrUser[i].object[arrUser[i].key]=paths[i]
            }
        }
    })()])
    
}

async function resetSystem(){
    try {
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
        await mysql.execute(`delete from ${Table_Organization}`)
        await mysql.execute(`delete from ${Table_Organization_User}`)
    } catch (err) {
        console.log("db reset error:",err);
    }
    
}

async function flushRedis() {
    let redis=getRedisInstance()
    await redis.flush()
}

export async function checkIfNeedInit() {
    if(Application.mode!=ECommon_Application_Mode.MICRO) {
        let mysql=getMysqlInstance()
        let config=getConfigInstance()
        let bExist=false;
        try {
            let ret=await mysql.executeOne(`select * from version;`)
            if(ret) {
                bExist=true;
            }
        } catch(err) {
            bExist=false
        }
        if(!bExist) {
            let sqlPath=Application.debug?path.join(__dirname,"../../init.sql"):path.join(__dirname,"../../../../../init.sql")
            let importer = new Importer({
                host:config.mysqlInfo.url,
                user:config.mysqlInfo.username,
                password:config.mysqlInfo.password,
                database:config.mysqlInfo.database,
                port:config.mysqlInfo.port
            })
            console.log("exec sql start")
            await importer.import(sqlPath)
            console.log("exec sql end")
            await initSystem()
        } else {
            await checkIfNeedPatch()
            if(Application.needReset) {
                await flushRedis()
                await resetSystem()
            }
        }
    } else {
        await initSystem()
    }

}

async function checkIfNeedPatch() {
    if(Application.mode==ECommon_Application_Mode.MICRO) {
        return;
    }
    let curVersion = getConfigInstance().version;
    var stat = fs.pathExistsSync(Application.debug?path.join(__dirname, "../../patch/dist"):path.join(__dirname, "../../../../../patch/dist"));
    if (!stat) {
        return;
    }
    let files = fs.readdirSync(Application.debug?path.join(__dirname, "../../patch/dist"):path.join(__dirname, "../../../../../patch/dist"));
    files = files.filter(function (obj) {
        if (obj != "." && obj != ".." && obj.endsWith(".js")) {
            return true;
        }
        else {
            return false;
        }
    }).sort(function (obj1, obj2) {
        let ret= CommonUtil.versionDiff(obj1, obj2);
        if(ret) {
            return 1
        } else {
            return -1
        }
    })
    if(files.length==0) {
        return;
    }
    let version = "0.0.0";
    let mysql=getMysqlInstance()
    let ret=await mysql.executeOne(generateQuerySql(versionModel,[]))
    version=ret.version
    let index = -1;
    for (let i = 0; i < files.length; i++) {
        let bMax = CommonUtil.versionDiff(files[i], version);
        if (bMax) {
            index = i;
            break;
        }
    }
    if (index > -1) {
        console.log("patch start");
        for (let i = index; i < files.length; i++) {
            await (require(path.join(Application.debug?path.join(__dirname, "../../patch/dist"):path.join(__dirname, "../../../../../patch/dist") , files[i]))());
        }
        console.log("patch end");
    }
    mysql.execute(generateUpdateSql(versionModel,{
        version:curVersion
    }))
}

export async function initSystem() {
    if(Application.needReset) {
        await flushRedis()
        await resetSystem()
    }
    let mysql=getMysqlInstance()
    let ret=await mysql.execute<any[]>(`select * from ${Table_Version}`)
    if(ret===null || ret.length==0){
        let adminIds=await initAdmin()
        let userIds=await initUser()
        let organizationId=await initOrganization(adminIds,userIds);
        await initVersion()
        let objPermission=await initPermission()
        let {projectRoleUserId,groupRoleUserId}=await initRole(objPermission);
        await initTeam(userIds[0],groupRoleUserId,organizationId);
        let projectId=await initProject(userIds[0],projectRoleUserId,organizationId)
        let {issueTypeBugId,issueTypeSolutionId,issueTypeSolutionName,issueTypeTaskId,issueTypeTicketId}=await initIssueType(projectId,organizationId)
        await initWorkflow(issueTypeSolutionId,issueTypeSolutionName,issueTypeTaskId,issueTypeBugId,issueTypeTicketId,organizationId)
        await initField()
    }
    console.log("init finish")
}

async function initOrganization(adminIds:string[],userIds:string[]):Promise<string> {
    let mysql=getMysqlInstance()
    let id=await generateSnowId()
    await mysql.executeOne(generateCreateSql(organizationModel,{
        id,
        name:"default",
        user_id:adminIds[0]
    }))
    let i=0;
    for(let adminId of adminIds) {
        await mysql.execute(generateCreateSql(organizationUserModel,{
            id:await generateSnowId(),
            nickname:"test"+(i++),
            organization_id:id,
            role:ECommon_Organization_User_Role.ADMIN,
            user_id:adminId
        }))
    }
    for(let userId of userIds) {
        await mysql.execute(generateCreateSql(organizationUserModel,{
            id:await generateSnowId(),
            nickname:"test"+(i++),
            organization_id:id,
            role:ECommon_Organization_User_Role.USER,
            user_id:userId
        }))
    }
    return id;
}

async function initUser():Promise<string[]> {
    let mysql=getMysqlInstance()
    let userIds=[await generateSnowId(),await generateSnowId(),await generateSnowId()]
    await mysql.execute(`insert into ${Table_User} (id,username,password) values ('${userIds[0]}','sx','sx')`)
    await mysql.execute(`insert into ${Table_User} (id,username,password) values ('${userIds[1]}','wgq','wgq')`)
    await mysql.execute(`insert into ${Table_User} (id,username,password) values ('${userIds[2]}','hxx','hxx')`)
    return userIds
}

async function initAdmin():Promise<string[]> {
    let mysql=getMysqlInstance()
    let adminIds=[await generateSnowId(),await generateSnowId(),await generateSnowId()]
    await mysql.execute(`insert into ${Table_User} (id,username,password,role) values ('${adminIds[0]}','teamlinker','teamlinker',1)`)
    await mysql.execute(`insert into ${Table_User} (id,username,password,role) values ('${adminIds[1]}','wgq_admin','123456',1)`)
    await mysql.execute(`insert into ${Table_User} (id,username,password,role) values ('${adminIds[2]}','hxx_admin','123456',1)`)
    return adminIds
}

async function initTeam(userId:string,groupRoleUserId:string,organizationId:string) {
    let mysql=getMysqlInstance()
    let groupId=await generateSnowId()
    await mysql.execute(`insert into ${Table_Team} (id,name,created_by,organization_id) values ('${groupId}','test_group','${userId}','${organizationId}')`)
    await mysql.execute(`insert into ${Table_Team_User} (id,role_id,team_id,user_id) values ('${await generateSnowId()}','${groupRoleUserId}','${groupId}','${userId}')`)
}

async function initProject(userId:string,projectRoleUserId:string,organizationId:string):Promise<string> {
    let mysql=getMysqlInstance()
    let projectId=await generateSnowId()
    await mysql.execute(`insert into ${Table_Project} (id,name,keyword,created_by,organization_id) values ('${projectId}','test','test','${userId}','${organizationId}')`)
    await mysql.execute(`insert into ${Table_Project_Member} (id,role_id,project_id,member_id,type) values ('${await generateSnowId()}','${projectRoleUserId}','${projectId}','${userId}',0)`)
    return projectId
}

async function initVersion() {
    let mysql=getMysqlInstance()
    await mysql.execute(`insert into ${Table_Version} (version) values ('${getConfigInstance().version}')`)
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

async function initIssueType(projectId:string,organizationId:string) {
    let mysql = getMysqlInstance()
    let taskId=await generateSnowId()
    let bugId=await generateSnowId()
    let ticketId=await generateSnowId()
    let solutionId=await generateSnowId()
    await mysql.execute(`insert into ${Table_Issue_Type} (id,name,reserved,organization_id) values ('${taskId}','Task',1,'${organizationId}')`)
    await mysql.execute(`insert into ${Table_Issue_Type} (id,name,reserved,organization_id) values ('${bugId}','Bug',1,'${organizationId}')`)
    await mysql.execute(`insert into ${Table_Issue_Type} (id,name,reserved,organization_id) values ('${ticketId}','Ticket',1,'${organizationId}')`)
    await mysql.execute(`insert into ${Table_Issue_Type_Solution} (id,name,description,reserved,organization_id) values ('${solutionId}','Default','Default',1,'${organizationId}')`)
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

async function initWorkflow(issueTypeSolutionId:string,issueTypeSolutionName:string,issueTypeTaskId:string,issueTypeBugId:string,issueTypeTicketId:string,organizationId:string) {
    let mysql = getMysqlInstance()
    let workflowId=await generateSnowId()
    await mysql.execute(generateCreateSql(workflowModel,{
        id:workflowId,
        name:"default",
        description:"",
        reserved:1,
        organization_id:organizationId
    }))
    let workflowNodeOpenId=await generateSnowId()
    let workflowNodeProgressId=await generateSnowId()
    let workflowNodeClosedId=await generateSnowId()
    let workflowNodeResolvedId=await generateSnowId()
    await mysql.execute(generateCreateSql(workflowNodeModel,{
        id:workflowNodeOpenId,
        name:"open",
        status:ECommon_Model_Workflow_Node_Status.NOTSTART,
        workflow_id:workflowId,
        x:50,
        y:45
    }))
    await mysql.execute(generateCreateSql(workflowNodeModel,{
        id:workflowNodeProgressId,
        name:"in progress",
        status:ECommon_Model_Workflow_Node_Status.INPROGRESS,
        workflow_id:workflowId,
        x:281,
        y:177
    }))
    await mysql.execute(generateCreateSql(workflowNodeModel,{
        id:workflowNodeClosedId,
        name:"closed",
        status:ECommon_Model_Workflow_Node_Status.DONE,
        workflow_id:workflowId,
        x:59,
        y:502
    }))
    await mysql.execute(generateCreateSql(workflowNodeModel,{
        id:workflowNodeResolvedId,
        name:"resolved",
        status:ECommon_Model_Workflow_Node_Status.DONE,
        workflow_id:workflowId,
        x:507,
        y:503
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
        workflow_id:workflowId,
        source_node_id:workflowNodeOpenId,
        dest_node_id:workflowNodeProgressId
    }))
    await mysql.execute(generateCreateSql(workflowActionModel,{
        id:actionProgressToOpenId,
        name:"progress to open",
        workflow_id:workflowId,
        source_node_id:workflowNodeProgressId,
        dest_node_id:workflowNodeOpenId
    }))
    await mysql.execute(generateCreateSql(workflowActionModel,{
        id:actionOpenToClosedId,
        name:"open to close",
        workflow_id:workflowId,
        source_node_id:workflowNodeOpenId,
        dest_node_id:workflowNodeClosedId
    }))
    await mysql.execute(generateCreateSql(workflowActionModel,{
        id:actionClosedToOpenId,
        name:"closed to open",
        workflow_id:workflowId,
        source_node_id:workflowNodeClosedId,
        dest_node_id:workflowNodeOpenId
    }))
    await mysql.execute(generateCreateSql(workflowActionModel,{
        id:actionProgressToResolvedId,
        name:"progress to resolved",
        workflow_id:workflowId,
        source_node_id:workflowNodeProgressId,
        dest_node_id:workflowNodeResolvedId
    }))
    await mysql.execute(generateCreateSql(workflowActionModel,{
        id:actionResolvedToProgressId,
        name:"resolved to progress",
        workflow_id:workflowId,
        source_node_id:workflowNodeResolvedId,
        dest_node_id:workflowNodeProgressId
    }))
    let workflowSolutionId=await generateSnowId()
    await mysql.execute(generateCreateSql(workflowSolutionModel,{
        id:workflowSolutionId,
        reserved:1,
        name:issueTypeSolutionName,
        organization_id:organizationId
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