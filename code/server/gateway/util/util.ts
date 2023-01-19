import * as fs from "fs-extra";
import * as Importer from "mysql2-import";
import * as path from "path";
import {Table_Project} from '../../../common/model/project';
import {Table_Project_Issue} from "../../../common/model/project_issue";
import Application, {ECommon_Application_Mode} from '../../common/app/app';
import {getConfigInstance} from '../../common/config/config';
import {getMysqlInstance} from "../../common/db/mysql";
import CommonUtil from "../../common/util/common";
import {generateQuerySql, generateUpdateSql} from '../../common/util/sql';
import rpcAuthApi from '../../auth/rpc/auth';
import rpcCooperationApi from "../../cooperation/rpc/cooperation";
import rpcFileApi from '../../file/rpc/file';
import rpcUserApi from '../../user/rpc/user';
import {Table_Workflow_Node_Field_Type} from '../../../common/model/workflow_node_field_type';
import {Table_Workflow_Node_Field_Type_Config} from '../../../common/model/workflow_node_field_type_config';
import {Table_Issue_Type} from './../../../common/model/issue_type';
import {Table_Issue_Type_Solution} from './../../../common/model/issue_type_solution';
import {Table_Organization} from './../../../common/model/organization';
import {Table_Organization_User} from './../../../common/model/organization_user';
import {Table_Project_Issue_Description} from './../../../common/model/project_issue_description';
import {Table_Project_Issue_Field_Value} from './../../../common/model/project_issue_field_value';
import {Table_Project_Issue_Parent} from './../../../common/model/project_issue_parent';
import {Table_Project_Issue_Process} from './../../../common/model/project_issue_process';
import {Table_Project_Issue_Related} from './../../../common/model/project_issue_related';
import {Table_Project_Issue_Type_Solution} from './../../../common/model/project_issue_type_solution';
import {Table_Project_Label} from './../../../common/model/project_label';
import {Table_Project_Label_Issue} from './../../../common/model/project_label_issue';
import {Table_Project_Module} from './../../../common/model/project_module';
import {Table_Project_Module_Issue} from './../../../common/model/project_module_issue';
import {Table_Role} from './../../../common/model/role';
import {Table_Role_Member} from './../../../common/model/role_member';
import {Table_Team} from './../../../common/model/team';
import {Table_Team_User} from './../../../common/model/team_user';
import {Table_User} from './../../../common/model/user';
import {Table_Version, versionModel} from './../../../common/model/version';
import {Table_Workflow_Action} from './../../../common/model/workflow_action';
import {Table_Workflow_Node} from './../../../common/model/workflow_node';
import {Table_Comment} from "../../../common/model/comment";
import {Table_File} from "../../../common/model/file";
import {Table_Member_Tag} from "../../../common/model/member_tag";

export async function handleImageFields(data:object,organizationId?:string){
    let arrImage=<{
        object:object,
        key:string|number
    }[]>[]
    let arrOrganizationUser=<{
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
                        arrOrganizationUser.push({
                            object:o,
                            key:k
                        })
                    } else if(["created_by_pure"].includes(k) && typeof(o[k])=="string" && o[k].length>=18 && /^\d+$/.test(o[k])) {
                        arrUser.push({
                            object:o,
                            key:k
                        })
                    }else {
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
        if(arrOrganizationUser.length>0) {
            let ids=arrOrganizationUser.map(item=>{
                return item.object[item.key];
            })
            let paths=await rpcUserApi.getOrganizationUsersInfo(ids)
            for(let i=0;i<arrOrganizationUser.length;i++)
            {
                arrOrganizationUser[i].object[arrOrganizationUser[i].key]=paths[i]
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
        await Promise.all([
             mysql.execute(`delete from ${Table_Version}`),
             mysql.execute(`delete from ${Table_Role}`),
             mysql.execute(`delete from ${Table_Role_Member}`),
             mysql.execute(`delete from ${Table_User}`),
             mysql.execute(`delete from ${Table_Project}`),
             mysql.execute(`delete from ${Table_Team}`),
             mysql.execute(`delete from ${Table_Team_User}`),
             mysql.execute(`delete from ${Table_Issue_Type}`),
             mysql.execute(`delete from ${Table_Issue_Type_Solution}`),
             mysql.execute(`delete from ${Table_Workflow_Node}`),
             mysql.execute(`delete from ${Table_Workflow_Action}`),
             mysql.execute(`delete from ${Table_Project_Module}`),
             mysql.execute(`delete from ${Table_Project_Label}`),
             mysql.execute(`delete from ${Table_Workflow_Node_Field_Type}`),
             mysql.execute(`delete from ${Table_Workflow_Node_Field_Type_Config}`),
             mysql.execute(`delete from ${Table_Project_Issue}`),
             mysql.execute(`delete from ${Table_Project_Issue_Description}`),
             mysql.execute(`delete from ${Table_Project_Issue_Field_Value}`),
             mysql.execute(`delete from ${Table_Project_Issue_Parent}`),
             mysql.execute(`delete from ${Table_Project_Issue_Process}`),
             mysql.execute(`delete from ${Table_Project_Issue_Related}`),
             mysql.execute(`delete from ${Table_Project_Issue_Type_Solution}`),
             mysql.execute(`delete from ${Table_Project_Module_Issue}`),
             mysql.execute(`delete from ${Table_Project_Label_Issue}`),
             mysql.execute(`delete from ${Table_Organization}`),
             mysql.execute(`delete from ${Table_Organization_User}`),
             mysql.execute(`delete from ${Table_Comment}`),
             mysql.execute(`delete from ${Table_File}`),
             mysql.execute(`delete from ${Table_Workflow_Node_Field_Type}`),
             mysql.execute(`delete from ${Table_Workflow_Node_Field_Type_Config}`),
             mysql.execute(`delete from ${Table_Member_Tag}`)
        ])

    } catch (err) {
        console.log("db reset error:",err);
    }
    
}

export async function checkIfNeedInit() {
    if(Application.mode!=ECommon_Application_Mode.ONLINE) {
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
    if(Application.mode==ECommon_Application_Mode.ONLINE) {
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
        let [adminIds,userIds,_,__]=await Promise.all([
            rpcUserApi.initAdmin(),
            rpcUserApi.initUser(),
            initVersion(),
            rpcAuthApi.initRole()
        ])
        let organizationId=await rpcUserApi.initOrganization(adminIds,userIds);
        let organizationUserId=await rpcUserApi.getOrganizationUserId(organizationId,userIds[0])
        await Promise.all([
            rpcUserApi.initTeam(organizationUserId,organizationId),
            rpcCooperationApi.initProject(organizationUserId,organizationId)
        ])
    }
    console.log("init finish")
}

async function initVersion() {
    let mysql=getMysqlInstance()
    await mysql.execute(`insert into ${Table_Version} (version) values ('${getConfigInstance().version}')`)
}

