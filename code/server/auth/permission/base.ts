import Redlock, {Lock} from "redlock";
import {Permission_Base, Permission_Types} from "../../../common/permission/permission";
import {getRedisInstance} from "../../common/cache/redis";
import {getComponent} from "../../common/decorate/component";
import type {PermissionOrganization} from "./organization";
import {REDIS_AUTH} from "../../common/cache/keys/auth";
import rpcCalendarApi from "../../calendar/rpc/calendar";
import rpcMeetingApi from "../../meeting/rpc/meeting"

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
    abstract checkOrganizationId(businessId:string,currentOrganizationId:string):Promise<boolean>
    async tryLock(keys:string[]){
        if(!PermissionBase.Lock) {
            PermissionBase.Lock=new Redlock([getRedisInstance().getIORedis()],{
                driftFactor:0.01,
                retryCount:20,
                retryDelay:200,
                retryJitter:100,
                automaticExtensionThreshold:500
            })
        }
        this.lock=await PermissionBase.Lock.acquire(keys,5000)
        await this.lock.extend(1600)
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

export async function processPermission (permissionOr:boolean,arrPermission:Permission_Base[],objContent:any):Promise<boolean> {
    try {
        let permissionMap:{
            [keys:string]:number
        }={}
        let organizationId:string=objContent["organizationId"];
        let objOrganization=getComponent<PermissionOrganization>("PermissionOrganization");
        let organizationValue = await objOrganization.generatorValue(Object.assign({},objContent,{organizationId}))
        permissionMap["PermissionOrganization"]=organizationValue
        let res=true
        for(let obj of arrPermission) {
            res=true;
            let permissionName="Permission"+obj.constructor.name
            if(obj===Permission_Types.Common.SELF) {
                permissionName="PermissionSelf"
            }
            let value=permissionMap[permissionName];
            if(value===undefined) {
                let objPermission=getComponent<PermissionBase>(permissionName)
                if(objPermission.fieldName && !objContent[objPermission.fieldName]) {
                    let field=await objPermission.translateToField(objContent)
                    if(field===undefined || field===null) {
                        if(organizationValue===Permission_Types.Organization.ADMIN.value) {
                            return true
                        }
                        if(permissionOr) {
                            res=false
                            continue;
                        }
                        return false;
                    }
                    let ret=await checkOrganization(objPermission,field,organizationId,permissionName,objContent)
                    if(!ret) {
                        if(permissionOr) {
                            res=false
                            continue;
                        }
                        return false
                    }
                    if(organizationValue===Permission_Types.Organization.ADMIN.value) {
                        return true
                    }
                    objContent=Object.assign({},objContent,{[objPermission.fieldName]:field})
                } else if(objPermission.fieldName && objContent[objPermission.fieldName]) {
                    let ret=await checkOrganization(objPermission,objContent[objPermission.fieldName],organizationId,permissionName,objContent)
                    if(!ret) {
                        if(permissionOr) {
                            res=false
                            continue;
                        }
                        return false
                    }
                    if(organizationValue===Permission_Types.Organization.ADMIN.value) {
                        return true
                    }
                }
                value = await objPermission.generatorValue(objContent)
                permissionMap[permissionName] = value;
                if (value === null || value===undefined) {
                    if(permissionOr) {
                        res=false
                        continue;
                    }
                    return false
                }
            } else {
                let ret=await checkOrganization(null,null,organizationId,permissionName,objContent)
                if(!ret) {
                    if(permissionOr) {
                        res=false
                        continue;
                    }
                    return false
                }
            }
            let isCheck = (value & obj.value) && value>=obj.value
            if (!isCheck) {
                if(permissionOr) {
                    res=false
                    continue;
                }
                return false
            } else if(permissionOr) {
                return true
            }
        }
        return res;
    } catch (err) {
        console.error(err)
        return false
    }
    
}

async function checkOrganization(objPermission:PermissionBase,field:string,organizationId:string,permissionName:string,objContent:any) {
    if(permissionName==="PermissionOrganization") {
        if(objContent["calendarId"] || objContent["calendarEventId"] || objContent["meetingRoomId"]) {
            let ret:boolean
            if(objContent["calendarId"]) {
                ret=await checkCalendarOrganizationId(objContent["calendarId"],organizationId)
            } else if(objContent["calendarEventId"]) {
                ret=await checkCalendarEventOrganizationId(objContent["calendarEventId"],organizationId)
            } else if(objContent["meetingRoomId"]) {
                ret=await checkMeetingRoomOrganizationId(objContent["meetingRoomId"],organizationId)
            }
            if(!ret) {
                return false
            }
        }
    } else if(objPermission && field) {
        let ret=await objPermission.checkOrganizationId(field,organizationId)
        if(!ret) {
            return false
        }
    }
    return true
}

async function checkCalendarOrganizationId(calendarId: string, currentOrganizationId: string): Promise<boolean> {
    let objRedis=REDIS_AUTH.Resource.resourceOrganization(calendarId)
    let organizationId=await objRedis.get()
    if(!organizationId) {
        let obj=await rpcCalendarApi.calendar(calendarId)
        if(obj) {
            organizationId=obj.organization_id
            await objRedis.set(organizationId)
        }
    }
    return organizationId===currentOrganizationId
}

async function checkCalendarEventOrganizationId(calendarEventId: string, currentOrganizationId: string): Promise<boolean> {
    let objRedis=REDIS_AUTH.Resource.resourceOrganization(calendarEventId)
    let organizationId=await objRedis.get()
    if(!organizationId) {
        let obj=await rpcCalendarApi.calendarEvent(calendarEventId)
        if(obj) {
            let objCalendarEvent=await rpcCalendarApi.calendar(obj.calendar_id)
            if(objCalendarEvent) {
                organizationId=objCalendarEvent.organization_id
                await objRedis.set(organizationId)
            }
        }
    }
    return organizationId===currentOrganizationId
}

async function checkMeetingRoomOrganizationId(meetingRoomId: string, currentOrganizationId: string): Promise<boolean> {
    let objRedis=REDIS_AUTH.Resource.resourceOrganization(meetingRoomId)
    let organizationId=await objRedis.get()
    if(!organizationId) {
        let obj=await rpcMeetingApi.meetingRoom(meetingRoomId)
        if(obj) {
            organizationId=obj.organization_id
            await objRedis.set(organizationId)
        }
    }
    return organizationId===currentOrganizationId
}