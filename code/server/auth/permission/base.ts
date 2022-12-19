import Redlock, {Lock} from "redlock";
import {Permission_Base, Permission_Types} from "../../../common/permission/permission";
import {getRedisInstance} from "../../common/cache/redis";
import {getComponent} from "../../common/decorate/component";
import type {PermissionOrganization} from "./organization";

export abstract class PermissionBase {
    static Lock:InstanceType<typeof Redlock>
    lock:Lock;
    abstract fieldName:string;
    abstract translateToField(param:{
        userId?:string,
        isAdmin?:boolean,
        [param:string]:any
    }):Promise<string>
    abstract generatorValue(param:{
        userId?:string,
        isAdmin?:boolean,
        [param:string]:any
    }):Promise<number>
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
            this.lock=null;
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

export async function processPermission (arrPermission:Permission_Base[],objContent:any):Promise<boolean> {
    try {
        let permissionMap:{
            [keys:string]:number
        }={}
        let organizationId:string=objContent["organizationId"];
        let objOrganization=getComponent<PermissionOrganization>("PermissionOrganization");
        let value = await objOrganization.generatorValue(Object.assign({},objContent,{organizationId}))
        if(value===Permission_Types.Organization.ADMIN.value) {
            return true;
        }
        permissionMap["PermissionOrganization"]=value
        for(let obj of arrPermission) {
            let permissionName="Permission"+obj.constructor.name
            let value=permissionMap[permissionName];
            if(value===undefined) {
                let objPermission=getComponent<PermissionBase>(permissionName)
                if(objPermission.fieldName && !objContent[objPermission.fieldName]) {
                    let field=await objPermission.translateToField(objContent)
                    if(field===undefined || field===null) {
                        return false;
                    }
                    objContent=Object.assign({},objContent,{[objPermission.fieldName]:field})
                }
                value = await objPermission.generatorValue(objContent)
                permissionMap[permissionName] = value;
                if (value === null || value===undefined) {
                    return false
                } else {
                    let isCheck = (value & obj.value) && value>=obj.value
                    if (!isCheck) {
                        return false
                    }
                }
            } else {
                let isCheck = (value & obj.value) && value>=obj.value
                if (!isCheck) {
                    return false
                }
            }
        }
        return true
    } catch (err) {
        console.error(err)
        return false
    }
    
}
