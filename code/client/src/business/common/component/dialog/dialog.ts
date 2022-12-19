import {renderComponent} from "../../../../teamOS/common/util/component";
import DialogView from "./dialogView.vue";
import {AppContext, Component, inject, ref} from "vue";

export function onDialogOk(func:()=>void){
    const events:any=inject("dialogEvents");
    events.onOk=func;
}

export function onDialogClose(func:()=>void) {
    const events:any=inject("dialogEvents");
    events.onClose=func;
}
export class Dialog {
    static open(el:HTMLElement,appContext: AppContext,title:string,component:Component,props?:object) {
        return new Promise((resolve,reject)=>{
            let ele=document.createElement("div")
            const events:{
                onOk:()=>any,
                onClose:()=>void
            }={
                onOk:null,
                onClose:null
            }
            const loading=ref(false);
            let destroyFunc=renderComponent(ele,DialogView,appContext,{
                props,
                component,
                title,
                events,
                onOk,
                onClose,
                loading
            });
            el.appendChild(ele);
            async function onOk(){
                if(events.onOk) {
                    loading.value=true;
                    let ret=await events.onOk();
                    loading.value=false
                    if(ret!==false) {
                        destroyFunc();
                        ele.parentNode.removeChild(ele);
                        resolve(ret)
                    }
                } else {
                    destroyFunc();
                    ele.parentNode.removeChild(ele);
                    resolve(null);
                }
            }
            function onClose(){
                events.onClose?.();
                destroyFunc();
                ele.parentNode.removeChild(ele);
                resolve(null)
            }
        })
    }
    static confirm(el:HTMLElement,appContext: AppContext,content:string) {
        return new Promise((resolve,reject)=>{
            let ele=document.createElement("div")
            let destroyFunc=renderComponent(ele,DialogView,appContext,{
                onOk,
                onClose,
                title:content
            });
            el.appendChild(ele);
            async function onOk(){
                destroyFunc();
                ele.parentNode.removeChild(ele);
                resolve(true)
            }
            function onClose(){
                destroyFunc();
                ele.parentNode.removeChild(ele);
                resolve(false)
            }
        })
    }
}