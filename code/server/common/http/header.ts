export default class HttpHeader {
    private incomingHeaders:{
        [param:string]:string
    }={}
    private outcomingHeaders:{
        [param:string]:string
    }={}
    constructor(headers:{
        [param:string]:string
    }){
        for(let key in headers){
            this.incomingHeaders[key]=headers[key]
        }
    }
    get(key:string){
        return this.incomingHeaders[key]
    }
    set(key:string,value:string){
        this.outcomingHeaders[key]=value
    }
    get values(){
        return this.outcomingHeaders
    }
}