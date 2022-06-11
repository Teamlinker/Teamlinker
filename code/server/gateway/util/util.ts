import * as fs from "fs-extra";
import * as Importer from "mysql2-import";
import * as path from "path";
import { Table_Project } from '../../../common/model/project';
import { Table_Project_Issue } from "../../../common/model/project_issue";
import { Table_Workflow } from "../../../common/model/workflow";
import { Table_Workflow_Solution_Workflow_Issue_Type } from "../../../common/model/workflow_solution_workflow_issue_type";
import Application, { ECommon_Application_Mode } from '../../common/app/app';
import { getConfigInstance } from '../../common/config/config';
import { getMysqlInstance } from "../../common/db/mysql";
import CommonUtil from "../../common/util/common";
import { generateQuerySql, generateUpdateSql } from '../../common/util/sql';
import rpcAuthApi from '../rpc/auth';
import rpcCooperationApi from "../rpc/cooperation";
import rpcFileApi from '../rpc/file';
import rpcUserApi from '../rpc/user';
import { Table_Field_Solution } from './../../../common/model/field_solution';
import { Table_Field_Solution_Workflow_Node_Field_Type } from './../../../common/model/field_solution_workflow_node_field_type';
import { Table_Field_Solution_Workflow_Solution } from './../../../common/model/field_solution_workflow_solution';
import { Table_Field_Type } from './../../../common/model/field_type';
import { Table_Field_Type_Config_Value } from './../../../common/model/field_type_config_value';
import { Table_Issue_Type } from './../../../common/model/issue_type';
import { Table_Issue_Type_Solution } from './../../../common/model/issue_type_solution';
import { Table_Issue_Type_Solution_Issue_Type } from './../../../common/model/issue_type_solution_issue_type';
import { Table_Organization } from './../../../common/model/organization';
import { Table_Organization_User } from './../../../common/model/organization_user';
import { Table_Permission } from './../../../common/model/permission';
import { Table_Project_Issue_Description } from './../../../common/model/project_issue_description';
import { Table_Project_Issue_Field_Value } from './../../../common/model/project_issue_field_value';
import { Table_Project_Issue_Parent } from './../../../common/model/project_issue_parent';
import { Table_Project_Issue_Process } from './../../../common/model/project_issue_process';
import { Table_Project_Issue_Related } from './../../../common/model/project_issue_related';
import { Table_Project_Issue_Solution } from './../../../common/model/project_issue_type_solution';
import { Table_Project_Label } from './../../../common/model/project_label';
import { Table_Project_Label_Issue } from './../../../common/model/project_label_issue';
import { Table_Project_Member } from './../../../common/model/project_member';
import { Table_Project_Module } from './../../../common/model/project_module';
import { Table_Project_Module_Issue } from './../../../common/model/project_module_issue';
import { Table_Role } from './../../../common/model/role';
import { Table_Role_Member } from './../../../common/model/role_member';
import { Table_Role_Permission } from './../../../common/model/role_permission';
import { Table_Team } from './../../../common/model/team';
import { Table_Team_User } from './../../../common/model/team_user';
import { Table_User } from './../../../common/model/user';
import { Table_Version, versionModel } from './../../../common/model/version';
import { Table_Workflow_Action } from './../../../common/model/workflow_action';
import { Table_Workflow_Node } from './../../../common/model/workflow_node';
import { Table_Workflow_Solution } from './../../../common/model/workflow_solution';
import { Table_Workflow_Solution_Issue_Type_Solution } from './../../../common/model/workflow_solution_issue_type_solution';
import { Table_Workflow_Solution_Workflow } from './../../../common/model/workflow_solution_workflow';

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
        await mysql.execute(`delete from ${Table_Role}`) 
        await mysql.execute(`delete from ${Table_Role_Permission}`) 
        await mysql.execute(`delete from ${Table_Role_Member}`) 
        await mysql.execute(`delete from ${Table_User}`) 
        await mysql.execute(`delete from ${Table_Project}`) 
        await mysql.execute(`delete from ${Table_Project_Member}`) 
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
        await resetSystem()
    }
    let mysql=getMysqlInstance()
    let ret=await mysql.execute<any[]>(`select * from ${Table_Version}`)
    if(ret===null || ret.length==0){
        let adminIds=await rpcUserApi.initAdmin();
        let userIds=await rpcUserApi.initUser()
        let organizationId=await rpcUserApi.initOrganization(adminIds,userIds);
        await initVersion()
        let objPermission=await rpcAuthApi.initPermission();
        let {projectRoleUserId,groupRoleUserId}=await rpcAuthApi.initRole(objPermission);
        await rpcUserApi.initTeam(userIds[0],groupRoleUserId,organizationId);
        let projectId=await rpcCooperationApi.initProject(userIds[0],projectRoleUserId,organizationId)
        await rpcCooperationApi.initIssueTypeWorkflowAndSolution(organizationId,projectId)
        await rpcCooperationApi.initField()
    }
    console.log("init finish")
}

async function initVersion() {
    let mysql=getMysqlInstance()
    await mysql.execute(`insert into ${Table_Version} (version) values ('${getConfigInstance().version}')`)
}

