import EventEmitter from "eventemitter3"

export enum EClient_EVENTBUS_TYPE {
    OPEN_PEOPLE_PROFILE="open_people_profile",
    OPEN_TEAM_PROFILE="open_team_profile"
}

interface IClient_EventBus_Func {
    [EClient_EVENTBUS_TYPE.OPEN_PEOPLE_PROFILE]:(organizationUserId:string)=>void
    [EClient_EVENTBUS_TYPE.OPEN_TEAM_PROFILE]:(teamId:string)=>void
}

interface IClient_EventBus_Emit_Func {
    on<U extends keyof IClient_EventBus_Func>(event:U,listener: IClient_EventBus_Func[U]):this;
    emit<U extends keyof IClient_EventBus_Func>(event:U,...args:Parameters<IClient_EventBus_Func[U]>):boolean
}

class Event extends EventEmitter implements IClient_EventBus_Emit_Func{
    constructor() {
        super();
    }
}

let obj=new Event()

export const eventBus:IClient_EventBus_Emit_Func=obj
