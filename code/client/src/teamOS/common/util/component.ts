import {AppContext, Component, h, render} from "vue";

export function renderComponent(el:HTMLElement,component:Component,context:AppContext,props?:object):()=>void {
    let vNode=h(component,props)
    vNode.appContext={...context}
    render(vNode,el)
    return ()=>{
        render(null,el)
        vNode=null
    }
}