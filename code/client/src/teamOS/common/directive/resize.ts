import {ITeamOS_Rect} from "../type";
import {getDesktopInstance} from "../../teamOS";

let g_parentElement:{
    [id:string]:HTMLElement
}={

}
const resizeObserver=new ResizeObserver((entries, observer)=>{
    for(let entry of entries) {
        let id=entry.target.id
        let win=getDesktopInstance().windowManager.getById(id);
        if(win && g_parentElement[id]) {
            let ele=g_parentElement[id]
            win.rect.width= `${entry.contentRect.width/ele.clientWidth*100}%`
            win.rect.height= `${entry.contentRect.height/ele.clientHeight*100}%`
        }
    }
})
export const vResize={
    mounted(el:HTMLElement, binding, vnode, prevVnode){
        el.style.overflow="hidden"
        el.style.resize="both";
        let rect:ITeamOS_Rect=binding.value;
        resizeObserver.observe(el);
        let ele:HTMLElement
        while(ele=el.parentElement) {
            if(ele.tagName.toLowerCase()=="body" || ele.style.position=="absolute" || ele.style.position=="relative") {
                g_parentElement[el.id]=ele;
                break
            }
            el=ele;
        }
    },
    unmounted(el:HTMLElement) {
        resizeObserver.unobserve(el);
        delete g_parentElement[el.id];
    }
}