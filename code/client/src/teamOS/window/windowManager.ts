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
                this.show(window.id,true)
                if(window.onOpen) {
                    window.onOpen(window);
                }
            } else {
                if(window.type==ETeamOS_Window_Type.SIMPLE) {
                    this.show(arr[0].id)
                } else {
                    let focused=this.getFocused()
                    if(focused?.group===window.group) {
                        focused.nodes.push(...window.nodes)
                        focused.activeKey=window.nodes[0].id
                        this.show(focused.id)
                    } else {
                        let index=0,size=arr.length
                        for(let i=1;i<arr.length;i++) {
                            if(arr[i].nodes.length<size) {
                                size=arr[i].nodes.length;
                                index=i;
                            }
                        }
                        arr[index].nodes.push(...window.nodes)
                        arr[index].activeKey=window.nodes[0].id;
                        this.show(arr[index].id)
                    }
                    if(window.onOpen) {
                        window.onOpen(window);
                    }
                }
            }
        } else {
            this.windowList.push(window)
            this.show(window.id,true)
            if(window.onOpen) {
                window.onOpen(window);
            }
        }
    }
    async removeById(id:string) {
        for(let i=0;i<this.windowList.length;i++) {
            if(this.windowList[i].id==id) {
                let obj=this.windowList[i]
                if(obj.onClose) {
                    let ret=await obj.onClose(obj)
                    if(ret===false) {
                        return
                    }
                }
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
            obj.originalRect={...obj.rect}
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
            obj.originalRect={...obj.rect}
            obj.originalStatus=obj.status
            obj.status=ETeamOS_Window_Status.MIN
            if(obj.isFocus) {
                obj.isFocus=false
            }
        }
    }
    show(id:string,isNew?:boolean) {
        let obj=this.getById(id);
        if(obj) {
            if(isNew) {
                obj.rect.top=`${10+Math.random()*8-4}%`
                obj.rect.left=`${10+Math.random()*8-4}%`
                obj.status=ETeamOS_Window_Status.NORMAL
                obj.rect.width="80%"
                obj.rect.height="80%"
            } else {
                obj.isPopup=false
                if(obj.status===ETeamOS_Window_Status.MIN) {
                    Object.assign(obj.rect,obj.originalRect)
                    obj.status=obj.originalStatus
                }
            }
        }
        this.setFocus(id);
    }
    close(id:string) {
        this.removeById(id);
    }
    popup(id:string,width:`${number}%`,height:`${number}%`) {
        let obj=this.getById(id);
        if(obj) {
            obj.rect.width=width
            obj.rect.height=height
            obj.isFocus=false
            obj.isPopup=true
        }
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
    clear(exceptGroups?:string[]) {
        if(exceptGroups?.length>0) {
            for(let i=0;i<this.windowList.length;i++) {
                let win=this.windowList[i]
                if(!exceptGroups.includes(win.group)) {
                    this.windowList.splice(i,1)
                    i--;
                }
            }
        } else {
            this.windowList.splice(0,this.windowList.length)
        }
    }
}

export const windowManager=new WindowManager()