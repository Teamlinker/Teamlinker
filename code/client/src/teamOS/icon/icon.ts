import {ITeamOS_Menu, ITeamOS_Point} from "../common/type";
import {Base} from "../common/util/base";

export interface ITeamOS_Icon_Event {
    "move":(item:Icon)=>void
    "dbClick":(item:Icon)=>void
    "contextmenu":((item:Icon)=>ITeamOS_Menu[]) | ((item:Icon)=>Promise<ITeamOS_Menu[]>)
}

export class Icon extends Base{
    static height=80;
    static width=60;
    name=""
    icon=""
    meta:any
    point:ITeamOS_Point
    onDBClick:(item:Icon)=>void
    onMove:(item:Icon)=>void
    onContextMenu:((item:Icon)=>ITeamOS_Menu[]) | ((item:Icon)=>Promise<ITeamOS_Menu[]>)
    constructor(name:string,icon:string,point:ITeamOS_Point={left:"0%",top:"0%"},meta?:any) {
        super()
        this.name=name;
        this.icon=icon;
        this.point=point
        this.meta=meta
    }
    addEventListener<T extends keyof ITeamOS_Icon_Event>(eventType:T,func:ITeamOS_Icon_Event[T]) {
        if(eventType=="move") {
            this.onMove=func.bind(null,this);
        } else if(eventType=="dbClick") {
            this.onDBClick=func.bind(null,this);
        } else if(eventType=="contextmenu") {
            this.onContextMenu=func.bind(null,this) as ITeamOS_Icon_Event["contextmenu"];
        }
    }
}