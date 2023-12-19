import {Component, getCurrentInstance, h, inject, nextTick, reactive, Ref, ref, VNode} from "vue";
import {NavigatorManager} from "./navigatorManager";
import {Base} from "../../util/base";

export enum ETeamOS_Navigator_Action {
    PUSH,
    BACK,
    GO,
    REPLACE,
    POP
}

export function onNavigatorShow(func:(action:ETeamOS_Navigator_Action)=>void) {
    let navigator=getCurrentNavigator();
    let instance=getCurrentInstance().vnode
    navigator.setFunc(instance.type["__name"],func);
}

export function getCurrentNavigator() {
    return inject("navigator",null) as Navigator
}

export function getRootNavigatorRef() {
    return inject("navigatorRootRef") as Ref<HTMLElement>
}

export function getCurrentNavigatorManager() {
    return inject("navigatorManager",null) as NavigatorManager
}

export function getCurrentNavigatorMeta<T>() {
    return inject("navigatorMeta",null) as {
        title?:string,
        data?:T
    }
}

export class Navigator extends Base{
    private name:string=""
    private nodeShowFunc=new Map<string,(action:ETeamOS_Navigator_Action)=>void>()
    private manager:NavigatorManager
    private parent:Navigator;
    private router=reactive<VNode[]>([])
    private mapComponent:{
        [name:string]:Component
    }={}
    private index=ref(-1)
    private path=reactive([])
    constructor(name:string,mapComponent:{
        [name:string]:Component
    }) {
        super();
        this.name=name;
        for(let key in mapComponent) {
            this.mapComponent[key]=mapComponent[key]
        }
    }
    getName() {
        return this.name;
    }
    setFunc(name:string,func) {
        this.nodeShowFunc.set(name,func);
    }
    getIndex() {
        return this.index;
    }
    getId() {
        return this.id;
    }
    push(name:string,props?:object,title?:string) {
        if(this.mapComponent[name]) {
            let obj=this.mapComponent[name];
            if(this.index.value==this.router.length-1) {
                this.router.push(h(obj, {
                    ...props,
                    key:Date.now()
                }))
                this.index.value++
                this.path.push(title??" ")
            } else {
                let vNode=h(obj, {
                    ...props,
                    key:Date.now()
                })
                this.path.splice(this.index.value+1,this.router.length,title??" ");
                this.router.splice(this.index.value+1,this.router.length,vNode);
                this.index.value++

            }

            this.manager.setCurrentNavigator(this);
            (async ()=> {
                await nextTick();
                let objNew=this.router[this.index.value]
                let func=this.nodeShowFunc.get(objNew.type["__name"]);
                if(func) {
                    func(ETeamOS_Navigator_Action.PUSH)
                }
            })()

        } else {
            if(this.parent) {
                this.parent.push(name,props)
            }
        }
    }
    register(name:string,component:Component) {
        this.mapComponent[name]=component;
    }
    back() {
        if(this.index.value>0) {
            this.index.value--
            this.manager.setCurrentNavigator(this);
            let objNew=this.router[this.index.value]
            let func=this.nodeShowFunc.get(objNew.type["__name"]);
            if(func) {
                func(ETeamOS_Navigator_Action.BACK)
            }
        } else {
            if(this.parent) {
                this.parent.back();
            }
        }
        // if(this.index.value>0) {
        //     this.router.splice(this.index.value)
        //     this.index.value--
        //     this.manager.setCurrentNavigator(this);
        //     let objNew=this.router[this.index.value]
        //     let func=this.nodeShowFunc.get(objNew.type["__name"]);
        //     if(func) {
        //         func(ETeamOS_Navigator_Action.BACK)
        //     }
        // } else {
        //     if(this.parent) {
        //         this.parent.back();
        //     }
        // }
    }
    replace(name:string,props?:object,title?:string) {
        if(this.mapComponent[name]) {
            let obj=this.mapComponent[name];
            this.router.splice(this.index.value,1,h(obj, {
                ...props,
                key:Date.now()
            }));
            this.path.splice(this.index.value,1,title??" ")
            this.manager.setCurrentNavigator(this);
            let objNew=this.router[this.index.value]
            let func=this.nodeShowFunc.get(objNew.type["__name"]);
            if(func) {
                func(ETeamOS_Navigator_Action.REPLACE)
            }
        } else {
            if(this.parent) {
                this.parent.replace(name,props)
            }
        }
    }
    replaceRoot(name:string,props:object,title?:string) {
        if(this.mapComponent[name]) {
            let obj=this.mapComponent[name];
            this.router.splice(0,this.router.length,h(obj,{
                ...props,
                key:Date.now()
            }))
            this.path.splice(0,this.path.length,title??" ");
            this.index.value=0;
            this.manager.setCurrentNavigator(this);
            let objNew=this.router[this.index.value]
            let func=this.nodeShowFunc.get(objNew.type["__name"]);
            if(func) {
                func(ETeamOS_Navigator_Action.REPLACE)
            }
        } else {
            if(this.parent) {
                this.parent.replaceRoot(name, props);
            }
        }
    }
    canBack(){
        if(this.index.value>0) {
            return true;
        } else {
            if(!this.parent) {
                return false;
            } else {
                return this.parent.canBack();
            }
        }
    }
    canGo() {
        if(this.index.value<this.router.length-1) {
            return true
        }
        return false;
    }
    go() {
        if(this.index.value<this.router.length-1) {
            this.index.value++
            this.manager.setCurrentNavigator(this);
            let objNew=this.router[this.index.value]
            let func=this.nodeShowFunc.get(objNew.type["__name"]);
            if(func) {
                func(ETeamOS_Navigator_Action.GO)
            }
        }
    }
    list() {
        return this.router
    }
    getParent () {
        return this.parent
    }
    setParent (parent:Navigator) {
        this.parent=parent;
    }
    setManager(manager:NavigatorManager) {
        this.manager=manager
        manager.getNavigators()[this.name]=this;
    }
    getPath(){
        return this.path
    }
    calculatePath(){
        for(let i=this.index.value;i>=0;i--) {
            let value=this.path[i]
            if(value.trim()!=="") {
                return value
            }
        }
        if(this.parent) {
            return this.parent.calculatePath()
        } else {
            return ""
        }
    }
    setCurrentPath(title:string) {
        this.path[this.index.value]=title
    }
    pop(isRoot=false) {
        if(this.index.value>0 || isRoot) {
            this.router.splice(this.index.value);
            this.path.splice(this.index.value)
            this.index.value=this.router.length-1
            this.manager.setCurrentNavigator(this);
            let objNew=this.router[this.index.value]
            if(objNew) {
                let func=this.nodeShowFunc.get(objNew.type["__name"]);
                if(func) {
                    func(ETeamOS_Navigator_Action.POP)
                }
            }
        } else {
            if(this.parent) {
                this.parent.pop()
            }
        }
    }
}