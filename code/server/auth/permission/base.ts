import Redlock, { Lock } from "redlock";
import { permissionModel } from '../../../common/model/permission';
import { rolelPermissionModel } from '../../../common/model/role_permission';
import { Permission_Base } from "../../../common/permission/permission";
import { getRedisInstance } from "../../common/cache/redis";
import { getMysqlInstance } from "../../common/db/mysql";
import { getComponent } from "../../common/decorate/component";
import { generateLeftJoinSql } from "../../common/util/sql";
var g_Permission=new Map<string,PermissionBase>()

export abstract class PermissionBase<T=any> {
    static Lock:InstanceType<typeof Redlock>
    lock:Lock;
    abstract fieldName:string;
    abstract keys:string[];
    abstract check(obj:T):boolean
    abstract translateToField(param:{
        userId?:string,
        isAdmin?:boolean,
        [param:string]:any
    }):Promise<string>
    abstract buildKey(param:{
        userId?:string,
        isAdmin?:boolean,
        [param:string]:any
    }):string[]
    async clear() {
        for(let obj of this.keys) {
            await getRedisInstance().del(obj);
        }
    }
    abstract generatorValue(param:{
        userId?:string,
        isAdmin?:boolean,
        [param:string]:any
    },keys:string[]):Promise<T>
    async getRolePermissionList(roleId:string):Promise<string[]> {
        if(!roleId) {
            return null;
        }
        let redis=getRedisInstance()
        let exists=await redis.exists(`permission:role:${roleId}`)
        let list:string[]
        if(!exists) {
            let mysql=getMysqlInstance()
            let sql=generateLeftJoinSql({
                model:rolelPermissionModel
            },{
                model:permissionModel,
                columns:["value"],
                expression:{
                    id:{
                        model:rolelPermissionModel,
                        field:"permission_id"
                    }
                }
            },{
                role_id:{
                    model:rolelPermissionModel,
                    value:roleId
                }
            })
            let ret=await mysql.execute(sql)
            let arr=ret.map(item=>item.value)
            if(arr.length>0) {
                await redis.sSet(`permission:role:${roleId}`,arr,24*3600)
            }
            list=arr;
        } else {
            list=await redis.sGet(`permission:role:${roleId}`)
        }
        return list;
    } 
    async tryLock(keys:string[]){
        if(!PermissionBase.Lock) {
            PermissionBase.Lock=new Redlock([getRedisInstance().getIORedis()],{
                driftFactor:0.01,
                retryCount:10,
                retryDelay:100,
                retryJitter:100,
                automaticExtensionThreshold:500
            })
        }
        this.lock=await PermissionBase.Lock.acquire(keys,5000)
    }
    async unlock() {
        if(this.lock) {
            await this.lock.release();
        }
    }
}

export async function deletePermission(objKey:object) {
    let keyCon=Object.keys(objKey)
    for(let keys of keyCon) {
        let arrKey=keys.split("|")
        arrKey.forEach(key=>{
            getRedisInstance().del(key)
        })
    }
}

export async function processPermission (arrPermission:Permission_Base[],objContent:any):Promise<[boolean,object]> {
    try {
        let keyMap={}
        for(let obj of arrPermission) {
            let objPermission=g_Permission.get(obj.value)
            if(objPermission.keys) {
                if(objPermission.fieldName && !objContent[objPermission.fieldName]) {
                    let field=await objPermission.translateToField(objContent)
                    if(field===undefined || field===null) {
                        return [false,null]
                    }
                    objContent=Object.assign({},objContent,{[objPermission.fieldName]:field})
                }
                let keys=objPermission.buildKey(objContent)
                if(!keys) {
                    return [false,null]
                }
                let key=keys.join("|")
                let value=keyMap[key];
                if(value===undefined) {
                    value = await objPermission.generatorValue(objContent,keys)
                    if (value === null) {
                        return [false,null]
                    }
                    keyMap[key] = value;
                } else if(value===null) {
                    return [false,null]
                }
                let isCheck = await objPermission.check(value);
                if (!isCheck) {
                    return [false,null];
                }
            } else {
                let isCheck = await objPermission.check(objContent);
                if (!isCheck) {
                    return [false,null];
                }
            }
        }
        return [true,keyMap]
    } catch (err) {
        console.error(err)
        return [false,null]
    }
    
}

export function DPermission (key:Permission_Base) {
    return function (constructor: Function){
        let obj=getComponent(constructor.name) as PermissionBase
        g_Permission.set(key.value,obj);
    }
}