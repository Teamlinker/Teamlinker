var g_Component={

}
var g_ComponentInstance={

}
export function DComponent (constructor: Function){
    if(!g_Component[constructor.name]) {
        g_Component[constructor.name]=constructor
    }
}

export function getComponent<T> (name:string):T {
    if(g_Component[name]) {
        if(!g_ComponentInstance[name]) {
            g_ComponentInstance[name]=new g_Component[name]()
        }
        return g_ComponentInstance[name]
    } else {
        return null
    }
}

export function initComponent(){
    for(let name in g_Component) {
        if(!g_ComponentInstance[name]) {
            g_ComponentInstance[name]=new g_Component[name]()
        }
    }
}