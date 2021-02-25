
import {getRouteApi, handleHttpCall} from "../../common/decorator/http"
import * as path from "path"
import * as Router from "koa-router"
import {Context} from "koa";
async function route(category:string,instance:any) {
    var router=new Router();
    router.all("*",async function(ctx:Context,next:any)
    {
        let req=ctx.request;
        var bFind=false;
        var index;
        for(var key in instance)
        {
            if(instance[key].method==ctx.req.method && `/api/${category}${instance[key].path}`===(<any>ctx.req)._parsedUrl.pathname)
            {
                bFind=true;
                index=key;
                break;
            }
        }
        if(!bFind)
        {
            await next();
            return;
        }
        if(ctx.req.method=="POST" || ctx.req.method=="PUT" || ctx.req.method=="PATCH")
        {
            if(!ctx.state.p)
            {
                ctx.state.p=req.body;
            }
            if(!ctx.state.f && (<any>req).files)
            {
                let obj={},objP={}
                for(let key in (<any>req).files)
                {
                    obj[key]=(<any>req).files[key].path
                    let filePath=obj[key]
                    let i=filePath.lastIndexOf(path.sep);
                    i=filePath.lastIndexOf(path.sep,i-1);
                    filePath=filePath.substring(i).replace(/\\/g,"/");
                    objP[key]=filePath
                }
                ctx.state.f=obj

                ctx.state.p=Object.assign({},ctx.state.p,objP)
            }
        }
        else
        {
            ctx.state.p=req.query;
        }
        ctx.body=await handleHttpCall(instance[index],ctx,instance);
    });
    return router;
}

export default route