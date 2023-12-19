export interface IServer_Common_Cookie_Option {
    expires:string,
    maxAge:string,
    secure:boolean,
    httpOnly:boolean,
    domain:string,
    path:string,
    sameSite:string
}
export default class Cookie {
    private bChange=false;
    private incomingCookies={}
    private outcomingCookies:{
        [param:string]:{
            value:string,
            option:IServer_Common_Cookie_Option
        }
    }={}
    constructor(str:string){
        if(!str)
        {
            return;
        }
        let key_values =str.split(";")
        for(let obj of key_values) {
            obj=obj.trim()
            let key_value=obj.split("=")
            this.incomingCookies[key_value[0]]=key_value[1]
        }
    }
    get(key:string):string{
        return this.incomingCookies[key];
    }
    set(key:string,value:string,option?:IServer_Common_Cookie_Option) {
        this.bChange=true
        this.outcomingCookies[key]={
            value:value,
            option:option
        }
    }
    get isChange () {
        return this.bChange;
    }
    get values():string[] {
        let ret=[]
        for(let key in this.outcomingCookies) {
            let obj=this.outcomingCookies[key]
            let arr=[]
            arr.push(`${key}=${obj.value}`)
            if(obj.option) {
                if(obj.option.domain){
                    arr.push(`Domain=${obj.option.domain}`)
                }
                if(obj.option.path){
                    arr.push(`Path=${obj.option.path}`)
                }
                if(obj.option.expires){
                    arr.push(`Expires=${obj.option.expires}`)
                }
                if(obj.option.maxAge){
                    arr.push(`Max-Age=${obj.option.maxAge}`)
                }
                if(obj.option.secure){
                    arr.push(`Secure}`)
                }
                if(obj.option.httpOnly){
                    arr.push(`HttpOnly`)
                }
                if(obj.option.sameSite){
                    arr.push(`SameSite=${obj.option.sameSite}`)
                }
            }
            ret.push(arr.join("; "))
        }
        return ret;
    }
}