import {IServer_Common_Event_Types} from "./types"

var g_events=<{
    [param:string]: ((...args: any[]) =>any)[]
}>{

}

export function getEventsFunc(){
    return g_events
}

export function DEventListener(eventName: keyof IServer_Common_Event_Types) {
    return function (target, propertyKey: string, desc: PropertyDescriptor) {
        let handle = desc.value.bind(target)
        if(!g_events[eventName]) {
            g_events[eventName]=[]
        }
        g_events[eventName].push(handle);
    }
}

export function emitServiceEvent<T extends keyof IServer_Common_Event_Types>(event: T, ...obj: Parameters<IServer_Common_Event_Types[T]>) {
    let objFunc = getEventsFunc()
    for (let key in objFunc) {
        if (key == event) {
            for (let func of objFunc[key]) {
                func(...obj)
            }
        }
    }
}