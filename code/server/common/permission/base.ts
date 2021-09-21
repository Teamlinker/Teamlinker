import { Permission_Base } from "../../../common/permission/permission";
import { getRedisInstance } from "../cache/redis";
import { getComponent } from "../decorate/component";
var g_Permission=new WeakMap<Permission_Base,PermissionBase>()

export abstract class PermissionBase<T=any> {
    abstract key:string;
    abstract create(...argv:any):Promise<T>
    abstract check(obj:T):boolean
    abstract getKey(...argv:any):string
    async clear() {
        await getRedisInstance().del(this.key);
    }
    protected async getValue():Promise<T> {
        let obj=await getRedisInstance().get<T>(this.key,<T>{});
        return obj;
    }
}

export async function processPermission (arrPermission:Permission_Base[],objContent:any):Promise<boolean> {
    try {
        let keyMap={}
        for(let obj of arrPermission) {
            let objPermission=g_Permission.get(obj)
            if(objPermission.key) {
                let key=objPermission.getKey(objContent)
                let value=keyMap[key];
                if(value===undefined) {
                    let isExists = await getRedisInstance().exists(key)
                    if (!isExists) {
                        value = await objPermission.create(objContent)
                        if (value !== null) {
                            await getRedisInstance().set(key, value)
                        } else {
                            return false
                        }
                    }
                    keyMap[key] = value;
                }
                let isCheck = await objPermission.check(value);
                if (!isCheck) {
                    return false;
                }
            } else {
                let isCheck = await objPermission.check(objContent);
                if (!isCheck) {
                    return false;
                }
            }
        }
        return true
    } catch (err) {
        return false
    }
    
}

export function DPermission (key:Permission_Base) {
    return function (constructor: Function){
        let obj=getComponent(constructor.name) as PermissionBase
        g_Permission.set(key,obj);
    }
}