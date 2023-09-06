import {ITeamOS_Point} from "../type";
import {ObjectDirective} from "vue";
import multiFile from ".././../../../src/assert/multiFile.png"
import {selectedSelectableItems} from "./selectable";
import {ECommon_Model_Finder_Shortcut_Type} from "../../../../../common/model/finder_item";

export type IClient_Drag_Element={
    element:HTMLElement,
    type:EClient_Drag_Type,
    value:string,
    from:"finder"|"content"|"entity",
    shortcutType?:ECommon_Model_Finder_Shortcut_Type,
    shortcutRefId?:string,
    shortcutName?:string
}
export type IClient_Drag_Shortcut_Value={
    value:string,
    shortcutType:ECommon_Model_Finder_Shortcut_Type
    shortcutRefId:string,
    shortcutName:string
}

export let dragElementList:IClient_Drag_Element[]=[]
export enum EClient_Drag_Type {
    FILE="file",
    SHORTCUT="shortcut",
    FOLDER="folder",
    DISK="disk"
}
export const vDrag:ObjectDirective={
    mounted(el:HTMLElement, binding){
        el.draggable=true;
        el.style.cursor="move"
        let point:ITeamOS_Point,value:string|IClient_Drag_Shortcut_Value|(()=>IClient_Drag_Shortcut_Value)
        let left:any,top:any,parentWidth:number,parentHeight:number,startLeft:number,startTop:number,parentElement:HTMLElement
        let originPoint:ITeamOS_Point
        let target:HTMLElement;
        let free=binding.modifiers.free
        if(binding.arg) {
            target=document.getElementById(binding.arg)
        } else {
            target=el;
        }
        if(free) {
            point=binding.value
        } else {
            value=binding.value
        }
        let modifiers=binding.modifiers;
        let type:EClient_Drag_Type
        if(modifiers.file) {
            type=EClient_Drag_Type.FILE
        } else if(modifiers.folder) {
            type=EClient_Drag_Type.FOLDER
        } else if(modifiers.shortcut) {
            type=EClient_Drag_Type.SHORTCUT
        }
        let from:"entity"|"finder"="entity"
        target.setAttribute("allowDrag","1")
        target.setAttribute("dragType",type)
        if(type===EClient_Drag_Type.SHORTCUT) {
            if(typeof(value)!=="function") {
                if((value as IClient_Drag_Shortcut_Value).value!==undefined) {
                    from="finder"
                    target.setAttribute("dragValue",(value as IClient_Drag_Shortcut_Value).value)
                }
                if((value as IClient_Drag_Shortcut_Value).shortcutType!==undefined){
                    target.setAttribute("shortcutType",(value as IClient_Drag_Shortcut_Value).shortcutType)
                }
                if((value as IClient_Drag_Shortcut_Value).shortcutRefId!==undefined) {
                    target.setAttribute("shortcutRefId",(value as IClient_Drag_Shortcut_Value).shortcutRefId)
                }
                if((value as IClient_Drag_Shortcut_Value).shortcutName!==undefined) {
                    target.setAttribute("shortcutName",(value as IClient_Drag_Shortcut_Value).shortcutName)
                }
            }
        } else {
            if(value) {
                from="finder"
                target.setAttribute("dragValue",value as string)
            }
        }
        const onDragStart=(ev: DragEvent)=>{
            if(type===EClient_Drag_Type.SHORTCUT && typeof value==="function") {
                let ret=value()
                if(ret.value) {
                    from="finder"
                    target.setAttribute("dragValue",ret.value)
                }
                if(ret.shortcutType) {
                    target.setAttribute("shortcutType",ret.shortcutType)
                }
                if(ret.shortcutRefId) {
                    target.setAttribute("shortcutRefId",ret.shortcutRefId)
                }
                if(ret.shortcutName) {
                    target.setAttribute("shortcutName",ret.shortcutName)
                }
            }
            if(free) {
                el.style.zIndex="10000"
                originPoint={
                    ...point
                }
                let target=ev.currentTarget as HTMLElement
                if(binding.arg) {
                    target=document.getElementById(binding.arg)
                }
                left=ev.pageX - target.offsetLeft
                top=ev.pageY - target.offsetTop
                let ele:HTMLElement;
                startLeft=(ev.pageX-left)/parentWidth*100
                startTop=(ev.pageY-top)/parentHeight*100;
                if(!parentElement) {
                    while(ele=target.parentElement) {
                        if(ele.tagName.toLowerCase()=="body" || ele.style.position=="absolute" || ele.style.position=="relative") {
                            parentHeight=ele.clientHeight;
                            parentWidth=ele.clientWidth;
                            parentElement=ele;
                            break
                        }
                        target=ele;
                    }
                } else {
                    parentHeight=parentElement.clientHeight;
                    parentWidth=parentElement.clientWidth;
                }
                let img = new Image();
                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                img.width=0;
                img.height=0;
                img.style.opacity="0"
                ev.dataTransfer.setDragImage(img, 0, 0);
                ev.dataTransfer.setData("free","1")
            } else {
                if(selectedSelectableItems.length>1) {
                    selectedSelectableItems.forEach(ele => {
                        ev.dataTransfer.setData(ele.getAttribute("dragType"),ele.getAttribute("dragValue"))
                        dragElementList.push({
                            element:ele,
                            value:ele.getAttribute("dragValue"),
                            type:ele.getAttribute("dragType") as EClient_Drag_Type,
                            ...(type===EClient_Drag_Type.SHORTCUT && {
                                shortcutType:ele.getAttribute("shortcutType") as ECommon_Model_Finder_Shortcut_Type,
                                shortcutRefId:ele.getAttribute("shortcutRefId"),
                                shortcutName:ele.getAttribute("shortcutName")
                            }),
                            from
                        })
                    })
                    let img = new Image();
                    img.src = multiFile
                    img.style.width="20px"
                    img.style.height="20px"
                    img.style.opacity="0.5"
                    ev.dataTransfer.setDragImage(img, 0, 0);
                } else {
                    if(type===EClient_Drag_Type.SHORTCUT) {
                        ev.dataTransfer.setData(type,(value as IClient_Drag_Shortcut_Value).value)
                        dragElementList.push({
                            element:target,
                            value:target.getAttribute("dragValue"),
                            type:type,
                            shortcutType:target.getAttribute("shortcutType") as ECommon_Model_Finder_Shortcut_Type,
                            shortcutRefId:target.getAttribute("shortcutRefId"),
                            shortcutName:target.getAttribute("shortcutName"),
                            from
                        })
                    } else {
                        ev.dataTransfer.setData(type,value as string)
                        dragElementList.push({
                            element:target,
                            value:value as string,
                            type:type,
                            from
                        })
                    }
                }
            }

        }
        const onDrag=(ev: any)=>{
            if(free) {
                let calcLeft:number,calcTop:number
                if(ev.pageX==0) {
                    calcLeft=startLeft
                } else if(ev.pageX<left) {
                    calcLeft=(ev.pageX-left)/parentWidth*100
                } else {
                    calcLeft=(ev.pageX-left)/parentWidth*100
                }
                if(ev.pageY==0) {
                    calcTop=startTop;
                } else if(ev.pageY<top) {
                    calcTop=0
                } else {
                    calcTop=(ev.pageY-top)/parentHeight*100;
                }
                point.left = `${calcLeft.toFixed(3)}%`;
                point.top=`${calcTop.toFixed(3)}%`
            }

        }
        el.addEventListener("dragstart",onDragStart)
        el.addEventListener("drag",onDrag)
        el.addEventListener("dragend",ev => {
            dragElementList=[]
            let dragContainer=document.getElementById("dragContainer")
            if(dragContainer) {
                dragContainer.remove()
            }
        })
        el.addEventListener("mousedown",ev => {
            if(!selectedSelectableItems.includes(el)) {
                selectedSelectableItems.forEach(value => {
                    value.removeAttribute("selected")
                })
            }
        })
    },
}