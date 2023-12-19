import {Navigator} from "./navigator";
import {reactive, ref} from "vue";
import {Base} from "../../util/base";

export class NavigatorManager extends Base {
    canGo=ref(false)
    canBack=ref(false)
    private currentNavigator:Navigator
    private navigators:{
        [name:string]:Navigator
    }={}
    private objPath=reactive<{
        [name:string]:{
            name:string,
            props?:object
        }
    }>({})
    private rootElement:HTMLElement
    setRootElement(ele:HTMLElement) {
        this.rootElement=ele;
    }
    getRootElement() {
        return this.rootElement;
    }
    getObjPath() {
        return this.objPath;
    }
    getCurrentNavigator() {
        return this.currentNavigator
    }
    setCurrentNavigator(navigator:Navigator) {
        this.currentNavigator=navigator;
        this.canGo.value=navigator.canGo();
        this.canBack.value=navigator.canBack()
    }
    go() {
        if(this.currentNavigator) {
            this.currentNavigator.go()
        }
    }
    back() {
        if(this.currentNavigator) {
            this.currentNavigator.back()
        }
    }
    getNavigators(){
        return this.navigators;
    }
    locate(objPath:typeof this.objPath) {
        for(let key in objPath) {
            this.objPath[key]=objPath[key];
        }
    }
}