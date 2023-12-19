import {IServer_Common_Http_Proxy} from "../../common/types/http";
import {getHttpRoutes, handleHttpCall} from "../../common/http/http";

export async function proxyRequest(arg:IServer_Common_Http_Proxy) {
    let key=arg.method+ " " +arg.path
    let objRoute=getHttpRoutes()
    for(let keyRoute in objRoute) {
        if(key==keyRoute){
            try {
                let ret=await handleHttpCall(objRoute[keyRoute],arg)
                return ret
            } catch (err) {
                console.error(err);
                let obj:IServer_Common_Http_Proxy=<IServer_Common_Http_Proxy>{}
                obj.status=500
                obj.data={
                    code:err.code,
                    msg:err.msg??err.message
                }
                return obj;
            }
        }
    }
    let obj:IServer_Common_Http_Proxy=<IServer_Common_Http_Proxy>{}
    obj.status=404
    return obj;
}