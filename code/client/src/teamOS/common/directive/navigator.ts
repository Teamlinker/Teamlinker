import {Navigator} from "../component/navigator/navigator";

export const vNavigator={
    mounted(el:HTMLElement, binding, vnode, prevVnode){
        let objRouter=binding.value as {
            name:string,
            props?:object
        };
        let navigator=binding.arg as Navigator
        let modifiers=binding.modifiers;
        el.onclick=(ev:Event)=>{
            ev.stopPropagation()
            ev.preventDefault()
            if(modifiers.replace) {
                navigator.replace(objRouter.name,objRouter.props)
            } else if(modifiers.root) {
                navigator.replaceRoot(objRouter.name,objRouter.props)
            } else {
                navigator.push(objRouter.name,objRouter.props)
            }
        }
    },
}