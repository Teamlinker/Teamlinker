import {reactive} from "vue";
import {ETeamOS_Window_Status, ETeamOS_Window_Type, Window} from "./window";
import {Base} from "../common/util/base";

export class WindowManager extends Base{
    private windowList=reactive<Window[]>([])
    open(window:Window,isMulti:boolean=false) {
        let arr=this.getWindowsByGroup(window.group)
        if(!isMulti) {
            if(arr.length==0) {
                this.windowList.push(window)
                this.setFocus(window.id)
                if(window.onOpen) {
                    window.onOpen(window);
                }
            } else {
                if(window.type==ETeamOS_Window_Type.SIMPLE) {
                    this.setFocus(arr[0].id)
                } else {
                    let index=0,size=this.windowList[0].nodes.length;
                    for(let i=1;i<this.windowList.length;i++) {
                        if(this.windowList[i].nodes.length<size) {
                            size=this.windowList[i].nodes.length;
                            index=i;
                        }
                    }
                    this.windowList[index].nodes.push(...window.nodes)
                    this.windowList[index].activeKey=window.nodes[0].id;
                    this.setFocus(this.windowList[index].id)
                    if(window.onOpen) {
                        window.onOpen(window);
                    }
                }
            }
        } else {
            this.windowList.push(window)
            this.setFocus(window.id)
            if(window.onOpen) {
                window.onOpen(window);
            }
        }
    }
    removeById(id:string) {
        for(let i=0;i<this.windowList.length;i++) {
            if(this.windowList[i].id==id) {
                this.windowList.splice(i,1)
                break
            }
        }
    }
    getById(id:string) {
        for(let i=0;i<this.windowList.length;i++) {
            if(this.windowList[i].id==id) {
                return this.windowList[i];
            }
        }
        return null;
    }
    getList() {
        return this.windowList
    }
    setFocus(id:string) {
        let obj:Window;
        for(let i=0;i<this.windowList.length;i++) {
            if(this.windowList[i].id==id) {
                this.windowList[i].isFocus=true
                obj=this.windowList[i];
            } else {
                this.windowList[i].isFocus=false
            }
        }
        return obj;
    }
    getFocused() {
        let obj:Window;
        for(let i=0;i<this.windowList.length;i++) {
            if(this.windowList[i].isFocus) {
                obj=this.windowList[i];
                break;
            }
        }
        return obj;
    }
    max(id:string){
        let obj=this.setFocus(id);
        if(obj) {
            obj.rect.left="0%"
            obj.rect.top="0%"
            obj.rect.width="100%"
            obj.rect.height="100%"
            obj.status=ETeamOS_Window_Status.MAX
        }
    }
    normal(id:string){
        let obj=this.setFocus(id);
        if(obj) {
            obj.rect.left="10%"
            obj.rect.top="10%"
            obj.rect.width="80%"
            obj.rect.height="80%"
            obj.status=ETeamOS_Window_Status.NORMAL
        }
    }
    hide(id:string) {
        let obj=this.getById(id);
        if(obj) {
            obj.status=ETeamOS_Window_Status.MIN
            if(obj.isFocus) {
                obj.isFocus=false
            }
        }
    }
    show(id:string) {
        let obj=this.getById(id);
        if(obj) {
            obj.status=ETeamOS_Window_Status.NORMAL
            obj.rect.width="80%"
            obj.rect.height="80%"
        }
        this.setFocus(id);
    }
    close(id:string) {
        this.removeById(id);
    }
    getWindowsByGroup(group:string):Window[] {
        let arr:Window[]=[];
        for(let i=0;i<this.windowList.length;i++) {
            if(this.windowList[i].group===group) {
                arr.push(this.windowList[i]);
            }
        }
        return arr;
    }
}

export const windowManager=new WindowManager()