import {Directive} from "vue";
import {selectedSelectableItems} from "./selectable";

export const vSelect:Directive={
    mounted(el:HTMLElement, binding) {
        let selectRect:HTMLDivElement
        let startX:number,startY:number
        let allSelectableList:HTMLElement[]=[]
        function mouseMove(evt:MouseEvent) {
            if(selectRect) {
                let left=Math.min(evt.x,startX)
                let top=Math.min(evt.y,startY)
                let width=Math.abs(evt.x-startX)
                let height=Math.abs(evt.y-startY)
                selectRect.style.left=left+"px";
                selectRect.style.top=top+"px"
                selectRect.style.width=width+"px"
                selectRect.style.height=height+"px"
                allSelectableList.forEach(value => {
                    let rect=value.getBoundingClientRect()
                    if(((rect.x>left && rect.x<left+width) || (rect.x+rect.width>left && rect.x+rect.width<left+width)) && ((rect.y>top && rect.y<top+height) || (rect.y+rect.height>top && rect.y+rect.height<top+height))) {
                        value.setAttribute("selected","1")
                    }
                })
            }
        }
        function mouseUp(evt:MouseEvent) {
            if(selectRect) {
                selectRect.remove()
            }
            allSelectableList=[]
            document.body.removeEventListener("mousemove",mouseMove)
            window.removeEventListener("mouseup",mouseUp)
        }
        el.addEventListener("mousedown",evt => {
            if(el===evt.target) {
                selectedSelectableItems.forEach(value => {
                    value.removeAttribute("selected")
                })
                selectRect=document.createElement("div")
                selectRect.style.position="absolute"
                selectRect.style.zIndex="10000"
                selectRect.style.border="1px solid rgb(50,144,202)"
                selectRect.style.backgroundColor="rgba(20,20,100,0.2)"
                selectRect.style.left="0px"
                selectRect.style.top="0px"
                startX=evt.x;
                startY=evt.y
                document.body.appendChild(selectRect)
                allSelectableList=Array.from(el.querySelectorAll("[selectable='1']"))
                document.body.addEventListener("mousemove",mouseMove)
                window.addEventListener("mouseup",mouseUp)
            }
        })
    }
}