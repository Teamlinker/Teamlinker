import { Table_Group_User } from './../../../common/model/group_user';
import { Table_Group_Role } from './../../../common/model/group_role';
import { Table_Group } from './../../../common/model/group';
import { Table_Project_User } from './../../../common/model/project_user';
import { Table_User } from './../../../common/model/user';
import { Table_Role_Permission } from './../../../common/model/role_permission';
import { Table_Project_Role } from './../../../common/model/project_role';
import { Table_Permission } from './../../../common/model/permission';
import { Table_Admin } from './../../../common/model/admin';
import { Table_Version } from './../../../common/model/version';
import { getMysqlInstance } from "../../common/db/mysql";
import { Permission_Base, Permission_Types } from '../../../common/permission/permission';
import { generateSnowId } from '../../common/util/sql';
import { OBTPConfig } from './obtp';
import { getNacosInstance } from '../../common/nacos/nacos';
import { Table_Project } from '../../../common/model/project';
export interface IServer_GateWay_FormData {
    isFile:boolean,
    name:string,
    fileName:string,
    data:string
}
export function parseFormData(str:string) :IServer_GateWay_FormData[]{
    if(!str) {
        return null;
    }
    let ret:IServer_GateWay_FormData[]=[];
    let flag=str.substring(0,str.indexOf("\r\n"))
    let reg=new RegExp(`^${flag}\r\n([\\w\\W]*)\r\n${flag}\-\-\r\n$`)
    let match=str.match(reg)
    let matchText=match[1];
    let arr=matchText.split(`\r\n${flag}\r\n`)
    for(let obj of arr) {
        let headerText=obj.substring(0,obj.indexOf("\r\n\r\n"))
        let content=obj.substr(headerText.length+4)
        let arrHeader=headerText.split("; ")
        let objForm=<IServer_GateWay_FormData>{}
        for(let obj of arrHeader){
            let arr=obj.split("=")
            let key=arr[0]
            let value=arr[1]
            if(key=="filename"){
                objForm.isFile=true;
                objForm.fileName=value.split("\r\n")[0].replace(/[\'\"]/g,"");
            } else if(key=="name") {
                objForm.name=value.replace(/[\'\"]/g,"");
            }
        }
        objForm.data=content;
        ret.push(objForm)
    }
    return ret;
}

async function resetSystem(){
    let mysql=getMysqlInstance()
    await mysql.execute(`delete from ${Table_Version}`) 
    await mysql.execute(`delete from ${Table_Admin}`) 
    await mysql.execute(`delete from ${Table_Permission}`) 
    await mysql.execute(`delete from ${Table_Project_Role}`) 
    await mysql.execute(`delete from ${Table_Role_Permission}`) 
    await mysql.execute(`delete from ${Table_User}`) 
    await mysql.execute(`delete from ${Table_Project}`) 
    await mysql.execute(`delete from ${Table_Project_User}`) 
    await mysql.execute(`delete from ${Table_Group_Role}`)
    await mysql.execute(`delete from ${Table_Group}`)  
    await mysql.execute(`delete from ${Table_Group_User}`)
}

export async function initSystem() {
    await resetSystem()
    let mysql=getMysqlInstance()
    let ret=await mysql.execute<any[]>(`select * from ${Table_Version}`)
    if(ret===null || ret.length==0){
        let objPermission=<{
            [param:number]:string
        }>{}
        let adminId=await generateSnowId()
        let userId=await generateSnowId()
        let projectId=await generateSnowId()
        let groupId=await generateSnowId()
        await mysql.execute(`insert into ${Table_Admin} (id,name,password) values ('${adminId}','teamlinker','teamlinker')`)
        await mysql.execute(`insert into ${Table_User} (id,username,password) values ('${userId}','sx','sx')`)
        await mysql.execute(`insert into ${Table_Project} (id,name,keyword,created_by) values ('${projectId}','test','test','${userId}')`)
        await mysql.execute(`insert into ${Table_Group} (id,name,created_by) values ('${groupId}','test_group','${userId}')`)
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
        let objProjectRole=OBTPConfig.Role.Project_Role,projectRoleUserId;
        for(let key in objProjectRole) {
            let obj=objProjectRole[key]
            let projectRoleId=await generateSnowId()
            if(obj.name=="user") {
                projectRoleUserId=projectRoleId
            }
            let name=obj.name
            let description=obj.description
            await mysql.execute(`insert into ${Table_Project_Role} (id,name,description) values ('${projectRoleId}','${name}','${description}')`)
            for(let o of obj.permission) {
                let id=await generateSnowId()
                await mysql.execute(`insert into ${Table_Role_Permission} (id,role_id,permission_id) values ('${id}','${projectRoleId}','${objPermission[o.value]}')`)
            }
        }
        await mysql.execute(`insert into ${Table_Project_User} (id,role,project_id,user_id) values ('${await generateSnowId()}','${projectRoleUserId}','${projectId}','${userId}')`)
        await mysql.execute(`insert into ${Table_Version} (version) values ('${getNacosInstance().version}')`)
        let objGroupRole=OBTPConfig.Role.Group_Role,groupRoleUserId;
        for(let key in objGroupRole) {
            let obj=objGroupRole[key]
            let groupRoleId=await generateSnowId()
            if(obj.name=="user") {
                groupRoleUserId=groupRoleId
            }
            let name=obj.name
            let description=obj.description
            await mysql.execute(`insert into ${Table_Group_Role} (id,name,description) values ('${groupRoleId}','${name}','${description}')`)
            for(let o of obj.permission) {
                let id=await generateSnowId()
                await mysql.execute(`insert into ${Table_Role_Permission} (id,role_id,permission_id) values ('${id}','${groupRoleId}','${objPermission[o.value]}')`)
            }
        }
        await mysql.execute(`insert into ${Table_Group_User} (id,role,group_id,user_id) values ('${await generateSnowId()}','${groupRoleUserId}','${groupId}','${userId}')`)
    }
    console.log("init finish")
}