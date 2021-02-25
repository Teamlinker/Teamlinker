import { EServer_Common_Http_Structure_HandleParam_Category, IServer_Common_Http_Structure, IServer_Common_Http_Structure_HandleParam } from "../types/http";
import "reflect-metadata"
import { Context } from "koa";
import { ICommon_HttpApi } from "../../../common/routes/types";
var g_objRoute:{
    [param:string]:IServer_Common_Http_Structure[]
}={}
var g_objParam:{
    [param:string]:IServer_Common_Http_Structure_HandleParam[]
}={}
var g_objController=new WeakMap

export function HttpCookies(target: Object, propertyKey: string, parameterIndex: number){
    let key=target.constructor.name+"::"+propertyKey
    let obj:IServer_Common_Http_Structure_HandleParam={
        name:null,
        index:parameterIndex,
        type:null,
        category:EServer_Common_Http_Structure_HandleParam_Category.Cookie
    }
    if(!g_objParam[key]){
        g_objParam[key]=[]
    }
    g_objParam[key].unshift(obj)
}

export function HttpController(obj:ICommon_HttpApi){
    return function(target:Function) {
        let name=target.name.toLocaleLowerCase()
        let baseUrl=obj.baseUrl
        let category=baseUrl.substr(1).toLocaleLowerCase()
        if(!g_objRoute[name] || name===category)
        {
            if(name==category)
            {
                g_objController.set(target,category)
            }
            return
        }
        if(!g_objRoute[category])
        {
            g_objRoute[category]=[]
        }
        g_objRoute[category]=g_objRoute[category].concat(g_objRoute[name])
        delete g_objRoute[name]
        g_objController.set(target,category)
    }
}

export function HttpApi(objParam) {
    return function (target,propertyKey:string,desc:PropertyDescriptor) {
        let name=target.constructor.name.toLocaleLowerCase()
        let obj=g_objRoute[name]
        if(!obj)
        {
            g_objRoute[name]=[]
            obj=g_objRoute[name]
        }
        let key=target.constructor.name+"::"+propertyKey
        let handle=desc.value
        let temp:IServer_Common_Http_Structure={
            ...<any>objParam,
            handle:handle,
            handleParam:g_objParam[key]
        }
        obj.push(temp)
    }
}
export function HttpReqParam(name:string,defalutValue?:any){
    return function(target: Object, propertyKey: string, parameterIndex: number){
        let types=Reflect.getMetadata("design:paramtypes",target,propertyKey);
        let type=types[parameterIndex].name
        let key=target.constructor.name+"::"+propertyKey
        let obj:IServer_Common_Http_Structure_HandleParam={
            name:name,
            index:parameterIndex,
            type:type,
            category:EServer_Common_Http_Structure_HandleParam_Category.Param
        }
        if(defalutValue!==undefined)
        {
            obj["defaultValue"]=defalutValue
        }
        if(!g_objParam[key]){
            g_objParam[key]=[]
        }
        g_objParam[key].unshift(obj)
    }
}

export function HttpReqParamRequired(name:string){
    return function(target: Object, propertyKey: string, parameterIndex: number){
        let types=Reflect.getMetadata("design:paramtypes",target,propertyKey);
        let type=types[parameterIndex].name
        let key=target.constructor.name+"::"+propertyKey
        let obj:IServer_Common_Http_Structure_HandleParam={
            name:name,
            index:parameterIndex,
            type:type,
            category:EServer_Common_Http_Structure_HandleParam_Category.Param,
            required:true
        }
        if(!g_objParam[key]){
            g_objParam[key]=[]
        }
        g_objParam[key].unshift(obj)
    }
}

export function HttpReqHeader(name:string,defalutValue?:any){
    return function(target: Object, propertyKey: string, parameterIndex: number){
        let types=Reflect.getMetadata("design:paramtypes",target,propertyKey);
        let type=types[parameterIndex].name
        let key=target.constructor.name+"::"+propertyKey
        let obj:IServer_Common_Http_Structure_HandleParam={
            name:name,
            index:parameterIndex,
            type:type,
            category:EServer_Common_Http_Structure_HandleParam_Category.Header
        }
        if(defalutValue!==undefined)
        {
            obj["defaultValue"]=defalutValue
        }
        if(!g_objParam[key]){
            g_objParam[key]=[]
        }
        g_objParam[key].unshift(obj)
    }
}

export function getRouteApi(instance:Object):[string,IServer_Common_Http_Structure[]] {
    let category=g_objController.get(instance.constructor)
    let arr=g_objRoute[category]
    return [category,arr]
}

export async function handleHttpCall(obj:IServer_Common_Http_Structure,ctx:Context,instance:any):Promise<any> {
    let handle=obj.handle
    handle=handle.bind(instance)
    let arrHandleParam=obj.handleParam
    let arr=[]
    for(let obj of arrHandleParam)
    {
        let name=obj.name
        if(obj.category==EServer_Common_Http_Structure_HandleParam_Category.Param)
        {
            let value=ctx.state.p[name]
            if(value===undefined || value===null)
            {
                if(obj.required)
                {
                    throw {
                        code:1,
                        msg:"qq"
                    }
                }
                value=obj.defaultValue
                arr.push(value)
                continue
            }
            if(obj.type=="Number")
            {
                value=Number(value)
            }
            else if(obj.type=="Boolean")
            {
                if(value=="true" || (!isNaN(Number(value)) && Number(value) !=0))
                {
                    value=true
                }
                else
                {
                    value=false
                }
            }
            else if(obj.type=="Object")
            {
                value=JSON.parse(value)
            }
            arr.push(value)
        }
        else if (obj.category==EServer_Common_Http_Structure_HandleParam_Category.Header)
        {
            let value:any=ctx.headers[name]
            if(value===undefined || value===null)
            {
                value=obj.defaultValue
                arr.push(value)
                continue
            }
            if(obj.type=="Number")
            {
                value=Number(value)
            }
            else if(obj.type=="Boolean")
            {
                if(value=="true" || (!isNaN(Number(value)) && Number(value) !=0))
                {
                    value=true
                }
                else
                {
                    value=false
                }
            }
            else if(obj.type=="Object")
            {
                value=JSON.parse(value)
            }
            arr.push(value)
        }
        else if(obj.category==EServer_Common_Http_Structure_HandleParam_Category.Cookie)
        {
            arr.push(ctx.cookies)
        }
    }
    let objRet:any
    try {
        let ret=await handle(...arr);
        objRet={
            code:0,
            data:ret
        }
    }
    catch(err)
    {
        objRet={
            code:err.code,
            msg:err.msg
        }
    }
    return objRet
}