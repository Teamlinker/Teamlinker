import {Directive} from "vue";
import {dragElementList, EClient_Drag_Type, IClient_Drag_Element} from "./drag";

export type DropParam={
    type:"external"|"internal",
    data:File[]|IClient_Drag_Element[]
}
function createContainer(rect:DOMRect) {
    let dragContainer=document.createElement("div")
    dragContainer.id="dragContainer"
    dragContainer.style.position="absolute"
    dragContainer.style.left=rect.left+"px"
    dragContainer.style.top=rect.top+"px"
    dragContainer.style.width=rect.width+"px"
    dragContainer.style.height=rect.height+"px"
    dragContainer.style.backgroundColor="rgba(50,144,202,0.2)"
    dragContainer.style.zIndex="10000"
    dragContainer.style.pointerEvents="none"
    dragContainer.style.border="1px dashed blue"
    return dragContainer
}

export const vDrop:Directive= {
    mounted(el: HTMLElement, binding, vnode, prevVnode) {
        let modifiers=binding.modifiers
        let allowTypeList:EClient_Drag_Type[]=[]
        if(modifiers.file) {
            allowTypeList.push(EClient_Drag_Type.FILE)
        }
        if(modifiers.folder) {
            allowTypeList.push(EClient_Drag_Type.FOLDER)
        }
        if(modifiers.shortcut) {
            allowTypeList.push(EClient_Drag_Type.SHORTCUT)
        }
        if(modifiers.disk) {
            allowTypeList.push(EClient_Drag_Type.DISK)
        }
        let func=binding.value
        el.setAttribute("allowDrop","1")
        let isDrop:boolean
        el.addEventListener("drop",ev => {
            ev.stopPropagation()
            ev.preventDefault()
            let dragContainer=document.getElementById("dragContainer")
            if(dragContainer) {
                dragContainer.remove()
            }
            if(!isDrop) {
                return
            }
            if(ev.dataTransfer.items.length>0) {
                if(ev.dataTransfer.items[0].kind==="file") {
                    let fileList:File[]=[]
                    for(let i=0;i<ev.dataTransfer.items.length;i++) {
                        let item = ev.dataTransfer.items[i]
                        let file=item.getAsFile()
                        if(file) {
                            fileList.push(file)
                        }
                    }
                    func?.({
                        type:"external",
                        data:fileList
                    })
                } else {
                    let free=false;
                    for(let i=0;i<ev.dataTransfer.items.length;i++) {
                        let item = ev.dataTransfer.items[i]
                        if(item.type=="free") {
                            free=true
                            break
                        }
                    }
                    if(!free) {
                        func?.({
                            type:"internal",
                            data:dragElementList
                        })
                    }
                }
            }
        })
        el.addEventListener("dragover",ev => {
            ev.stopPropagation()
            ev.preventDefault()
            if(ev.currentTarget===el) {
                let target=ev.target as HTMLElement
                if(ev.dataTransfer.items.length>0) {
                    for(let i=0;i<ev.dataTransfer.items.length;i++) {
                        let item=ev.dataTransfer.items[i]
                        if(item.kind=="file") {
                            if(!allowTypeList.includes(EClient_Drag_Type.DISK)) {
                                isDrop=false
                                return
                            } else {
                                isDrop=true
                                break
                            }
                        } else if(item.kind=="string") {
                            if(item.type=="free") {
                                isDrop=false
                                return;
                            } else if(allowTypeList.includes(item.type as EClient_Drag_Type)) {
                                isDrop=true
                                break
                            } else {
                                isDrop=false
                                continue
                            }
                        }
                    }
                    if(!isDrop) {
                        return;
                    }
                    if(ev.dataTransfer.items[0].kind!="file") {
                        if(!el.contains(dragElementList[0].element)) {
                            ev.dataTransfer.dropEffect="copy"
                            isDrop=true
                            let dragContainer=document.getElementById("dragContainer")
                            let rect=el.getBoundingClientRect()
                            if(!dragContainer) {
                                dragContainer=createContainer(rect)
                                document.body.appendChild(dragContainer)
                            } else if(parseInt(dragContainer.style.left)!==rect.left || parseInt(dragContainer.style.top)!==rect.top || parseInt(dragContainer.style.width)!==rect.width || parseInt(dragContainer.style.height)!==rect.height) {
                                dragContainer.style.left=rect.left+"px"
                                dragContainer.style.top=rect.top +"px"
                                dragContainer.style.width=rect.width+"px"
                                dragContainer.style.height=rect.height+"px"
                            }
                        } else if (dragElementList[0].element.parentElement===el) {
                            ev.dataTransfer.dropEffect="none"
                            isDrop=false
                            let dragContainer=document.getElementById("dragContainer")
                            if(dragContainer) {
                                dragContainer.remove()
                            }
                        } else if(target.id=="teamOS-iconWindow") {
                            ev.dataTransfer.dropEffect="copy"
                            isDrop=true
                            let dragContainer=document.getElementById("dragContainer")
                            if(dragContainer) {
                                dragContainer.remove()
                            }
                        } else {
                            ev.dataTransfer.dropEffect="none"
                            isDrop=false
                            let dragContainer=document.getElementById("dragContainer")
                            if(dragContainer) {
                                dragContainer.remove()
                            }
                        }
                    } else {
                        ev.dataTransfer.dropEffect="none"
                        if(el.id=="teamOS-iconWindow") {
                            if(el===ev.target) {
                                ev.dataTransfer.dropEffect="copy"
                                isDrop=true
                            } else {
                                isDrop=false
                            }
                            let dragContainer=document.getElementById("dragContainer")
                            if(dragContainer) {
                                dragContainer.remove()
                            }
                        } else {
                            ev.dataTransfer.dropEffect="copy"
                            isDrop=true
                            let dragContainer=document.getElementById("dragContainer")
                            if(!dragContainer) {
                                let rect=el.getBoundingClientRect()
                                dragContainer=createContainer(rect)
                                document.body.appendChild(dragContainer)
                            }
                        }
                    }
                }
            }
        })
    }
}