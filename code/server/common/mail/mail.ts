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
        try {
            await this.transporter.sendMail({
                from:this.config.user,
                to,
                subject,
                html:`
<html>
    <body>
        <div style="display: flex;flex-direction: column;margin-bottom: 10px">
             <h2>
                <a href="https://team-linker.com" target="_blank">
                    TeamLinker
                </a>
             </h2>
            <span style="font-weight: bold">teamlinker is the connected cloud desktop where better work,faster collaboration</span>
        </div>
        ${content}
    </body>
</html>
`
            })
        } catch (err) {
            console.error(err)
        }

    }
}

export function getMailInstance() {
    return g_mail
}