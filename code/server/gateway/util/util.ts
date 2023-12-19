import * as Importer from "@pivvenit/mysql-import";
import * as path from "path";
import {Table_Project} from '../../../common/model/project';
import {Table_Project_Issue} from "../../../common/model/project_issue";
import Application from '../../common/app/app';
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
import {Table_Content} from "../../../common/model/content";
import {Table_File} from "../../../common/model/file";
import {Table_Member_Tag} from "../../../common/model/member_tag";
import {Table_Meeting_Room} from "../../../common/model/meeting_room";
import {Table_Notification} from "../../../common/model/notification";
import {Table_Wiki} from "../../../common/model/wiki";
import {Table_Wiki_Item} from "../../../common/model/wiki_item";
import {Table_Calendar} from "../../../common/model/calendar";
import {Table_Calendar_Event} from "../../../common/model/calendar_event";
import {Table_Calendar_Setting} from "../../../common/model/calendar_setting";
import {Table_Calendar_Event_Guest} from "../../../common/model/calendar_event_guest";
import {Table_Board} from "../../../common/model/board";
import {Table_Board_Sprint} from "../../../common/model/board_sprint";
import {Table_Board_Column} from "../../../common/model/board_column";
import {Table_Board_Sprint_Issue} from "../../../common/model/board_sprint_issue";
import {Table_Board_Issue_type} from "../../../common/model/board_issue_type";
import {Table_Board_Column_Workflow_Node} from "../../../common/model/board_column_workflow_node";
import {Table_Board_Sprint_SwimLane} from "../../../common/model/board_sprint_swimlane";
import {Table_Finder_Item} from "../../../common/model/finder_item";
import {Table_IM_Favorite_Message} from "../../../common/model/im_favorite_message";
import {Table_IM_Team_Message} from "../../../common/model/im_team_message";
import {Table_IM_UnRead_Message} from "../../../common/model/im_unread_message";
import {Table_IM_User_Message} from "../../../common/model/im_user_message";
import {Table_Meeting_Miss_Call} from "../../../common/model/meeting_miss_call";
import {Table_User_Setting} from "../../../common/model/user_setting";
import {Table_Project_Issue_Approval} from "../../../common/model/project_issue_approval";
import {Table_Project_Issue_History} from "../../../common/model/project_issue_history";
import {Table_Workflow_Approval} from "../../../common/model/workflow_approval";
import {Table_Sticky_Note} from "../../../common/model/sticky_note";
import {Table_Photo} from "../../../common/model/photo";
import {patchList} from "../../patch/patch";


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
             mysql.execute(`delete from ${Table_Project_Issue_Field_Value}`),
             mysql.execute(`delete from ${Table_Project_Issue_Parent}`),
             mysql.execute(`delete from ${Table_Project_Issue_Process}`),
             mysql.execute(`delete from ${Table_Project_Issue_Related}`),
             mysql.execute(`delete from ${Table_Project_Issue_Type_Solution}`),
             mysql.execute(`delete from ${Table_Project_Module_Issue}`),
             mysql.execute(`delete from ${Table_Project_Label_Issue}`),
             mysql.execute(`delete from ${Table_Organization}`),
             mysql.execute(`delete from ${Table_Organization_User}`),
             mysql.execute(`delete from ${Table_Content}`),
             mysql.execute(`delete from ${Table_File}`),
             mysql.execute(`delete from ${Table_Workflow_Node_Field_Type}`),
             mysql.execute(`delete from ${Table_Workflow_Node_Field_Type_Config}`),
             mysql.execute(`delete from ${Table_Member_Tag}`),
             mysql.execute(`delete from ${Table_Meeting_Room}`),
            mysql.execute(`delete from ${Table_Notification}`),
            mysql.execute(`delete from ${Table_Wiki}`),
            mysql.execute(`delete from ${Table_Wiki_Item}`),
            mysql.execute(`delete from ${Table_Calendar}`),
            mysql.execute(`delete from ${Table_Calendar_Event}`),
            mysql.execute(`delete from ${Table_Calendar_Setting}`),
            mysql.execute(`delete from ${Table_Calendar_Event_Guest}`),
            mysql.execute(`delete from ${Table_Board}`),
            mysql.execute(`delete from ${Table_Board_Sprint}`),
            mysql.execute(`delete from ${Table_Board_Column}`),
            mysql.execute(`delete from ${Table_Board_Sprint_Issue}`),
            mysql.execute(`delete from ${Table_Board_Issue_type}`),
            mysql.execute(`delete from ${Table_Board_Column_Workflow_Node}`),
            mysql.execute(`delete from ${Table_Board_Sprint_SwimLane}`),
            mysql.execute(`delete from ${Table_Finder_Item}`),
            mysql.execute(`delete from ${Table_IM_Favorite_Message}`),
            mysql.execute(`delete from ${Table_IM_Team_Message}`),
            mysql.execute(`delete from ${Table_IM_UnRead_Message}`),
            mysql.execute(`delete from ${Table_IM_User_Message}`),
            mysql.execute(`delete from ${Table_Meeting_Miss_Call}`),
            mysql.execute(`delete from ${Table_User_Setting}`),
            mysql.execute(`delete from ${Table_Project_Issue_Approval}`),
            mysql.execute(`delete from ${Table_Project_Issue_History}`),
            mysql.execute(`delete from ${Table_Workflow_Approval}`),
            mysql.execute(`delete from ${Table_Sticky_Note}`),
            mysql.execute(`delete from ${Table_Photo}`)
        ])

    } catch (err) {
        console.log("db reset error:",err);
    }
    
}

export async function checkIfNeedInit() {
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
        let sqlPath=path.join(__dirname,"../../init.sql")
        let importer = new Importer({
            host:config.mysqlInfo.url,
            user:config.mysqlInfo.username,
            password:config.mysqlInfo.password,
            database:config.mysqlInfo.database,
            port:config.mysqlInfo.port,
            charsetNumber:224
        })
        console.log("exec sql start")
        await importer.import(sqlPath)
        console.log("exec sql end")
        await initSystem()
    } else {
        await checkIfNeedPatch()
        if(Application.needReset) {
            await initSystem()
        }
    }
}

async function checkIfNeedPatch() {
    let curVersion = getConfigInstance().version;
    let version = "0.0.0";
    let mysql=getMysqlInstance()
    let ret=await mysql.executeOne(generateQuerySql(versionModel,[]))
    version=ret.version
    let index = -1;
    for (let i = 0; i < patchList.length; i++) {
        let bMax = CommonUtil.versionDiff(patchList[i].version, version);
        if (bMax) {
            index = i;
            break;
        }
    }
    if (index > -1) {
        console.log("patch start");
        for (let i = index; i < patchList.length; i++) {
            await patchList[i].func();
        }
        console.log("patch end");
    }
    await mysql.execute(generateUpdateSql(versionModel,{
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
        let [adminIds,userIds,deletedUserId,_,__]=await Promise.all([
            rpcUserApi.initAdmin(),
            rpcUserApi.initUser(),
            rpcUserApi.initDeletedUser(),
            initVersion(),
            rpcAuthApi.initRole()
        ])
        let organizationId=await rpcUserApi.initOrganization(adminIds,userIds,deletedUserId);
        let organizationUserId=await rpcUserApi.getOrganizationUserId(organizationId,adminIds[0])
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

