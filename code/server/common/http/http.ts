import "reflect-metadata";
import {Err} from '../../../common/status/error';
import {
    EServer_Common_Http_Structure_HandleParam_Category,
    IServer_Common_Http_Proxy,
    IServer_Common_Http_Req_File,
    IServer_Common_Http_Structure,
    IServer_Common_Http_Structure_HandleParam
} from "../types/http";
import {ICommon_Http_Route, ICommon_HttpApi} from './../../../common/routes/types';
import HttpContext from "./context";

var g_objRoute:{
    [param:string]:IServer_Common_Http_Structure
}={}
var g_objRouteBack:{
    [param:string]:IServer_Common_Http_Structure
}={}
var g_objParam:{
    [param:string]:IServer_Common_Http_Structure_HandleParam[]
}={}

var g_objController:{
    [param:string]:string[]
}={}
export function getHttpRoutes() {
    return g_objRoute;
}

export function DHttpController(objParam:ICommon_HttpApi) {
    return function (target) {
        let name=target.name;
        if(Array.isArray(g_objController[name]) && g_objController[name].length>0) {
            for(let obj of g_objController[name]) {
                let arr=obj.split(" ")
                arr[1]=objParam.baseUrl+arr[1]
                let newName=arr.join(" ")
                g_objRoute[newName]=g_objRouteBack[obj]
                delete g_objRouteBack[obj]
            }
        }
        g_objRouteBack={}
    }
}

export function DHttpApi(objParam:ICommon_Http_Route) {
    return function (target,propertyKey:string,desc:PropertyDescriptor) {
        let name=objParam.method+" "+objParam.path
        let key=target.constructor.name+"::"+propertyKey
        let handle=desc.value.bind(target)
        let temp:IServer_Common_Http_Structure={
            method:objParam.method,
            path:objParam.path,
            ignoreValidate:objParam.ignoreValidate,
            handle:handle,
            handleParam:g_objParam[key]
        }
        g_objRouteBack[name]=temp
        if(!g_objController[target.constructor.name]){
            g_objController[target.constructor.name]=[]
        }
        g_objController[target.constructor.name].push(name)
    }
}

export function DHttpReqParamFile(name:string){
    return function(target: Object, propertyKey: string, parameterIndex: number){
        let types=Reflect.getMetadata("design:paramtypes",target,propertyKey);
        let type=types[parameterIndex].name
        let key=target.constructor.name+"::"+propertyKey
        let obj:IServer_Common_Http_Structure_HandleParam={
            name:name,
            index:parameterIndex,
            type:type,
            category:EServer_Common_Http_Structure_HandleParam_Category.File
        }
        if(!g_objParam[key]){
            g_objParam[key]=[]
        }
        g_objParam[key].unshift(obj)
    }
}

export function DHttpReqParam(name:string,defalutValue?:any){
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

export function DHttpUser(target: Object, propertyKey: string, parameterIndex: number){
    let types=Reflect.getMetadata("design:paramtypes",target,propertyKey);
        let type=types[parameterIndex].name
        let key=target.constructor.name+"::"+propertyKey
        let obj:IServer_Common_Http_Structure_HandleParam={
            name:null,
            index:parameterIndex,
            type:type,
            category:EServer_Common_Http_Structure_HandleParam_Category.User
        }
        if(!g_objParam[key]){
            g_objParam[key]=[]
        }
        g_objParam[key].unshift(obj)
}

export function DHttpReqParamRequired(name:string){
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

export function DHttpContext(target: Object, propertyKey: string, parameterIndex: number){
    let types=Reflect.getMetadata("design:paramtypes",target,propertyKey);
        let type=types[parameterIndex].name
        let key=target.constructor.name+"::"+propertyKey
        let obj:IServer_Common_Http_Structure_HandleParam={
            name:null,
            index:parameterIndex,
            type:type,
            category:EServer_Common_Http_Structure_HandleParam_Category.Context
        }
        if(!g_objParam[key]){
            g_objParam[key]=[]
        }
        g_objParam[key].unshift(obj)
}

export function DHttpHeaderRequired(name:string){
    return function(target: Object, propertyKey: string, parameterIndex: number){
        let types=Reflect.getMetadata("design:paramtypes",target,propertyKey);
        let type=types[parameterIndex].name
        let key=target.constructor.name+"::"+propertyKey
        let obj:IServer_Common_Http_Structure_HandleParam={
            name:name,
            index:parameterIndex,
            type:type,
            category:EServer_Common_Http_Structure_HandleParam_Category.Header,
            required:true
        }
        if(!g_objParam[key]){
            g_objParam[key]=[]
        }
        g_objParam[key].unshift(obj)
    }
}

export function DHttpHeader(name:string){
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
        if(!g_objParam[key]){
            g_objParam[key]=[]
        }
        g_objParam[key].unshift(obj)
    }
}

export function DHttpContent(target: Object, propertyKey: string, parameterIndex: number){
    let types=Reflect.getMetadata("design:paramtypes",target,propertyKey);
        let type=types[parameterIndex].name
        let key=target.constructor.name+"::"+propertyKey
        let obj:IServer_Common_Http_Structure_HandleParam={
            name:null,
            index:parameterIndex,
            type:type,
            category:EServer_Common_Http_Structure_HandleParam_Category.Content
        }
        if(!g_objParam[key]){
            g_objParam[key]=[]
        }
        g_objParam[key].unshift(obj)
}


export async function handleHttpCall(obj:IServer_Common_Http_Structure,ctx:IServer_Common_Http_Proxy):Promise<IServer_Common_Http_Proxy> {
    let handle=obj.handle
    let arrHandleParam=obj.handleParam??[]
    let arr=[]
    let objContext=new HttpContext(ctx)
    for(let obj of arrHandleParam)
    {
        let name=obj.name
        if(obj.category==EServer_Common_Http_Structure_HandleParam_Category.Param)
        {
            let value=ctx.data[name]
            if(value===undefined || value===null)
            {
                if(obj.required)
                {
                    throw Err.Http.requireParam
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
            else if(obj.type=="Object" || obj.type=="Array")
            {
                if(typeof(value)=="string") {
                    try {
                        value=JSON.parse(value)
                    } catch {
                        value={}
                    }
                }
            }
            arr.push(value)
        }
        else if(obj.category==EServer_Common_Http_Structure_HandleParam_Category.Context)
        {
            arr.push(objContext)
        }
        else if(obj.category==EServer_Common_Http_Structure_HandleParam_Category.User)
        {
            arr.push(ctx.user)
        }
        else if(obj.category==EServer_Common_Http_Structure_HandleParam_Category.File)
        {
            let objFile:IServer_Common_Http_Req_File=ctx.data[name]
            arr.push(objFile)
        }
        else if(obj.category==EServer_Common_Http_Structure_HandleParam_Category.Header)
        {
            let header=ctx.headers[name]
            if(header===null || header===undefined) {
                if(obj.required) {
                    throw Err.Http.requireHeader
                }
            }
            arr.push(header)
        }
        else if(obj.category==EServer_Common_Http_Structure_HandleParam_Category.Content)
        {
            let obj={};
            for (let name in ctx.data) {
                let value = ctx.data[name]
                if (value === undefined || value === null) {
                    continue
                }
                obj[name]=value
            }
            arr.push(obj)
        }
    }
    let objRet:IServer_Common_Http_Proxy=<IServer_Common_Http_Proxy>{}
    try {
        let ret=await handle(...arr);
        objRet.data=ret;
        objRet.status=objContext.statusValue;
        objRet.headers=objContext.headerValue;
        let cookies=objContext.cookieValue;
        if(cookies.length>0) {
            objRet.headers["set-cookie"]=JSON.stringify(cookies)
        }
    } catch(err) {
        console.error(err);
        objRet.status=500;
        objRet.data=err
    }
    return objRet
}