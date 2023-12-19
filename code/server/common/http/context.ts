import { IServer_Common_Http_Proxy } from './../types/http';
import Cookie, { IServer_Common_Cookie_Option } from "./cookie";
import HttpHeader from "./header";
import HttpStatus from "./status";

export default class HttpContext {
    private cookie:Cookie;
    private header:HttpHeader;
    private status:HttpStatus
    constructor(obj:IServer_Common_Http_Proxy){
        this.cookie=new Cookie(obj.headers["cookie"])
        this.header=new HttpHeader(obj.headers)
        this.status=new HttpStatus()
    }
    setHeader(key:string,value:string){
        this.header.set(key,value)
    }
    getHeader(key:string){
        return this.header.get(key)
    }
    getCookie(key:string){
        return this.cookie.get(key)
    }
    setCookie(key:string,value:string,option?:IServer_Common_Cookie_Option){
        this.cookie.set(key,value,option)
    }
    setStatus(status:number){
        this.status.set(status)
    }
    redirect(uri:string) {
        this.setStatus(320);
        this.setHeader("Location",uri);
    }
    get cookieValue() {
        return this.cookie.values;
    }
    get headerValue(){
        return this.header.values;
    }
    get statusValue() {
        return this.status.value;
    }
}