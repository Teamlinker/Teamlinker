import{ UniqueID } from 'nodejs-snowflake';

const uid = new UniqueID({
    returnNumber: true
}); 

type EXPR={
    [key:string]:string|number|boolean|bigint|{
        value?:string|number|boolean|string[]|[number,number]|bigint,
        exp?:"="|">="|"<="|">"|"<"|"<>"|"is null"|"in"|"is not null"|"between"|"%like"|"like%"|"%like%"
    }
}

export async function generateSnowId() {
    let id =await uid.asyncGetUniqueID()
    return id as bigint
}

function generateExp(objExpr?:EXPR,exprMode?:"and"|"or"):string{
    let expr="",arrExpr=[]
    if(objExpr) {
        for(let key in objExpr) {
            let value=objExpr[key]
            if(typeof(value)!="object") {
                let val=typeof(value)=="number"?value:typeof(value)=="boolean"?(value?1:0):("'"+value+"'")
                arrExpr.push(`${key}=${val}`)
            } else {
                if (value.exp == "=" || value.exp=="<=" || value.exp==">" || value.exp=="<" || value.exp=="<>" || !value.exp) {
                    if(!value.exp) {
                        value.exp="="
                    }
                    let val = typeof (value.value) == "number" ? value.value : typeof (value.value) == "boolean" ? (value.value ? 1 : 0) : ("'" + value.value + "'")
                    arrExpr.push(`${key}${value.exp}${val}`)
                } else if(value.exp=="is null") {
                    arrExpr.push(`${key} is null`)
                } else if(value.exp=="in") {
                    arrExpr.push(`${key} in (${(<string[] | number[]>value.value).map((item)=>{
                        return typeof(item)=="number"?item:("'"+item+"'")
                    }).join(",")})`)
                } else if(value.exp=="is not null") {
                    arrExpr.push(`${key} is not null`)
                } else if(value.exp=="between") {
                    let val=value.value as [number,number];
                    arrExpr.push(`${key} between ${val[0]} and ${val[1]}`)
                } else if(value.exp=="%like") {
                    arrExpr.push(`${key} like '%${value.value}'`)
                } else if(value.exp=="like%") {
                    arrExpr.push(`${key} like '${value.value}%'`)
                } else if(value.exp=="%like%") {
                    arrExpr.push(`${key} like '%${value.value}%'`)
                }
            }
        }
        expr=arrExpr.join(` ${exprMode?exprMode:"and"} `)
    }
    return expr;
}
export function generateCreateSql(table:string,obj:any):string {
    let keys="",values=""
    for(let key in obj) {
        let value=obj[key]
        keys+=key+","
        values+=((value!==null && value!==undefined)?("'"+value+"'"):"")+","
    }
    if(keys[keys.length-1]==","){
        keys=keys.substring(0,keys.length-1);
    }
    if(values[values.length-1]==","){
        values=values.substring(0,values.length-1);
    }
    return `insert into ${table} (${keys}) values (${values})`
}

export function generateQuerySql(table:string,columns:string[],objExpr?:EXPR,exprMode?:"and"|"or"):string {
    let column=""
    if(Array.isArray(columns) && columns.length>0) {
        column=columns.join(",")
    } else {
        column="*"
    }
    let expr=generateExp(objExpr,exprMode);
    return `select ${column} from ${table}${expr?(" where "+expr):""}`
}

export function generateUpdateSql(table:string,obj:any,objExpr?:EXPR,exprMode?:"and"|"or"):string {
    let arrVal=[];
    for(let key in obj) {
        let value=obj[key]
        let val;
        if(value===null) {
            val="null"
        } else if(value===undefined) {
            continue
        } else if (typeof(value)=="number") {
            val=String(value)
        } else if(typeof(value)=="boolean") {
            val=value?1:0+""
        } else {
            val="'"+value+"'"
        }
        arrVal.push(`key=${val}`)
    }
    let expr=generateExp(objExpr,exprMode);
    return `update ${table} set ${arrVal.join(",")}${expr?(" where "+expr):""}`
}

export function generateDeleteSql(table:string,objExpr?:EXPR,exprMode?:"and"|"or"):string {
    let expr=generateExp(objExpr,exprMode);
    return `delete from ${table}${expr?(" where "+expr):""}`
}