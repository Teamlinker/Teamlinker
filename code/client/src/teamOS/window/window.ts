import {ITeamOS_Rect} from "../common/type";
import {Component, inject} from "vue";
import {Base} from "../common/util/base";
import {v4} from "uuid";

export enum ETeamOS_Window_Type {
    SIMPLE,
    TAB
}

export enum ETeamOS_Window_Status {
    NORMAL,
    MAX,
    MIN
}

export interface ITeamOS_Window_Node {
    id?:string
    components:{
        [name:string]:Component
    }
    default:{
        name:string,
        props?:object,
        title?:string
    },
    meta?:{
        title?:string,
        data?:any
    },
    path?:{
        [name:string]:{
            name:string,
            props?:object
        }
    }
}

export interface ITeamOS_Window_Event {
    "open":(item:Window)=>void,
    "move":(item:Window)=>void,
    "newTab":(item:Window)=>Promise<ITeamOS_Window_Node>,
    "removeTab":(item:Window)=>void,
    "close":(item:Window)=>Promise<boolean>
}

export function getCurrentWindow():Window {
    let win=inject("windowRef") as Window
    return win
}

export class Window extends Base{
    name=""
    type:ETeamOS_Window_Type
    title=""
    isFocus=false
    isPopup=false
    rect:ITeamOS_Rect={
        left:"10%",
        top:"10%",
        width:"80%",
        height:"80%"
    }
    originalRect:ITeamOS_Rect
    originalStatus:ETeamOS_Window_Status
    group:string
    nodes:ITeamOS_Window_Node[]
    status=ETeamOS_Window_Status.NORMAL
    isControl=false
    activeKey=""
    onMove:(item:Window)=>void
    onOpen:(item:Window)=>void
    onNewTab:(item:Window)=>Promise<ITeamOS_Window_Node>
    onRemoveTab:(item:Window)=>void
    onClose:(item:Window)=>Promise<boolean>
    constructor(name:string,type:ETeamOS_Window_Type,group:string,isControl:boolean,nodes:ITeamOS_Window_Node[],title?:string) {
        super()
        this.name=name;
        this.type=type;
        this.group=group;
        this.isControl=isControl
        this.nodes=nodes;
        for(let obj of this.nodes) {
            if(!obj.id) {
                obj.id=v4()
            }
        }
        this.activeKey=this.nodes[0].id
        if(title) {
            this.title=title;
        }
    }
    addEventListener<T extends keyof ITeamOS_Window_Event>(eventType:T,func:ITeamOS_Window_Event[T]) {
        if(eventType=="move") {
            this.onMove=func
        } else if(eventType=="open") {
            this.onOpen=func
        } else if(eventType=="newTab") {
            this.onNewTab=func as ITeamOS_Window_Event["newTab"]
        } else if(eventType=="removeTab") {
            this.onRemoveTab=func
        } else if(eventType=="close") {
            this.onClose=func as ITeamOS_Window_Event["close"]
        }
    }
}