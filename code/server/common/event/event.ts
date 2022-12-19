import {EServer_Common_Event_Types} from "./types"

var g_events=<{
    [param:string]: ((...args: any[]) =>any)[]
}>{

}

export function getEventsFunc(){
    return g_events
}

export function DEventListener(eventName: EServer_Common_Event_Types.Types) {
    return function (target, propertyKey: string, desc: PropertyDescriptor) {
        let handle = desc.value.bind(target)
        if(!g_events[eventName]) {
            g_events[eventName]=[]
        }
        g_events[eventName].push(handle);
    }
}

export async function emitServiceEvent(event: EServer_Common_Event_Types.Types, obj: any) {
    let objFunc = getEventsFunc()
    for (let key in objFunc) {
        if (key == event) {
            for (let func of objFunc[key]) {
                func(obj)
            }
        }
    }
}