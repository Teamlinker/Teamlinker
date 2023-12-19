import {renderComponent} from "../util/component";
import ContextMenu from "../component/contextMenu.vue";
import {Directive, VNode} from "vue";

const onContextMenu=async (binding,vnode,event:MouseEvent)=>{
    let value=binding.value
    let modifiers=binding.modifiers;
    if(!value) {
        return;
    }
    let appContext=(<any>vnode).ctx.appContext;
    if(modifiers.self) {
        if(event.target!==event.currentTarget) {
            return;
        }
    }
    event.preventDefault();
    if(typeof(value)=="function") {
        value=await value()
    }
    if(value?.length>0) {
        let ele=document.createElement("div")
        ele.style.position="absolute"
        ele.style.left=event.pageX+5+"px";
        ele.style.top=event.pageY+5+"px"
        ele.style.borderRadius="3px";
        ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
        ele.style.backgroundColor=`rgb(242,242,242)`
        ele.style.zIndex="1000"
        let destroyFunc=renderComponent(ele,ContextMenu,appContext,{
            data:value
        });
        ele.style.color="rgb(93,93,93)"
        ele.tabIndex=1000;
        ele.onblur=()=>{
            destroyFunc()
            document.body.removeChild(ele);
        }
        ele.onclick=()=>{
            destroyFunc()
        }
        document.body.appendChild(ele);
        ele.focus();
    }
}
export const vMenu:Directive={

    mounted(el:HTMLElement, binding, vnode:VNode, prevVnode){
        el.oncontextmenu=onContextMenu.bind(null,binding,vnode)
    },
    updated(el:HTMLElement, binding, vnode:VNode, prevVnode) {
        el.oncontextmenu=onContextMenu.bind(null,binding,vnode)
    }
}