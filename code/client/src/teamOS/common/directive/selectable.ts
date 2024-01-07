import {Directive} from "vue";
import {vDrag} from "./drag";

export let selectedSelectableItems:HTMLElement[]=[]
let observerMap=new Map<HTMLElement,MutationObserver>()
window.addEventListener("click",ev => {
    let target=ev.target as HTMLElement
    selectedSelectableItems.forEach(value => {
        if(!value.contains(target)) {
            value.removeAttribute("selected")
        }
    })
})
export const vSelectable:Directive={
    mounted(el:HTMLElement,binding,vnode,prevVNode) {
        vDrag.mounted(el,binding,vnode,prevVNode)
        el.setAttribute("selectable","1")
        let observer=new MutationObserver(mutations => {
            mutations.forEach(value => {
                if(value.type==="attributes" && value.attributeName==="selected") {
                    let target=value.target as HTMLElement
                    if(target.getAttribute("selected")==="1") {
                        if(!selectedSelectableItems.includes(target)) {
                            selectedSelectableItems.push(target)
                        }
                        target.style.backgroundColor="rgba(51,146,203,0.8)"
                    } else {
                        let index=selectedSelectableItems.indexOf(target)
                        if(index>-1) {
                            selectedSelectableItems.splice(index,1)
                        }
                        target.style.backgroundColor="transparent"
                    }
                }
            })
        })
        observer.observe(el,{
            attributeFilter:["selected"]
        })
        observerMap.set(el,observer)
        el.addEventListener("click",ev => {
            if(el.getAttribute("selected")==="1") {
                el.removeAttribute("selected")
            } else {
                el.setAttribute("selected","1")
            }
        })
        el.addEventListener("mousedown",ev => {
            if(ev.button==2) {
                el.setAttribute("selected","1")
            }
        })
    },
    unmounted(el:HTMLElement) {
        let observer=observerMap.get(el)
        if(observer) {
            observer.disconnect()
            observerMap.delete(el)
        }
        let index=selectedSelectableItems.indexOf(el)
        if(index>-1) {
            selectedSelectableItems.splice(index,1)
        }
    }
}