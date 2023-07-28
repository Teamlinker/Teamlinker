import {Notification as WebNotification} from "@arco-design/web-vue";
import {h} from "vue";

export enum NotificationType {
    CALENDAR="calendar",
    IM="im",
    MEETING="meeting"
}
export type NotificationCallbackFunc=(type:NotificationType,data:any)=>void
export class NotificationWrapper {
    static init() {
        Notification.requestPermission()
    }
    static show(title:string,content:string,type:NotificationType,clickFunc?:NotificationCallbackFunc,data?:any,duration?:number,style?:"warning"|"error"|"success") {
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
            WebNotification[style??"info"]({
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
    static confirm(title:string,content:string,type:NotificationType,acceptFunc?:NotificationCallbackFunc,rejectFunc?:NotificationCallbackFunc,data?:any,duration?:number) {
        if(document.hidden) {
            if(Notification.permission=="granted") {
                let obj=new Notification(title,{
                    body:content,
                    tag:type,
                    requireInteraction:true
                })
                if(acceptFunc) {
                    obj.onclick=ev => {
                        acceptFunc(type,data)
                        window.focus()
                    }
                }
                if(rejectFunc) {
                    obj.onclose=ev=>{
                        rejectFunc(type,data)
                    }
                }
            }
        } else {
            WebNotification.warning({
                id:type,
                title,
                content,
                ...((duration!==undefined && duration!==null) && {
                    duration
                }),
                footer: ()=>{
                    return h("div",[
                        h(
                            'button',
                            {
                                style:{
                                    backgroundColor:'rgba(0, 120, 212)',
                                    color:'white',
                                    border:0,
                                    width:'70px',
                                    height:'30px',
                                    marginRight:"20px",
                                    cursor:"pointer"
                                },
                                onClick: () => {
                                    acceptFunc?.(type,data)
                                    WebNotification.remove(type)
                                },
                            },
                            'Accept',
                        ),h(
                            'button',
                            {
                                style:{
                                    backgroundColor:'red',
                                    color:'white',
                                    border:0,
                                    width:'70px',
                                    height:'30px',
                                    cursor:"pointer"
                                },
                                onClick: () => {
                                    rejectFunc?.(type,data)
                                    WebNotification.remove(type)
                                },
                            },
                            'Reject',
                        )
                    ])
                }
            })
        }
    }
}