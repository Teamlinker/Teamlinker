import {renderComponent} from "../../../../teamOS/common/util/component";
import DialogView from "./dialogView.vue";
import {AppContext, inject, markRaw, Raw, ref} from "vue";
import DiaglogRich from "@/business/common/component/dialog/diaglogRich.vue";

export function onDialogOk(func:()=>void){
    const events:any=inject("dialogEvents");
    events.onOk=func;
}

export function onDialogClose(func:()=>void) {
    const events:any=inject("dialogEvents");
    events.onClose=func;
}
export class Dialog {
    static open<G ,U extends G extends { new(): { $props:infer U } } ? U : object>(el:HTMLElement,appContext: AppContext,title:string,component:Raw<G>,props?:U) {
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
                loading,
                parentNode:el
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
    static confirm(el:HTMLElement,appContext: AppContext,content:string):Promise<boolean> {
        return new Promise((resolve,reject)=>{
            let ele=document.createElement("div")
            let destroyFunc=renderComponent(ele,DialogView,appContext,{
                onOk,
                onClose,
                title:content,
                parentNode:el
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

    static input(el:HTMLElement,appContext: AppContext,title:string,initialData?:string):Promise<string> {
        return new Promise((resolve,reject)=>{
            let ele=document.createElement("div")
            let input={
                text:ref(initialData??"")
            }
            let destroyFunc=renderComponent(ele,DialogView,appContext,{
                onOk,
                onClose,
                title:title,
                input,
                parentNode:el
            });
            el.appendChild(ele);
            async function onOk(){
                destroyFunc();
                ele.parentNode.removeChild(ele);
                resolve(input.text.value)
            }
            function onClose(){
                destroyFunc();
                ele.parentNode.removeChild(ele);
                resolve("")
            }
        })
    }

    static inputRich(el:HTMLElement,appContext: AppContext,title:string) {
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
                component:markRaw(DiaglogRich),
                title,
                events,
                onOk,
                onClose,
                loading,
                parentNode:el
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
}