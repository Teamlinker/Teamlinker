import {ECommon_IM_Message_EntityType} from "../../../../../common/model/im_unread_message";

export interface IClient_SessionStorage_Type {
    organizationId:string
    userId:string
    userToken:string
    imRecentList:{
        [organizationId:string]:{
            id:string,
            type:ECommon_IM_Message_EntityType
        }[]
    }
    organizationUserId:string,
    firstShow:string,
    wechatOpenId:string
}

let keys:(keyof IClient_SessionStorage_Type)[]=["organizationId","userId","userToken","imRecentList","organizationUserId","firstShow","wechatOpenId"]

export class SessionStorage {
    static get<T extends keyof IClient_SessionStorage_Type>(name:T):IClient_SessionStorage_Type[T] {
        let val=sessionStorage.getItem(name)
        if(val) {
            try {
                let ret=JSON.parse(val)
                if(typeof ret=="object") {
                    return ret
                } else {
                    return val as any;
                }
            } catch {
                return val as any;
            }
        } else {
            return null;
        }
    }
    static set<T extends keyof IClient_SessionStorage_Type>(name:T,value:IClient_SessionStorage_Type[T]) {
        if(typeof value=="object") {
            sessionStorage.setItem(name,JSON.stringify(value))
        } else {
            sessionStorage.setItem(name,value)
        }
    }
    static remove<T extends keyof IClient_SessionStorage_Type>(name:T) {
        sessionStorage.removeItem(name)
    }
    static clear(excepts?:(keyof IClient_SessionStorage_Type)[]) {
        keys.forEach(name=>{
            if(!excepts?.includes(name)) {
                sessionStorage.removeItem(name)
            }
        })
    }
}