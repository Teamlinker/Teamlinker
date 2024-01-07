import {ITeamOS_Menu} from "../common/type";
import {Base} from "../common/util/base";

export interface ITeamOS_Icon_Event {
    "move":(item:Icon)=>void
    "dbClick":(item:Icon)=>void
    "click":(item:Icon)=>void
    "contextmenu":((item:Icon)=>ITeamOS_Menu[])|((item:Icon)=>Promise<ITeamOS_Menu[]>)
}

export const iconGroupMap={
    calendar:"calendar",
    im:"message",
    meeting:"video",
    people:"user",
    project:"project",
    setting:"setting",
    team:"team",
    wiki:"file-text",
    finder:"folder-view",
    account:"setting",
    help:"help"
}

export class Icon extends Base{
    static height=80;
    static width=60;
    name=""
    icon=""
    iconColor="white"
    nameColor="white"
    meta:any
    rename=false
    loadingFunc:()=>boolean
    onDBClick:(item:Icon)=>void
    onClick:(item:Icon)=>void
    onMove:(item:Icon)=>void
    onRename:(item:Icon,name:string)=>Promise<void>
    onContextMenu:((item:Icon)=>ITeamOS_Menu[])|((item:Icon)=>Promise<ITeamOS_Menu[]>)
    constructor(name:string,icon:string,meta?:any,iconColor?:string,nameColor?:string) {
        super()
        this.name=name;
        this.icon=icon;
        this.meta=meta
        if(iconColor) {
            this.iconColor=iconColor
        }
        if(nameColor) {
            this.nameColor=nameColor
        }
        this.onContextMenu=async item => {
            return []
        }
    }
    addEventListener<T extends keyof ITeamOS_Icon_Event>(eventType:T,func:ITeamOS_Icon_Event[T]) {
        if(eventType=="move") {
            this.onMove=func.bind(null,this);
        } else if(eventType=="dbClick") {
            this.onDBClick=func.bind(null,this);
        } else if(eventType=="contextmenu") {
            this.onContextMenu=func.bind(null,this) as ITeamOS_Icon_Event["contextmenu"];
        } else if(eventType=="click") {
            this.onClick=func.bind(null,this);
        }
    }
}