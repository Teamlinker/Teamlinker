import {Notification as WebNotification} from "@arco-design/web-vue";
import {h} from "vue";

export enum NotificationType {
    CALENDAR="calendar",
    IM="im"
}
export type NotificationCallbackFunc=(type:NotificationType,data:any)=>void
export class NotificationWrapper {
    static init() {
        Notification.requestPermission()
    }
    static show(title:string,content:string,type:NotificationType,clickFunc?:NotificationCallbackFunc,data?:any,duration?:number) {
        if(document.hidden) {
            if(Notification.permission=="granted") {
                let obj=new Notification(title,{
                    body:content,
                    tag:type,
                    requireInteraction:true
                })
                if(clickFunc) {
                    obj.onclick=ev => {
                        clickFunc(type,data)
                        window.focus()
                    }
                }
            }
        } else {
            WebNotification.info({
                closable:true,
                id:type,
                title,
                content,
                ...((duration!==undefined && duration!==null) && {
                    duration
                }),
                ...(clickFunc && {
                    footer: ()=>{
                        return h(
                            'button',
                            {
                                style:{
                                    backgroundColor:'rgba(0, 120, 212)',
                                    color:'white',
                                    border:0,
                                    width:'50px',
                                    height:'30px'
                                },
                                onClick: () => {
                                    clickFunc(type,data)
                                    WebNotification.remove(type)
                                },
                            },
                            'OK',
                        );
                    }
                })
            })
        }
    }
}