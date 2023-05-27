import * as nodemailer from "nodemailer"
import {IServer_Common_Config_Mail} from "../types/config";

let g_mail:Mail
export class Mail {
    private transporter:nodemailer.Transporter
    private config:IServer_Common_Config_Mail
    constructor(config:IServer_Common_Config_Mail) {
        g_mail=this;
        this.config=config
        this.transporter=nodemailer.createTransport({
            host:config.host,
            port:config.port,
            secure:true,
            auth:{
                user:config.user,
                pass:config.pass
            }
        })
    }
    async send(to:string,subject:string,content:string) {
        await this.transporter.sendMail({
            from:this.config.user,
            to,
            subject,
            html:content
        })
    }
}

export function getMailInstance() {
    return g_mail
}