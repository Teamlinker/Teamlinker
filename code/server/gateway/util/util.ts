import * as crypto from "crypto";
import * as fs from "fs-extra";
import { Table_Project } from '../../../common/model/project';
import { Permission_Base, Permission_Types } from '../../../common/permission/permission';
import { getMysqlInstance } from "../../common/db/mysql";
import { getNacosInstance } from '../../common/nacos/nacos';
import { generateSnowId } from '../../common/util/sql';
import rpcFileApi from '../rpc/file';
import { Table_Issue_Type } from './../../../common/model/issue_type';
import { Table_Issue_Type_Solution } from './../../../common/model/issue_type_solution';
import { Table_Issue_Type_Solution_Issue_Type } from './../../../common/model/issue_type_solution_issue_type';
import { Table_Permission } from './../../../common/model/permission';
import { Table_Project_Member } from './../../../common/model/project_member';
import { Table_Project_Role } from './../../../common/model/project_role';
import { Table_Role_Permission } from './../../../common/model/role_permission';
import { Table_Team } from './../../../common/model/team';
import { Table_Team_Role } from './../../../common/model/team_role';
import { Table_Team_User } from './../../../common/model/team_user';
import { Table_User } from './../../../common/model/user';
import { ICommon_Version_Config, Table_Version } from './../../../common/model/version';
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
    let arr=<{
        object:object,
        key:string|number
    }[]>[]
    function _clone(o){
        var k, b;
        if(o && ((b = (o instanceof Array)) || o instanceof Object)) {
            for(k in o){
                if(o.hasOwnProperty(k)){
                    if(["photo","image","icon","img"].includes(k) && typeof(o[k])=="string" && o[k].length>=18 && /^\d+$/.test(o[k])) {
                        arr.push({
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
    if(arr.length>0) {
        let ids=arr.map(item=>{
            return item.object[item.key];
        })
        let paths=await rpcFileApi.getPaths(ids)
        for(let i=0;i<arr.length;i++)
        {
            arr[i].object[arr[i].key]=paths[i]
        }
    }
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
        await mysql.execute(`insert into ${Table_User} (id,username,password,admin) values ('${adminId}','teamlinker','teamlinker',1)`)
        await mysql.execute(`insert into ${Table_User} (id,username,password) values ('${userId}','sx','sx')`)
        await mysql.execute(`insert into ${Table_Project} (id,name,keyword,created_by) values ('${projectId}','test','test','${userId}')`)
        await mysql.execute(`insert into ${Table_Team} (id,name,created_by) values ('${groupId}','test_group','${userId}')`)
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
        await mysql.execute(`insert into ${Table_Project_Member} (id,role_id,project_id,member_id,type) values ('${await generateSnowId()}','${projectRoleUserId}','${projectId}','${userId}',0)`)
        let config:ICommon_Version_Config={
            fileBasePath:"/tmp/teamlinker"
        }
        await mysql.execute(`insert into ${Table_Version} (version,config) values ('${getNacosInstance().version}','${JSON.stringify(config)}')`)
        if(!(await fs.pathExists(config.fileBasePath))) {
            await fs.mkdirp(config.fileBasePath)
        }
        let objGroupRole=OBTPConfig.Role.Team_Role,groupRoleUserId;
        for(let key in objGroupRole) {
            let obj=objGroupRole[key]
            let groupRoleId=await generateSnowId()
            if(obj.name=="user") {
                groupRoleUserId=groupRoleId
            }
            let name=obj.name
            let description=obj.description
            await mysql.execute(`insert into ${Table_Team_Role} (id,name,description) values ('${groupRoleId}','${name}','${description}')`)
            for(let o of obj.permission) {
                let id=await generateSnowId()
                await mysql.execute(`insert into ${Table_Role_Permission} (id,role_id,permission_id) values ('${id}','${groupRoleId}','${objPermission[o.value]}')`)
            }
        }
        await mysql.execute(`insert into ${Table_Team_User} (id,role_id,team_id,user_id) values ('${await generateSnowId()}','${groupRoleUserId}','${groupId}','${userId}')`)
        await mysql.execute(`insert into ${Table_Issue_Type} (id,name,reserved) values ('${await generateSnowId()}','Task',1)`)
        await mysql.execute(`insert into ${Table_Issue_Type} (id,name,reserved) values ('${await generateSnowId()}','Bug',1)`)
        await mysql.execute(`insert into ${Table_Issue_Type} (id,name,reserved) values ('${await generateSnowId()}','Ticket',1)`)
    }
    console.log("init finish")
}